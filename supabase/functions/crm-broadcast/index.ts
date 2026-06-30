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

function buildEmailHtml(subject: string, header: string, body: string, ctaLabel?: string, ctaUrl?: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#ffffff;">
      <div style="margin-bottom:32px;display:flex;align-items:center;gap:8px;">
        <div style="width:8px;height:8px;border-radius:50%;background:#111111;"></div>
        <span style="font-size:14px;font-weight:700;color:#111111;">Xeero</span>
      </div>
      <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 12px 0;line-height:1.3;">${header}</h1>
      <div style="font-size:14px;color:#555555;line-height:1.8;margin:0 0 28px 0;white-space:pre-wrap;">${body}</div>
      ${ctaLabel && ctaUrl ? `
        <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;margin-bottom:32px;">${ctaLabel}</a>
      ` : ""}
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #f0f0f0;">
        <p style="font-size:12px;color:#cccccc;margin:0;">You're receiving this because you have an account on Xeero. · <a href="https://xeero.me" style="color:#cccccc;">xeero.me</a></p>
      </div>
    </div>
  `;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify admin
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
      segment,        // "all" | "live" | "draft" | "single"
      single_email,   // used when segment === "single"
      subject,
      header,
      body,
      cta_label,
      cta_url,
    } = await req.json();

    if (!subject || !header || !body) {
      return new Response(JSON.stringify({ error: "subject, header and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch recipients ──
    let emails: string[] = [];

    if (segment === "single") {
      if (!single_email) {
        return new Response(JSON.stringify({ error: "single_email is required for single segment" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      emails = [single_email];

    } else {
      // Fetch profiles based on segment
      let query = supabaseAdmin
        .from("profiles")
        .select("user_id, is_live");

      if (segment === "live") {
        query = query.eq("is_live", true);
      } else if (segment === "draft") {
        query = query.eq("is_live", false);
      }
      // "all" — no filter

      const { data: profiles } = await query;
      const userIds = (profiles || []).map((p: any) => p.user_id).filter(Boolean);

      // Fetch emails from auth.users via admin
      for (const uid of userIds) {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (authData?.user?.email) {
          emails.push(authData.user.email);
        }
      }
    }

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients found for this segment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Batch send ──
    const BATCH_SIZE = 50;
    const BATCH_DELAY_MS = 500;
    const html = buildEmailHtml(subject, header, body, cta_label, cta_url);

    let sent = 0;
    let failed = 0;
    let batches = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      batches++;

      // Send individually so each gets personalized from address
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

      // Delay between batches
      if (i + BATCH_SIZE < emails.length) {
        await sleep(BATCH_DELAY_MS);
      }

      console.log(`Batch ${batches} sent — ${sent} sent, ${failed} failed so far`);
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