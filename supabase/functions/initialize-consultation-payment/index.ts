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

const PACKAGE_PRICES: Record<string, number> = {
  advisory_session: 250,
  strategy_intensive: 750,
  founder_intensive: 2000,
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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { package_key, founder_name, founder_email, session_mode } = await req.json();

    if (!package_key || !founder_name || !founder_email) {
      return new Response(JSON.stringify({ error: "package_key, founder_name and founder_email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const usdPrice = PACKAGE_PRICES[package_key];
    if (!usdPrice) {
      return new Response(JSON.stringify({ error: "Invalid package selected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (package_key === "founder_intensive" && !session_mode) {
      return new Response(JSON.stringify({ error: "Please select virtual or physical for this package" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the booking row first, in pending state
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("consultation_bookings")
      .insert({
        package_key,
        founder_name,
        founder_email,
        amount_usd: usdPrice,
        payment_status: "pending",
        booking_status: "awaiting_payment",
        session_mode: package_key === "founder_intensive" ? session_mode : null,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Failed to create booking:", bookingError);
      return new Response(JSON.stringify({ error: "Failed to start booking" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rate = await getUsdToNgnRate();
    const ngnAmount = Math.ceil(usdPrice * rate);
    const amountInKobo = ngnAmount * 100;
    const reference = `xeero_advisory_${booking.id}_${Date.now()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: founder_email,
        amount: amountInKobo,
        reference,
        metadata: {
          booking_id: booking.id,
          package_key,
          usd_price: usdPrice,
          custom_fields: [
            { display_name: "Booking ID", variable_name: "booking_id", value: booking.id },
          ],
        },
        callback_url: `https://xeero.me/advisory?booking_id=${booking.id}`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return new Response(JSON.stringify({ error: "Failed to initialize payment" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store the reference on the booking now that we have it
    await supabaseAdmin
      .from("consultation_bookings")
      .update({ paystack_reference: reference, amount_ngn: ngnAmount })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        booking_id: booking.id,
        access_code: paystackData.data.access_code,
        reference,
        ngn_amount: ngnAmount,
        usd_amount: usdPrice,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("initialize-consultation-payment error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});