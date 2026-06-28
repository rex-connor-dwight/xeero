import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();

    // Verify Paystack signature
    const signature = req.headers.get("x-paystack-signature");
    const hash = createHmac("sha512", PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const data = event.data;
    const metadata = data.metadata;

    // Only handle support payments
    if (!metadata?.profile_id || !data.reference.startsWith("xeero_support_")) {
      return new Response("OK", { status: 200 });
    }

    const {
      profile_id,
      amount_usd,
      tier,
      supporter_name,
      supporter_email,
      is_public,
    } = metadata;

    // Save supporter to database
    await supabaseAdmin.from("supporters").insert({
      profile_id,
      supporter_name,
      supporter_email,
      amount: amount_usd,
      tier,
      is_public: is_public ?? true,
      paystack_reference: data.reference,
    });

    // Fetch founder info for emails
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("startup_name, founder_name, slug")
      .eq("id", profile_id)
      .single();

    // Email supporter — thank you
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [supporter_email],
        subject: `You just supported ${profile?.startup_name}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#ffffff;">
            <div style="margin-bottom:32px;">
              <div style="width:40px;height:40px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                <div style="width:20px;height:20px;border-radius:50%;background:#111111;"></div>
              </div>
            </div>
            <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px 0;">
              You backed a founder. That means something.
            </h1>
            <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 24px 0;">
              Hey ${supporter_name}, you just supported <strong>${profile?.startup_name}</strong> with $${amount_usd}. 
              You're now one of their earliest believers — and that's not nothing.
            </p>
            <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 24px 0;">
              The founder will be in touch about early access. Keep an eye on your inbox.
            </p>
            <a href="https://xeero.me/${profile?.slug}" 
              style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
              View Their Profile →
            </a>
            <div style="margin-top:40px;padding-top:24px;border-top:1px solid #f0f0f0;">
              <p style="font-size:12px;color:#cccccc;margin:0;">Powered by Xeero · xeero.me</p>
            </div>
          </div>
        `,
      }),
    });

    // Email founder — someone supported you
    const { data: founderAuth } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("id", profile_id)
      .single();

    if (founderAuth?.user_id) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        founderAuth.user_id
      );

      if (authUser?.user?.email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Xeero <noreply@xeero.me>",
            to: [authUser.user.email],
            subject: `${supporter_name} just supported you with $${amount_usd}`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#ffffff;">
                <div style="margin-bottom:32px;">
                  <div style="width:40px;height:40px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                    <div style="width:20px;height:20px;border-radius:50%;background:#111111;"></div>
                  </div>
                </div>
                <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px 0;">
                  Someone believes in what you're building.
                </h1>
                <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 16px 0;">
                  <strong>${supporter_name}</strong> just supported <strong>${profile?.startup_name}</strong> with <strong>$${amount_usd}</strong>.
                </p>
                <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 24px 0;">
                  Their email is <strong>${supporter_email}</strong>. Reach out and tell them what you're building. They're expecting early access.
                </p>
                <a href="https://xeero.me/dashboard/supporters"
                  style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
                  View All Supporters →
                </a>
                <div style="margin-top:40px;padding-top:24px;border-top:1px solid #f0f0f0;">
                  <p style="font-size:12px;color:#cccccc;margin:0;">Powered by Xeero · xeero.me</p>
                </div>
              </div>
            `,
          }),
        });
      }
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("support-webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});