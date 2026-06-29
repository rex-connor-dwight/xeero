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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Fetch all successful transactions from Paystack
    let page = 1;
    let hasMore = true;
    const allTransactions: any[] = [];

    while (hasMore) {
      const res = await fetch(
        `https://api.paystack.co/transaction?perPage=100&page=${page}&status=success`,
        {
          headers: { "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}` },
        }
      );
      const data = await res.json();

      if (!data.status || !data.data?.length) {
        hasMore = false;
        break;
      }

      allTransactions.push(...data.data);

      if (data.data.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log(`Fetched ${allTransactions.length} total transactions from Paystack`);

    // Filter subscription payments only — starts with xeero_ but not xeero_support_
    const subscriptionTxns = allTransactions.filter((t: any) => {
      const ref = t.reference || "";
      return ref.startsWith("xeero_") && !ref.startsWith("xeero_support_");
    });

    console.log(`Found ${subscriptionTxns.length} subscription transactions`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const txn of subscriptionTxns) {
      const profileId = txn.metadata?.profile_id || null;
      const amountNgn = txn.amount / 100;
      const amountUsd = txn.metadata?.usd_price || 9;

      const { error } = await supabaseAdmin.from("payments").insert({
        profile_id: profileId,
        amount_usd: amountUsd,
        amount_ngn: amountNgn,
        paystack_reference: txn.reference,
        payment_type: "subscription",
        status: "success",
        created_at: txn.paid_at || txn.created_at,
      });

      if (error) {
        if (error.code === "23505") {
          skipped++;
        } else {
          console.error("Insert error:", error.message, "ref:", txn.reference);
          errors++;
        }
      } else {
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_found: subscriptionTxns.length,
        inserted,
        skipped,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("backfill-payments error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});