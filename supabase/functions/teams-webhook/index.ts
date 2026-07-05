import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();
    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const data = event.data;
    const profileId = data.metadata?.profile_id;

    if (!profileId) {
      console.error("No profile_id in metadata");
      return new Response("OK", { status: 200 });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${data.reference}`,
      { headers: { "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      console.error("Transaction verification failed");
      return new Response("OK", { status: 200 });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ plan_type: "teams", plan_expires_at: expiresAt.toISOString() })
      .eq("id", profileId);

    if (error) {
      console.error("Failed to upgrade plan:", error);
    } else {
      console.log(`Profile ${profileId} upgraded to Teams until ${expiresAt.toISOString()}`);
    }

    await supabaseAdmin.from("payments").insert({
      profile_id: profileId,
      amount_usd: data.metadata?.usd_price || 29.99,
      amount_ngn: data.amount / 100,
      paystack_reference: data.reference,
      payment_type: "teams_annual",
      status: "success",
      created_at: data.paid_at || new Date().toISOString(),
    });

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("teams-webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});