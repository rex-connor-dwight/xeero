import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAILS = ["connor@xeero.me"];
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STATUS_COPY: Record<string, { label: string; message: string }> = {
  submitted: { label: "Submitted", message: "Your application has been received." },
  under_review: { label: "Under Review", message: "Your application is being reviewed by our team." },
  shortlisted: { label: "Shortlisted", message: "Your application has progressed to the next stage." },
  technical_assessment: { label: "Technical Assessment", message: "We're conducting a technical assessment of your request." },
  due_diligence: { label: "Due Diligence", message: "Your application has moved into due diligence." },
  approved: { label: "Approved", message: "Your technology development application has been approved." },
  rejected: { label: "Update", message: "Thank you for applying. See the note below for more detail." },
  waitlisted: { label: "Waitlisted", message: "Your application has been placed on our waitlist." },
  development_in_progress: { label: "In Development", message: "Your technology development project is now underway." },
  completed: { label: "Completed", message: "Your technology development project has been completed." },
};

function buildEmailHtml(fullName: string, startupName: string, status: string, note: string | null) {
  const statusInfo = STATUS_COPY[status] || { label: status, message: "Your application status has been updated." };
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="width:100%;height:6px;background:linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%);"></div>
        <div style="padding:36px 32px;">
          <span style="display:inline-block;font-size:11px;font-weight:600;color:#3182ce;background:#ebf8ff;border:1px solid #bee3f8;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">
            ${statusInfo.label}
          </span>
          <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 12px 0;line-height:1.3;">
            Update on your Pordware application
          </h1>
          <p style="font-size:14px;color:#555555;line-height:1.7;margin:0 0 20px 0;">
            Hi ${fullName}, ${statusInfo.message}
          </p>
          ${note ? `
            <div style="background:#f9f9f9;border:1px solid #f0f0f0;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="font-size:11px;color:#aaaaaa;margin:0 0 6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Note from the team</p>
              <p style="font-size:14px;color:#333333;margin:0;line-height:1.6;white-space:pre-wrap;">${note}</p>
            </div>
          ` : ""}
          <a href="https://xeero.me/dashboard/funding" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
            View Details →
          </a>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            You're receiving this because ${startupName} has an active application with the Pordware Technology Fund via
            <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a>.
          </p>
        </div>
      </div>
    </body></html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || "")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { application_id, review_note } = await req.json();
    if (!application_id) {
      return new Response(JSON.stringify({ error: "application_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: app } = await supabaseAdmin
      .from("pordware_applications")
      .select("full_name, email, startup_name, status")
      .eq("id", application_id)
      .single();

    if (!app || !app.email) {
      return new Response(JSON.stringify({ error: "Application or email not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(app.full_name, app.startup_name, app.status, review_note);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [app.email],
        subject: `Update on your Pordware application — ${STATUS_COPY[app.status]?.label || app.status}`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errData = await emailRes.json();
      console.error("Resend error:", errData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("notify-pordware-update error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});