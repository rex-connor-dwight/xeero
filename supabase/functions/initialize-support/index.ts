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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      profile_id,
      amount_usd,
      tier,
      supporter_name,
      supporter_email,
      is_public,
    } = await req.json();

    if (!profile_id || !amount_usd || !supporter_name || !supporter_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("subaccount_code, startup_name, slug")
      .eq("id", profile_id)
      .single();

    if (!profile?.subaccount_code) {
      return new Response(
        JSON.stringify({ error: "This founder is not set up to receive support yet." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rate = await getUsdToNgnRate();
    const ngnAmount = Math.ceil(amount_usd * rate);
    const amountInKobo = ngnAmount * 100;

    const reference = `xeero_support_${profile_id}_${Date.now()}`;

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: supporter_email,
          amount: amountInKobo,
          reference,
          subaccount: profile.subaccount_code,
          bearer: "subaccount",
          metadata: {
            profile_id,
            amount_usd,
            tier,
            supporter_name,
            supporter_email,
            is_public,
            custom_fields: [
              {
                display_name: "Supporter Name",
                variable_name: "supporter_name",
                value: supporter_name,
              },
              {
                display_name: "Startup",
                variable_name: "startup_name",
                value: profile.startup_name,
              },
            ],
          },
          callback_url: `https://xeero.me/${profile.slug}`,
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

    return new Response(
      JSON.stringify({
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference,
        ngn_amount: ngnAmount,
        usd_amount: amount_usd,
        rate: Math.round(rate),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("initialize-support error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});