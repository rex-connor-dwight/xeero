import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getUsdToNgnRate(): Promise<number> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    return data.rates.NGN || 1500;
  } catch {
    return 1500;
  }
}

function roundUpToNearest500(amount: number): number {
  return Math.ceil(amount / 500) * 500;
}

async function validateCoupon(code: string): Promise<{ valid: boolean; discount: number; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .single();

  if (error || !data) {
    return { valid: false, discount: 0, error: "Invalid or expired coupon code." };
  }

  if (data.max_uses !== null && data.uses >= data.max_uses) {
    return { valid: false, discount: 0, error: "This coupon has reached its usage limit." };
  }

  return { valid: true, discount: data.discount_percent };
}

async function incrementCouponUse(code: string) {
  await supabaseAdmin.rpc("increment_coupon_uses", { coupon_code: code.toUpperCase().trim() });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, email, profile_id, coupon_code } = await req.json();

    if (!user_id || !email || !profile_id) {
      return new Response(
        JSON.stringify({ error: "user_id, email and profile_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check profile is not already live
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_live")
      .eq("id", profile_id)
      .single();

    if (profile?.is_live) {
      return new Response(
        JSON.stringify({ error: "Profile is already live" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate coupon if provided
    let discountPercent = 0;
    if (coupon_code?.trim()) {
      const coupon = await validateCoupon(coupon_code);
      if (!coupon.valid) {
        return new Response(
          JSON.stringify({ error: coupon.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      discountPercent = coupon.discount;
    }

    // Get live exchange rate
    const rate = await getUsdToNgnRate();

    // $9 USD → NGN, rounded up to nearest ₦500
    const usdPrice = 9;
    const ngnBase = roundUpToNearest500(usdPrice * rate);

    // Apply discount
    const discountAmount = Math.floor(ngnBase * (discountPercent / 100));
    const ngnFinal = ngnBase - discountAmount;

    // If 100% off — skip Paystack, go live directly
    if (ngnFinal === 0 || discountPercent === 100) {
      await supabaseAdmin
        .from("profiles")
        .update({ is_live: true })
        .eq("id", profile_id);

      // Increment coupon use
      if (coupon_code?.trim()) {
        await supabaseAdmin
          .from("coupons")
          .update({ uses: supabaseAdmin.rpc("increment", {}) })
          .eq("code", coupon_code.toUpperCase().trim());

        // Simpler direct increment
        await supabaseAdmin.from("coupons").update({
          uses: (await supabaseAdmin
            .from("coupons")
            .select("uses")
            .eq("code", coupon_code.toUpperCase().trim())
            .single()
          ).data?.uses + 1
        }).eq("code", coupon_code.toUpperCase().trim());
      }

      return new Response(
        JSON.stringify({ free: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Paystack amount in kobo
    const amountInKobo = ngnFinal * 100;
    const reference = `xeero_${profile_id}_${Date.now()}`;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference,
          metadata: {
            profile_id,
            user_id,
            coupon_code: coupon_code || null,
            usd_price: usdPrice,
            ngn_amount: ngnFinal,
            custom_fields: [
              {
                display_name: "Profile ID",
                variable_name: "profile_id",
                value: profile_id,
              },
            ],
          },
          callback_url: "https://xeero.me/payment/verify",
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: "Failed to initialize payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment coupon use
    if (coupon_code?.trim()) {
      const { data: currentCoupon } = await supabaseAdmin
        .from("coupons")
        .select("uses")
        .eq("code", coupon_code.toUpperCase().trim())
        .single();

      await supabaseAdmin
        .from("coupons")
        .update({ uses: (currentCoupon?.uses || 0) + 1 })
        .eq("code", coupon_code.toUpperCase().trim());
    }

    return new Response(
      JSON.stringify({
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        ngn_amount: ngnFinal,
        ngn_original: ngnBase,
        usd_price: usdPrice,
        rate: Math.round(rate),
        discount_percent: discountPercent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("initialize-payment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});