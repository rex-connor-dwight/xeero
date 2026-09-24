import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TICKET_PRICE_NGN = 25000;

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VR-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { full_name, email, phone, startup_name, role, profile_id, coupon_code } = await req.json();

    if (!full_name || !email) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let finalAmount = TICKET_PRICE_NGN;
    let appliedCoupon: string | null = null;

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (coupon && (coupon.max_uses === null || coupon.uses < coupon.max_uses)) {
        finalAmount = Math.round(TICKET_PRICE_NGN * (1 - coupon.discount_percent / 100));
        appliedCoupon = coupon.code;
        await supabaseAdmin
          .from("coupons")
          .update({ uses: coupon.uses + 1 })
          .eq("code", coupon.code);
      }
    }

    let ticketCode = generateTicketCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: clash } = await supabaseAdmin
        .from("venture_room_registrations")
        .select("id")
        .eq("ticket_code", ticketCode)
        .maybeSingle();
      if (!clash) break;
      ticketCode = generateTicketCode();
    }

    // Check for an existing row on this email first, so a returning person
    // gets their existing record updated instead of creating a duplicate.
    const { data: existing } = await supabaseAdmin
      .from("venture_room_registrations")
      .select("id, payment_status")
      .ilike("email", email)
      .maybeSingle();

    if (existing?.payment_status === "paid") {
      return new Response(
        JSON.stringify({ error: "This email has already registered and paid for The Venture Room." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let registration;
    let regError;

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("venture_room_registrations")
        .update({
          full_name, phone: phone || null,
          startup_name: startup_name || null,
          role: role || null,
          profile_id: profile_id || null,
          ticket_code: ticketCode,
          amount_ngn: finalAmount,
          payment_status: "pending",
        })
        .eq("id", existing.id)
        .select()
        .single();
      registration = data;
      regError = error;
    } else {
      const { data, error } = await supabaseAdmin
        .from("venture_room_registrations")
        .insert({
          full_name, email, phone: phone || null,
          startup_name: startup_name || null,
          role: role || null,
          profile_id: profile_id || null,
          ticket_code: ticketCode,
          amount_ngn: finalAmount,
          payment_status: "pending",
        })
        .select()
        .single();
      registration = data;
      regError = error;
    }

    if (regError || !registration) {
      console.error("Registration insert failed:", regError);
      return new Response(JSON.stringify({ error: "Failed to create registration" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // A 100%-off coupon brings the price to zero — Paystack rejects zero-amount
    // charges, so skip the payment gateway entirely and mark this as paid directly.
    if (finalAmount === 0) {
      await supabaseAdmin
        .from("venture_room_registrations")
        .update({ payment_status: "paid" })
        .eq("id", registration.id);

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "The Venture Room <noreply@xeero.me>",
          to: [email],
          subject: "Your Venture Room ticket code",
          html: `
            <!DOCTYPE html><html><head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;background:#F7F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #30166015;">
                <div style="background:#301660;padding:32px;text-align:center;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:#F1A9FA;letter-spacing:0.08em;text-transform:uppercase;">The Venture Room</p>
                </div>
                <div style="padding:32px;text-align:center;">
                  <h1 style="font-size:20px;font-weight:700;color:#301660;margin:0 0 8px 0;">You're in, ${full_name.split(" ")[0]}.</h1>
                  <p style="font-size:13px;color:#301660;opacity:0.7;line-height:1.7;margin:0 0 24px 0;">
                    26 September 2026 &middot; Bridge by Obsidian, Yaba, Lagos
                  </p>
                  <div style="background:#F1A9FA30;border:1px solid #F1A9FA;border-radius:14px;padding:18px;margin-bottom:24px;">
                    <p style="font-size:11px;font-weight:700;color:#301660;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px 0;">Your Ticket Code</p>
                    <p style="font-size:22px;font-weight:700;color:#301660;letter-spacing:0.05em;margin:0;">${ticketCode}</p>
                  </div>
                  <p style="font-size:12px;color:#301660;opacity:0.6;line-height:1.6;margin:0;">Bring this code with you to check in at the venue.</p>
                </div>
              </div>
            </body></html>
          `,
        }),
      });

      if (!emailRes.ok) {
        console.error("Failed to send free-ticket confirmation email:", await emailRes.json());
      }

      return new Response(
        JSON.stringify({
          registration_id: registration.id,
          ticket_code: ticketCode,
          ngn_amount: 0,
          applied_coupon: appliedCoupon,
          free: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reference = `xeero_ventureroom_${registration.id}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: finalAmount * 100,
        reference,
        metadata: {
          registration_id: registration.id,
          ticket_code: ticketCode,
          coupon_code: appliedCoupon,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error("Paystack init failed:", paystackData);
      return new Response(JSON.stringify({ error: "Payment initialization failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin
      .from("venture_room_registrations")
      .update({ paystack_reference: reference })
      .eq("id", registration.id);

    return new Response(
      JSON.stringify({
        registration_id: registration.id,
        ticket_code: ticketCode,
        reference,
        ngn_amount: finalAmount,
        applied_coupon: appliedCoupon,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("initialize-venture-room-payment error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});