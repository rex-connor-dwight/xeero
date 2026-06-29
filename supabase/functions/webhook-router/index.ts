import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    const event = JSON.parse(body);
    const reference = event?.data?.reference || "";

    console.log("webhook-router received:", event.event, "ref:", reference);

    const forwardHeaders = {
      "Content-Type": "application/json",
      "x-paystack-signature": signature,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    };

    let targetFunction = "";

    if (reference.startsWith("xeero_support_")) {
      targetFunction = "support-webhook";
    } else if (reference.startsWith("xeero_")) {
      targetFunction = "paystack-webhook";
    } else {
      console.log("webhook-router: unknown reference format, ignoring");
      return new Response("OK", { status: 200 });
    }

    console.log("webhook-router forwarding to:", targetFunction);

    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/${targetFunction}`,
      {
        method: "POST",
        headers: forwardHeaders,
        body,
      }
    );

    console.log("webhook-router forward result:", res.status);

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("webhook-router error:", err);
    return new Response("OK", { status: 200 });
  }
});