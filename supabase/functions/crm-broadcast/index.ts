import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAILS = ["connor@xeero.me"];
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function buildEmailHtml(
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
            You're receiving this because you have an account on
            <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a>.
            Built for African founders.
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

async function getEmailsForSegment(segment: string, singleEmail?: string): Promise<string[]> {
  if (segment === "single") {
    return singleEmail ? [singleEmail] : [];
  }

  if (segment === "all" || segment === "live" || segment === "draft") {
    let query = supabaseAdmin.from("profiles").select("user_id, is_live");
    if (segment === "live") query = query.eq("is_live", true);
    if (segment === "draft") query = query.eq("is_live", false);
    const { data } = await query;
    const emails: string[] = [];
    for (const p of (data || [])) {
      if (!p.user_id) continue;
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(p.user_id);
      if (authData?.user?.email) emails.push(authData.user.email);
    }
    return emails;
  }

  if (segment === "no_deck") {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("user_id, deck_url")
      .eq("is_live", true)
      .or("deck_url.is.null,deck_url.eq.");
    const emails: string[] = [];
    for (const p of (data || [])) {
      if (!p.user_id) continue;
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(p.user_id);
      if (authData?.user?.email) emails.push(authData.user.email);
    }
    return emails;
  }

  if (segment === "no_dataroom") {
    const { data: allProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id")
      .eq("is_live", true);

    const { data: docsProfiles } = await supabaseAdmin
      .from("data_room_documents")
      .select("profile_id")
      .eq("status", "complete");

    const profilesWithDocs = new Set((docsProfiles || []).map((d: any) => d.profile_id));
    const emails: string[] = [];

    for (const p of (allProfiles || [])) {
      if (profilesWithDocs.has(p.id)) continue;
      if (!p.user_id) continue;
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(p.user_id);
      if (authData?.user?.email) emails.push(authData.user.email);
    }
    return emails;
  }

  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || "")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      segment,
      single_email,
      subject,
      header,
      body,
      cta_label,
      cta_url,
      image_url,
    } = await req.json();

    if (!subject || !header || !body) {
      return new Response(JSON.stringify({ error: "subject, header and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = await getEmailsForSegment(segment, single_email);

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients found for this segment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BATCH_SIZE = 50;
    const BATCH_DELAY_MS = 500;
    const html = buildEmailHtml(header, body, image_url, cta_label, cta_url);

    let sent = 0;
    let failed = 0;
    let batches = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      batches++;

      const results = await Promise.allSettled(
        batch.map((email) =>
          fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Connor at Xeero <connor@xeero.me>",
              to: [email],
              subject,
              html,
            }),
          })
        )
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") sent++;
        else failed++;
      });

      if (i + BATCH_SIZE < emails.length) await sleep(BATCH_DELAY_MS);
      console.log(`Batch ${batches} done — ${sent} sent, ${failed} failed`);
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed, batches, total: emails.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("crm-broadcast error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});