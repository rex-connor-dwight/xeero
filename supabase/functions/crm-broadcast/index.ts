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
  subject: string,
  header: string,
  body: string,
  imageUrl?: string,
  ctaLabel?: string,
  ctaUrl?: string
) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#ffffff;">
      <div style="margin-bottom:32px;display:flex;align-items:center;gap:8px;">
        <div style="width:8px;height:8px;border-radius:50%;background:#111111;"></div>
        <span style="font-size:14px;font-weight:700;color:#111111;">Xeero</span>
      </div>
      ${imageUrl ? `
        <div style="width:100%;overflow:hidden;border-radius:12px;margin-bottom:24px;">
          <img src="${imageUrl}" alt="" style="width:100%;display:block;object-fit:cover;max-height:280px;" />
        </div>
      ` : ""}
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

// Fetch ALL auth users once via pagination, build a uid -> email map.
// This replaces per-user Admin API calls, which hit rate limits and
// silently drop recipients under load.
async function buildUserEmailMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("listUsers error:", error.message);
      break;
    }
    const users = data?.users || [];
    for (const u of users) {
      if (u.email) map.set(u.id, u.email);
    }
    if (users.length < perPage) break; // last page
    page++;
  }

  console.log(`Built user email map with ${map.size} entries`);
  return map;
}

async function getEmailsForSegment(segment: string, singleEmail?: string): Promise<string[]> {
  if (segment === "single") {
    if (!singleEmail) return [];
    if (singleEmail.includes("@")) {
      console.log("Single recipient email:", singleEmail);
      return [singleEmail];
    }
    const userMap = await buildUserEmailMap();
    const email = userMap.get(singleEmail);
    console.log("Resolved single recipient email:", email);
    return email ? [email] : [];
  }

  const userMap = await buildUserEmailMap();

  if (segment === "all" || segment === "live" || segment === "draft") {
    let query = supabaseAdmin.from("profiles").select("user_id, is_live");
    if (segment === "live") query = query.eq("is_live", true);
    if (segment === "draft") query = query.eq("is_live", false);
    const { data } = await query;
    console.log(`Segment ${segment}: found ${data?.length || 0} profiles`);

    const emails: string[] = [];
    for (const p of (data || [])) {
      if (!p.user_id) continue;
      const email = userMap.get(p.user_id);
      if (email) emails.push(email);
      else console.log(`No email found for user_id: ${p.user_id}`);
    }
    console.log(`Resolved ${emails.length} emails for segment ${segment}`);
    return emails;
  }

  if (segment === "no_deck") {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("user_id, deck_url")
      .eq("is_live", true)
      .or("deck_url.is.null,deck_url.eq.");
    console.log(`no_deck: found ${data?.length || 0} profiles`);

    const emails: string[] = [];
    for (const p of (data || [])) {
      if (!p.user_id) continue;
      const email = userMap.get(p.user_id);
      if (email) emails.push(email);
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
      const email = userMap.get(p.user_id);
      if (email) emails.push(email);
    }
    console.log(`no_dataroom: resolved ${emails.length} emails`);
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

    console.log("Broadcast request:", { segment, single_email, subject });

    if (!subject || !header || !body) {
      return new Response(JSON.stringify({ error: "subject, header and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = await getEmailsForSegment(segment, single_email);
    console.log(`Total emails to send: ${emails.length}`);

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: "No recipients found for this segment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BATCH_SIZE = 50;
    const BATCH_DELAY_MS = 500;
    const html = buildEmailHtml(subject, header, body, image_url, cta_label, cta_url);

    let sent = 0;
    let failed = 0;
    let batches = 0;

    // Resend's batch endpoint accepts up to 100 emails per request and handles
    // delivery pacing internally — this replaces firing many parallel individual
    // requests, which was tripping Resend's per-second rate limit and silently
    // dropping most of the batch.
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      batches++;

      const payload = batch.map((email) => ({
        from: "Connor at Xeero <connor@xeero.me>",
        to: [email],
        subject,
        html,
      }));

      try {
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(`Batch ${batches} failed entirely:`, JSON.stringify(data));
          failed += batch.length;
        } else {
          const results = data?.data || [];
          results.forEach((r: any) => {
            if (r?.id) sent++;
            else failed++;
          });
          console.log(`Batch ${batches} — Resend accepted ${results.length} of ${batch.length}`);
        }
      } catch (batchErr) {
        console.error(`Batch ${batches} request error:`, batchErr);
        failed += batch.length;
      }

      if (i + BATCH_SIZE < emails.length) await sleep(BATCH_DELAY_MS);
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