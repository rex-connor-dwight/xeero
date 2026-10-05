import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CURRENT_EDITION } from "../_shared/editions.ts";
import { buildTicketEmailHtml } from "../_shared/ticketEmail.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VR-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ilike treats % and _ as wildcards, and "_" is common in real email addresses.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { full_name, email: rawEmail, phone, startup_name, role, profile_id, coupon_code } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

    if (!full_name || !email) {
      return jsonResponse({ error: "Name and email are required" }, 400);
    }

    // Price and edition come from the server, never from the browser.
    const edition = CURRENT_EDITION;
    let finalAmount = edition.priceNgn;
    let appliedCoupon: string | null = null;

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (coupon && (coupon.max_uses === null || coupon.uses < coupon.max_uses)) {
        finalAmount = Math.round(edition.priceNgn * (1 - coupon.discount_percent / 100));
        appliedCoupon = coupon.code;
        await supabaseAdmin
          .from("coupons")
          .update({ uses: coupon.uses + 1 })
          .eq("code", coupon.code);
      }
    }

    let ticketCode = generateTicketCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: clash } = await supabaseAdmin
        .from("venture_room_registrations")
        .select("id")
        .eq("ticket_code", ticketCode)
        .maybeSingle();
      if (!clash) break;
      ticketCode = generateTicketCode();
    }

    // Look for an existing row for this email IN THIS EDITION only. Someone who
    // registered for another city can register for this one, but not twice.
    const { data: existing } = await supabaseAdmin
      .from("venture_room_registrations")
      .select("id, payment_status")
      .eq("edition", edition.slug)
      .ilike("email", escapeLike(email))
      .maybeSingle();

    if (existing?.payment_status === "paid") {
      return jsonResponse(
        { error: `This email has already registered and paid for The Venture Room ${edition.city}.` },
        400
      );
    }

    let registration;
    let regError;

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("venture_room_registrations")
        .update({
          full_name, phone: phone || null,
          startup_name: startup_name || null,
          role: role || null,
          profile_id: profile_id || null,
          ticket_code: ticketCode,
          amount_ngn: finalAmount,
          payment_status: "pending",
        })
        .eq("id", existing.id)
        .select()
        .single();
      registration = data;
      regError = error;
    } else {
      const { data, error } = await supabaseAdmin
        .from("venture_room_registrations")
        .insert({
          full_name, email, phone: phone || null,
          startup_name: startup_name || null,
          role: role || null,
          profile_id: profile_id || null,
          ticket_code: ticketCode,
          amount_ngn: finalAmount,
          payment_status: "pending",
          edition: edition.slug,
        })
        .select()
        .single();
      registration = data;
      regError = error;
    }

    if (regError || !registration) {
      console.error("Registration insert failed:", regError);
      return jsonResponse({ error: "Failed to create registration" }, 500);
    }

    // A 100%-off coupon brings the price to zero. Paystack rejects zero-amount
    // charges, so skip the payment gateway entirely and mark this as paid directly.
    if (finalAmount === 0) {
      await supabaseAdmin
        .from("venture_room_registrations")
        .update({ payment_status: "paid" })
        .eq("id", registration.id);

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "The Venture Room <noreply@xeero.me>",
          to: [email],
          subject: `Your Venture Room ${edition.city} ticket code`,
          html: buildTicketEmailHtml(full_name, ticketCode, edition),
        }),
      });

      if (!emailRes.ok) {
        console.error("Failed to send free-ticket confirmation email:", await emailRes.json());
      }

      return jsonResponse({
        registration_id: registration.id,
        ticket_code: ticketCode,
        ngn_amount: 0,
        applied_coupon: appliedCoupon,
        free: true,
      });
    }

    const reference = `xeero_ventureroom_${registration.id}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: finalAmount * 100,
        reference,
        metadata: {
          registration_id: registration.id,
          ticket_code: ticketCode,
          coupon_code: appliedCoupon,
          edition: edition.slug,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error("Paystack init failed:", paystackData);
      return jsonResponse({ error: "Payment initialization failed" }, 500);
    }

    await supabaseAdmin
      .from("venture_room_registrations")
      .update({ paystack_reference: reference })
      .eq("id", registration.id);

    return jsonResponse({
      registration_id: registration.id,
      ticket_code: ticketCode,
      reference,
      ngn_amount: finalAmount,
      applied_coupon: appliedCoupon,
    });

  } catch (err) {
    console.error("initialize-venture-room-payment error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});