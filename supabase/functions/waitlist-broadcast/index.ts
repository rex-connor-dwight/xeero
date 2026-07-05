import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function buildEmailHtml(
  startupName: string,
  header: string,
  body: string,
  imageUrl?: string,
  ctaLabel?: string,
  ctaUrl?: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        ${imageUrl ? `
          <div style="width:100%;overflow:hidden;">
            <img src="${imageUrl}" alt="" style="width:100%;display:block;max-height:280px;object-fit:cover;" />
          </div>
        ` : `
          <div style="width:100%;height:6px;background:linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%);"></div>
        `}

        <div style="padding:36px 32px;">
          <div style="margin-bottom:20px;">
            <span style="font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">From ${startupName}</span>
          </div>
          <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 16px 0;line-height:1.3;">${header}</h1>
          <div style="font-size:14px;color:#555555;line-height:1.8;margin:0 0 28px 0;white-space:pre-wrap;">${body}</div>
          ${ctaLabel && ctaUrl ? `
            <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
              ${ctaLabel} →
            </a>
          ` : ""}
        </div>

        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            You're receiving this because you signed up to the ${startupName} waitlist on
            <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a>.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profile_id, subject, header, body, cta_label, cta_url, image_url, reply_to } = await req.json();

    if (!profile_id || !subject || !header || !body) {
      return new Response(JSON.stringify({ error: "profile_id, subject, header and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Verify access — founder or team member with waitlist_email permission ──
    let profile: any = null;

    const { data: founderProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, startup_name, user_id")
      .eq("id", profile_id)
      .eq("user_id", user.id)
      .single();

    if (founderProfile) {
      profile = founderProfile;
    } else {
      // Check team member
      const { data: teamProfile } = await supabaseAdmin
        .from("team_profiles")
        .select("id, profile_id, permissions")
        .eq("profile_id", profile_id)
        .eq("user_id", user.id)
        .single();

      if (teamProfile && (teamProfile.permissions || []).includes("waitlist_email")) {
        const { data: fp } = await supabaseAdmin
          .from("profiles")
          .select("id, startup_name, user_id")
          .eq("id", profile_id)
          .single();
        profile = fp;
      }
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found or unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch waitlist
    const { data: waitlist } = await supabaseAdmin
      .from("waitlist")
      .select("email, name")
      .eq("profile_id", profile_id);

    const entries = waitlist || [];

    if (entries.length === 0) {
      return new Response(JSON.stringify({ error: "No waitlist subscribers found." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending to ${entries.length} waitlist subscribers for ${profile.startup_name}`);

    const html = buildEmailHtml(
      profile.startup_name,
      header,
      body,
      image_url,
      cta_label,
      cta_url
    );

    const BATCH_SIZE = 50;
    const BATCH_DELAY_MS = 500;
    let sent = 0;
    let failed = 0;
    let batches = 0;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      batches++;

      const results = await Promise.allSettled(
        batch.map((entry: any) => {
          const emailPayload: any = {
            from: `${profile.startup_name} via Xeero <waitlist@xeero.me>`,
            to: [entry.email],
            subject,
            html,
          };
          if (reply_to) emailPayload.reply_to = reply_to;

          return fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(emailPayload),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              console.error("Resend error:", JSON.stringify(data));
              throw new Error(data.message || "Send failed");
            }
            return data;
          });
        })
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") sent++;
        else { failed++; console.error("Failed:", r.reason); }
      });

      if (i + BATCH_SIZE < entries.length) await sleep(BATCH_DELAY_MS);
      console.log(`Batch ${batches} done — ${sent} sent, ${failed} failed`);
    }

    // Log to waitlist_emails
    await supabaseAdmin.from("waitlist_emails").insert({
      profile_id,
      subject,
      header,
      body,
      sent_count: sent,
    });

    return new Response(
      JSON.stringify({ success: true, sent, failed, batches, total: entries.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("waitlist-broadcast error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});