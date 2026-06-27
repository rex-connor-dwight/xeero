import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [email],
        subject: "Welcome to Xeero. Let's build.",
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
                        <div style="display:flex;align-items:center;gap:10px;">
                          <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;">
                            <div style="width:16px;height:16px;border-radius:50%;background:#ffffff;"></div>
                          </div>
                          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Xeero</p>
                        </div>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">

                        <p style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#111111;">
                          Welcome. Let's build something real.
                        </p>

                        <p style="margin:0 0 24px 0;font-size:15px;color:#666666;line-height:1.7;">
                          I built Xeero because I kept watching brilliant founders fail to raise, not because their ideas were bad, but because they couldn't present them properly. No data room. No clean profile. No professional link to share with investors.
                        </p>

                        <p style="margin:0 0 24px 0;font-size:15px;color:#666666;line-height:1.7;">
                          Most tools are built for founders who already have money. Xeero is built for founders who are still figuring it out. The ones building in Lagos, Nairobi, Accra, and everywhere in between. The ones with a real idea and the hunger to make it happen.
                        </p>

                        <p style="margin:0 0 24px 0;font-size:15px;color:#666666;line-height:1.7;">
                          Here's what you can do with Xeero right now:
                        </p>

                        <!-- Feature list -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                          ${[
                            ["🔗", "One clean link", "Your entire startup at xeero.me/yourname"],
                            ["📋", "Startup profile", "Problem, solution, traction, business model"],
                            ["👤", "Founder CV", "Show investors who you are, not just what you're building"],
                            ["📧", "Built-in waitlist", "Collect early users before you build"],
                            ["🔒", "Data room", "Share documents only with investors you approve"],
                            ["💡", "Idea validation", "Know if your idea is ready before you build"],
                          ].map(([icon, title, desc]) => `
                            <tr>
                              <td style="padding:8px 0;border-bottom:1px solid #f5f5f5;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="font-size:18px;padding-right:12px;vertical-align:top;">${icon}</td>
                                    <td>
                                      <p style="margin:0 0 2px 0;font-size:14px;font-weight:600;color:#111111;">${title}</p>
                                      <p style="margin:0;font-size:13px;color:#888888;">${desc}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          `).join("")}
                        </table>

                        <p style="margin:0 0 28px 0;font-size:15px;color:#666666;line-height:1.7;">
                          Build your profile for free. When you're ready to go public, it's a one-time $9 to publish your link and unlock everything. No subscription. No hidden fees.
                        </p>

                        <a href="https://xeero.me/dashboard"
                          style="display:block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:600;text-align:center;margin-bottom:24px;">
                          Build Your Profile →
                        </a>

                        <p style="margin:0;font-size:14px;color:#888888;line-height:1.7;border-top:1px solid #f0f0f0;padding-top:20px;">
                          If you have any questions, just reply to this email. I read every message.
                        </p>

                        <p style="margin:12px 0 0 0;font-size:14px;color:#111111;font-weight:600;">
                          Let's build. 🚀
                        </p>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;background:#f9f9f9;border-top:1px solid #f0f0f0;">
                        <p style="margin:0;font-size:12px;color:#cccccc;text-align:center;">
                          Powered by <a href="https://xeero.me" style="color:#111111;font-weight:600;text-decoration:none;">Xeero</a>
                          · You're receiving this because you signed up at xeero.me
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
    console.error("welcome-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});