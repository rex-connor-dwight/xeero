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

const TEAMS_PRICE_USD = 29.99;

async function getUsdToNgnRate(): Promise<number> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    return data.rates.NGN || 1500;
  } catch {
    return 1500;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profile_id, coupon_code } = await req.json();
    if (!profile_id) {
      return new Response(JSON.stringify({ error: "profile_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, startup_name")
      .eq("id", profile_id)
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found or unauthorized" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let finalPrice = TEAMS_PRICE_USD;
    let appliedCoupon = null;

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase().trim())
        .eq("active", true)
        .single();

      if (coupon && (!coupon.max_uses || coupon.uses < coupon.max_uses)) {
        finalPrice = TEAMS_PRICE_USD * (1 - coupon.discount_percent / 100);
        appliedCoupon = coupon.code;
      }
    }

    // 100% off — skip Paystack entirely, activate immediately
    if (finalPrice <= 0) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await supabaseAdmin
        .from("profiles")
        .update({ plan_type: "teams", plan_expires_at: expiresAt.toISOString() })
        .eq("id", profile_id);

      if (appliedCoupon) {
        await supabaseAdmin.rpc("increment_coupon_use", { coupon_code: appliedCoupon }).catch(() => {});
      }

      await supabaseAdmin.from("payments").insert({
        profile_id,
        amount_usd: 0,
        amount_ngn: 0,
        paystack_reference: `xeero_teams_free_${profile_id}_${Date.now()}`,
        payment_type: "teams_annual",
        status: "success",
      });

      return new Response(
        JSON.stringify({ free: true, success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rate = await getUsdToNgnRate();
    const ngnAmount = Math.ceil(finalPrice * rate);
    const amountInKobo = ngnAmount * 100;
    const reference = `xeero_teams_${profile_id}_${Date.now()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        reference,
        metadata: {
          profile_id,
          usd_price: finalPrice,
          startup_name: profile.startup_name,
          coupon: appliedCoupon,
        },
        callback_url: `https://xeero.me/dashboard/settings?upgrade=success`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return new Response(JSON.stringify({ error: "Failed to initialize payment" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        ngn_amount: ngnAmount,
        usd_amount: finalPrice,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("initialize-teams-upgrade error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});