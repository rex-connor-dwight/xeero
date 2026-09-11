import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

function buildTicketEmailHtml(fullName: string, ticketCode: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#F7F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #30166015;">
        <div style="background:#301660;padding:32px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#F1A9FA;letter-spacing:0.08em;text-transform:uppercase;">The Venture Room</p>
        </div>
        <div style="padding:32px;text-align:center;">
          <h1 style="font-size:20px;font-weight:700;color:#301660;margin:0 0 8px 0;">You're in, ${fullName.split(" ")[0]}.</h1>
          <p style="font-size:13px;color:#301660;opacity:0.7;line-height:1.7;margin:0 0 24px 0;">
            26 September 2026 &middot; Bridge by Obsidian, Yaba, Lagos
          </p>
          <div style="background:#F1A9FA30;border:1px solid #F1A9FA;border-radius:14px;padding:18px;margin-bottom:24px;">
            <p style="font-size:11px;font-weight:700;color:#301660;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px 0;">Your Ticket Code</p>
            <p style="font-size:22px;font-weight:700;color:#301660;letter-spacing:0.05em;margin:0;">${ticketCode}</p>
          </div>
          <p style="font-size:12px;color:#301660;opacity:0.6;line-height:1.6;margin:0;">
            Bring this code with you to check in at the venue.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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

    console.log(`Registration ${registrationId} marked paid, ticket ${registration.ticket_code}`);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The Venture Room <noreply@xeero.me>",
        to: [registration.email],
        subject: "Your Venture Room ticket code",
        html: buildTicketEmailHtml(registration.full_name, registration.ticket_code),
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