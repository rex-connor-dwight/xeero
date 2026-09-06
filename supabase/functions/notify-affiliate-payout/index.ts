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

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  paypal: "PayPal",
  account_credit: "Account Credit",
  other: "Other",
};

function buildEmailHtml(founderName: string, startupName: string, amount: number, method: string, paidAt: string) {
  const receiptId = `XR-${Date.now().toString(36).toUpperCase()}`;
  const dateFormatted = new Date(paidAt).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0f0f0;">

        <!-- Header: logo on white -->
        <div style="padding:28px 32px 20px 32px;border-bottom:1px solid #f0f0f0;">
          <img src="https://xeero.me/xeeroLogo.png" alt="Xeero" width="24" height="24" style="display:block;margin-bottom:14px;">
          <span style="display:inline-block;font-size:11px;font-weight:600;color:#38a169;background:#f0fff4;border:1px solid #c6f6d5;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;">
            Payment Sent
          </span>
        </div>

        <!-- Receipt body -->
        <div style="padding:28px 32px;">
          <p style="font-size:14px;color:#555555;line-height:1.7;margin:0 0 24px 0;">
            Hi ${founderName}, your referral payout for ${startupName} has been sent. Here's your receipt.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0;">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:12px;color:#999999;">Receipt No.</td>
              <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:13px;color:#111111;text-align:right;font-weight:600;">${receiptId}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:12px;color:#999999;">Date</td>
              <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:13px;color:#111111;text-align:right;">${dateFormatted}</td>
            </tr>
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:12px;color:#999999;">Description</td>
              <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:13px;color:#111111;text-align:right;">Referral reward</td>
            </tr>
            <tr>
              <td style="padding:14px 0;font-size:12px;color:#999999;">Payout Method</td>
              <td style="padding:14px 0;font-size:13px;color:#111111;text-align:right;">${METHOD_LABELS[method] || method}</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr>
              <td style="font-size:14px;font-weight:700;color:#111111;">Total Paid</td>
              <td style="font-size:22px;font-weight:700;color:#111111;text-align:right;">$${amount.toFixed(2)}</td>
            </tr>
          </table>

          <a href="https://xeero.me/dashboard/settings" style="display:block;text-align:center;margin-top:28px;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
            View Your Referrals →
          </a>
        </div>

        <div style="padding:18px 32px;background:#fafafa;border-top:1px solid #f0f0f0;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            This is an automated receipt from
            <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a>. Keep it for your records.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { payout_id } = await req.json();
    if (!payout_id) {
      return new Response(JSON.stringify({ error: "payout_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: payout } = await supabaseAdmin
      .from("affiliate_payouts")
      .select("*, profiles(founder_name, startup_name, user_id)")
      .eq("id", payout_id)
      .single();

    if (!payout) {
      return new Response(JSON.stringify({ error: "Payout not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(payout.profiles.user_id);
    const founderEmail = authData?.user?.email;

    if (!founderEmail) {
      return new Response(JSON.stringify({ error: "Could not resolve founder email" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(
      payout.profiles.founder_name,
      payout.profiles.startup_name,
      payout.amount_usd,
      payout.payout_method,
      new Date().toISOString()
    );

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [founderEmail],
        subject: `Your $${payout.amount_usd.toFixed(2)} referral payout has been sent`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errData = await emailRes.json();
      console.error("Resend error:", errData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("notify-affiliate-payout error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});