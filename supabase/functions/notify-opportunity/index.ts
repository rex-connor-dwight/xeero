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
  title: string,
  description: string,
  imageUrl?: string,
  ctaLabel?: string,
  ctaUrl?: string,
  endDate?: string
) {
  const deadline = endDate
    ? new Date(endDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : null;

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
          <div style="display:inline-block;padding:4px 12px;background:#f0fff4;border:1px solid #c6f6d5;border-radius:99px;margin-bottom:16px;">
            <span style="font-size:11px;font-weight:600;color:#38a169;text-transform:uppercase;letter-spacing:0.08em;">New Opportunity</span>
          </div>
          <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 16px 0;line-height:1.3;">${title}</h1>
          <div style="font-size:14px;color:#555555;line-height:1.8;margin:0 0 24px 0;white-space:pre-wrap;">${description}</div>
          ${deadline ? `
            <div style="padding:12px 16px;background:#fffbeb;border:1px solid #fef08a;border-radius:8px;margin-bottom:24px;">
              <p style="font-size:12px;color:#d69e2e;font-weight:600;margin:0;">Deadline: ${deadline}</p>
            </div>
          ` : ""}
          ${ctaLabel && ctaUrl ? `
            <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
              ${ctaLabel} →
            </a>
          ` : ""}
        </div>

        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            Curated for you by <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a>.
            View all opportunities in your <a href="https://xeero.me/dashboard/notifications" style="color:#aaaaaa;text-decoration:none;">dashboard</a>.
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

    const { opportunity_id, test_email } = await req.json();

    if (!opportunity_id) {
      return new Response(JSON.stringify({ error: "opportunity_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch opportunity
    const { data: opportunity, error: oppError } = await supabaseAdmin
      .from("opportunities")
      .select("*")
      .eq("id", opportunity_id)
      .single();

    if (oppError || !opportunity) {
      return new Response(JSON.stringify({ error: "Opportunity not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(
      opportunity.title,
      opportunity.description,
      opportunity.image_url,
      opportunity.cta_label,
      opportunity.cta_url,
      opportunity.end_date
    );

    // ── Test mode — single email, no notifications, no publish ──
    if (test_email) {
      console.log("Test send to:", test_email);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Connor at Xeero <connor@xeero.me>",
          to: [test_email],
          subject: `[TEST] ${opportunity.title}`,
          html,
        }),
      });
      const data = await res.json();
      console.log("Test send result:", data);
      return new Response(
        JSON.stringify({ success: true, test: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Full publish — notify all target founders ──
    let query = supabaseAdmin.from("profiles").select("id, user_id, is_live");
    if (opportunity.target === "live") query = query.eq("is_live", true);
    if (opportunity.target === "draft") query = query.eq("is_live", false);
    const { data: profiles } = await query;

    console.log(`Notifying ${profiles?.length || 0} founders`);

    const allProfiles = profiles || [];
    let emailsSent = 0;
    let notificationsCreated = 0;
    const BATCH_SIZE = 50;

    // Insert notifications
    for (const profile of allProfiles) {
      const { error: notifError } = await supabaseAdmin.from("notifications").insert({
        profile_id: profile.id,
        type: "opportunity",
        title: opportunity.title,
        body: opportunity.description,
        image_url: opportunity.image_url || null,
        cta_label: opportunity.cta_label,
        cta_url: opportunity.cta_url,
      });
      if (!notifError) notificationsCreated++;
    }

    console.log(`Created ${notificationsCreated} notifications`);

    // Send emails in batches
    for (let i = 0; i < allProfiles.length; i += BATCH_SIZE) {
      const batch = allProfiles.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (profile: any) => {
          if (!profile.user_id) return;
          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
          if (!authData?.user?.email) return;
          return fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Connor at Xeero <connor@xeero.me>",
              to: [authData.user.email],
              subject: `New opportunity: ${opportunity.title}`,
              html,
            }),
          });
        })
      );

      results.forEach((r) => { if (r.status === "fulfilled") emailsSent++; });
      if (i + BATCH_SIZE < allProfiles.length) await sleep(500);
    }

    // Mark as published
    await supabaseAdmin
      .from("opportunities")
      .update({ published: true })
      .eq("id", opportunity_id);

    return new Response(
      JSON.stringify({ success: true, emails_sent: emailsSent, notifications_created: notificationsCreated }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("notify-opportunity error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});