import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function verifyPaystackSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === signature;
}

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    const isValid = await verifyPaystackSignature(body, signature, PAYSTACK_SECRET_KEY!);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const data = event.data;
    const metadata = data.metadata;

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

    // Save supporter
    await supabaseAdmin.from("supporters").insert({
      profile_id,
      supporter_name,
      supporter_email,
      amount: amount_usd,
      tier,
      is_public: is_public ?? true,
      paystack_reference: data.reference,
    });

    // Fetch founder info
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("startup_name, founder_name, slug, user_id")
      .eq("id", profile_id)
      .single();

    // Email supporter
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
            <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px 0;">You backed a founder. That means something.</h1>
            <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 24px 0;">
              Hey ${supporter_name}, you just supported <strong>${profile?.startup_name}</strong> with $${amount_usd}.
              You're now one of their earliest believers.
            </p>
            <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 24px 0;">
              The founder will be in touch about early access. Keep an eye on your inbox.
            </p>
            <a href="https://xeero.me/${profile?.slug}" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
              View Their Profile →
            </a>
            <div style="margin-top:40px;padding-top:24px;border-top:1px solid #f0f0f0;">
              <p style="font-size:12px;color:#cccccc;margin:0;">Powered by Xeero · xeero.me</p>
            </div>
          </div>
        `,
      }),
    });

    // Email founder
    if (profile?.user_id) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
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
                <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 8px 0;">Someone believes in what you're building.</h1>
                <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 16px 0;">
                  <strong>${supporter_name}</strong> just supported <strong>${profile?.startup_name}</strong> with <strong>$${amount_usd}</strong>.
                </p>
                <p style="font-size:14px;color:#666666;line-height:1.7;margin:0 0 24px 0;">
                  Their email is <strong>${supporter_email}</strong>. Reach out and tell them what you're building.
                </p>
                <a href="https://xeero.me/dashboard/supporters" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
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