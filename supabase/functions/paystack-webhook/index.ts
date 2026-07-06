import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
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

    // Paystack sometimes sends metadata as a JSON string instead of an object
    let metadata = data.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        console.error("Failed to parse metadata string:", metadata);
        metadata = {};
      }
    }

    const profileId = metadata?.profile_id ||
      metadata?.custom_fields?.find(
        (f: any) => f.variable_name === "profile_id"
      )?.value;

    console.log("Parsed metadata:", JSON.stringify(metadata));
    console.log("Resolved profileId:", profileId);

    if (!profileId) {
      console.error("No profile_id in metadata");
      return new Response("OK", { status: 200 });
    }

    // Verify transaction with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${data.reference}`,
      {
        headers: { "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      console.error("Transaction verification failed");
      return new Response("OK", { status: 200 });
    }

    // Set profile live
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_live: true })
      .eq("id", profileId);

    if (error) {
      console.error("Failed to update profile:", error);
    } else {
      console.log(`Profile ${profileId} is now live`);
    }

    // Log payment to payments table
    const { error: paymentError } = await supabaseAdmin.from("payments").insert({
      profile_id: profileId,
      amount_usd: metadata?.usd_price || 9,
      amount_ngn: data.amount / 100,
      paystack_reference: data.reference,
      payment_type: "subscription",
      status: "success",
      created_at: data.paid_at || new Date().toISOString(),
    });

    if (paymentError) {
      console.error("Failed to log payment:", paymentError.message);
    } else {
      console.log(`Payment logged for profile ${profileId}`);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});