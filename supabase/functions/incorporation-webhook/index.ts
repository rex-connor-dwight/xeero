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
    const requestId = data.metadata?.request_id;
    const installmentNumber = data.metadata?.installment_number;

    if (!requestId) {
      console.error("No request_id in metadata");
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

    // Log the installment payment
    await supabaseAdmin.from("incorporation_payments").insert({
      request_id: requestId,
      amount_usd: data.metadata?.usd_amount,
      amount_ngn: data.amount / 100,
      paystack_reference: data.reference,
      installment_number: installmentNumber,
      status: "success",
    });

    // Fetch current state and increment paid_installments
    const { data: request } = await supabaseAdmin
      .from("incorporation_requests")
      .select("paid_installments, installment_months")
      .eq("id", requestId)
      .single();

    if (request) {
      const newPaidCount = request.paid_installments + 1;
      const isFullyPaid = newPaidCount >= request.installment_months;
      const nextDue = isFullyPaid
        ? null
        : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

      await supabaseAdmin
        .from("incorporation_requests")
        .update({
          paid_installments: newPaidCount,
          next_payment_due: nextDue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      console.log(`Incorporation request ${requestId} — installment ${installmentNumber} paid. ${newPaidCount}/${request.installment_months} complete.`);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("incorporation-webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});