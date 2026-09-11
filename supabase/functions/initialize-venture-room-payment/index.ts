import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
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

    const { data: registration, error: regError } = await supabaseAdmin
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

    if (regError || !registration) {
      console.error("Registration insert failed:", regError);
      return new Response(JSON.stringify({ error: "Failed to create registration" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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