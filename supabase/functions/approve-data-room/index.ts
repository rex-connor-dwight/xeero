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

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { request_id } = await req.json();

    if (!request_id) {
      return new Response(
        JSON.stringify({ error: "request_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set expiry 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update the request
    const { data: request, error: updateError } = await supabaseAdmin
      .from("data_room_requests")
      .update({
        status: "approved",
        token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", request_id)
      .select("*, profiles(startup_name, slug, founder_name)")
      .single();

    if (updateError || !request) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessLink = `https://xeero.me/${request.profiles.slug}?drtoken=${request.access_token}`;
    const startupName = request.profiles.startup_name;
    const founderName = request.profiles.founder_name;
    const investorName = request.investor_name;
    const investorEmail = request.investor_email;

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [investorEmail],
        subject: `You've been granted access to ${startupName}'s data room`,
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
                    <tr>
                      <td style="background:linear-gradient(135deg,#111111 0%,#1a1a2e 60%,#16213e 100%);padding:32px 40px;">
                        <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Xeero</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111111;">You've been granted access</p>
                        <p style="margin:0 0 24px 0;font-size:15px;color:#666666;line-height:1.6;">
                          Hi ${investorName}, ${founderName} from <strong>${startupName}</strong> has approved your request to view their data room.
                        </p>
                        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #f0f0f0;">
                          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">Startup</p>
                          <p style="margin:0 0 16px 0;font-size:15px;font-weight:600;color:#111111;">${startupName}</p>
                          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">Access expires</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#e53e3e;">24 hours from now</p>
                        </div>
                        <a href="${accessLink}" style="display:block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:600;text-align:center;margin-bottom:16px;">
                          View Data Room →
                        </a>
                        <p style="margin:0 0 24px 0;font-size:12px;color:#aaaaaa;text-align:center;word-break:break-all;">
                          Or copy this link: ${accessLink}
                        </p>
                        <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;border-top:1px solid #f0f0f0;padding-top:20px;">
                          This link expires in 24 hours. If it expires, contact the founder directly to request a new link. Do not share this link with anyone else.
                        </p>
                      </td>
                    </tr>
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
      JSON.stringify({
        success: true,
        access_token: request.access_token,
        token_expires_at: request.token_expires_at,
      }),
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