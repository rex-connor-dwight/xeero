import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { profile_id, investor_name, investor_email, note } = await req.json();

    if (!profile_id || !investor_name || !investor_email) {
      return new Response(
        JSON.stringify({ error: "profile_id, investor_name and investor_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile + founder email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("startup_name, slug, founder_name, user_id")
      .eq("id", profile_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get founder's email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      profile.user_id
    );

    if (userError || !userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Founder email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const founderEmail = userData.user.email;
    const founderName = profile.founder_name || "Founder";
    const startupName = profile.startup_name;
    const dashboardLink = "https://xeero.me/dashboard/notifications";

    // Send email to founder
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [founderEmail],
        subject: `${investor_name} just requested access to your data room`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0f0f0;">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#111111 0%,#1a1a2e 60%,#16213e 100%);padding:32px 40px;">
                        <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Xeero</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111111;">
                          Someone wants into your data room
                        </p>
                        <p style="margin:0 0 24px 0;font-size:15px;color:#666666;line-height:1.6;">
                          Hi ${founderName}, an investor just requested access to <strong>${startupName}</strong>'s data room. Log in to review and approve or decline.
                        </p>

                        <!-- Investor details -->
                        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #f0f0f0;">
                          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">Name</p>
                          <p style="margin:0 0 16px 0;font-size:15px;font-weight:600;color:#111111;">${investor_name}</p>

                          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
                          <p style="margin:0 0 16px 0;font-size:15px;color:#111111;">${investor_email}</p>

                          ${note ? `
                          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">Their note</p>
                          <p style="margin:0;font-size:14px;color:#444444;line-height:1.6;font-style:italic;">"${note}"</p>
                          ` : ""}
                        </div>

                        <a href="${dashboardLink}"
                          style="display:block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:600;text-align:center;margin-bottom:16px;">
                          Review Request →
                        </a>

                        <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;border-top:1px solid #f0f0f0;padding-top:20px;">
                          This investor is waiting for your response. Approve to send them a 24-hour access link, or decline to close the request.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;background:#f9f9f9;border-top:1px solid #f0f0f0;">
                        <p style="margin:0;font-size:12px;color:#cccccc;text-align:center;">
                          Powered by <a href="https://xeero.me" style="color:#111111;font-weight:600;text-decoration:none;">Xeero</a>
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const emailError = await emailRes.json();
      console.error("Resend error:", emailError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});