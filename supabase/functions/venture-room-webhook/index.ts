import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEdition } from "../_shared/editions.ts";
import { buildTicketEmailHtml } from "../_shared/ticketEmail.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();
    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const data = event.data;

    let metadata = data.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        console.error("Failed to parse metadata string:", metadata);
        metadata = {};
      }
    }

    const registrationId = metadata?.registration_id;

    if (!registrationId) {
      console.error("No registration_id in metadata");
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

    const { data: registration, error } = await supabaseAdmin
      .from("venture_room_registrations")
      .update({ payment_status: "paid" })
      .eq("id", registrationId)
      .select()
      .single();

    if (error || !registration) {
      console.error("Failed to update registration:", error);
      return new Response("OK", { status: 200 });
    }

    console.log(
      `Registration ${registrationId} (${registration.edition}) marked paid, ticket ${registration.ticket_code}`
    );

    // The email uses the edition stored on the registration, so a late
    // payment still gets the right city, date and venue.
    const edition = getEdition(registration.edition);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The Venture Room <noreply@xeero.me>",
        to: [registration.email],
        subject: `Your Venture Room ${edition.city} ticket code`,
        html: buildTicketEmailHtml(registration.full_name, registration.ticket_code, edition),
      }),
    });

    if (!emailRes.ok) {
      const errData = await emailRes.json();
      console.error("Resend error:", errData);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("venture-room-webhook error:", err);
    return new Response("OK", { status: 200 });
  }
});