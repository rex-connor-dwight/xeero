import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    const hash = createHmac("sha512", PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);

    // Only handle successful charges
    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const data = event.data;

    // Verify amount — $9 USD minimum (we check NGN amount)
    // Get profile_id from metadata
    const profileId = data.metadata?.profile_id ||
      data.metadata?.custom_fields?.find(
        (f: any) => f.variable_name === "profile_id"
      )?.value;

    if (!profileId) {
      console.error("No profile_id in metadata");
      return new Response("OK", { status: 200 });
    }

    // Verify transaction status with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${data.reference}`,
      {
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (
      !verifyData.status ||
      verifyData.data.status !== "success"
    ) {
      console.error("Transaction verification failed");
      return new Response("OK", { status: 200 });
    }

    // Set profile as live
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_live: true })
      .eq("id", profileId);

    if (error) {
      console.error("Failed to update profile:", error);
    } else {
      console.log(`Profile ${profileId} is now live`);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    // Always return 200 to Paystack so it doesn't retry
    return new Response("OK", { status: 200 });
  }
});