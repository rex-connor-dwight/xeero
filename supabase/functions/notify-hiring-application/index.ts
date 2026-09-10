import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const APPLICANT_COPY: Record<string, { subject: string; label: string; message: string }> = {
  reviewing: {
    subject: "Your application is under review",
    label: "Under Review",
    message: "Your application is now being reviewed. We'll follow up as soon as there's an update.",
  },
  shortlisted: {
    subject: "You've been shortlisted",
    label: "Shortlisted",
    message: "Good news, you've been shortlisted for this role. The team will be in touch about next steps.",
  },
  rejected: {
    subject: "Update on your application",
    label: "Update",
    message: "Thank you for applying. After review, the team has decided not to move forward with your application at this time. We appreciate the time you put into applying.",
  },
  hired: {
    subject: "Congratulations!",
    label: "Hired",
    message: "Congratulations, you've been selected for this role. The team will be in touch directly with next steps.",
  },
};

function buildApplicantEmail(applicantName: string, roleTitle: string, startupName: string, event: string) {
  const copy = APPLICANT_COPY[event];
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0f0f0;">
        <div style="padding:28px 32px 20px 32px;border-bottom:1px solid #f0f0f0;">
          <img src="https://xeero.me/xeeroLogo.png" alt="Xeero" width="24" height="24" style="display:block;">
        </div>
        <div style="padding:28px 32px;">
          <span style="display:inline-block;font-size:11px;font-weight:600;color:#3182ce;background:#ebf8ff;border:1px solid #bee3f8;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">
            ${copy.label}
          </span>
          <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 12px 0;line-height:1.3;">
            ${roleTitle} at ${startupName}
          </h1>
          <p style="font-size:14px;color:#555555;line-height:1.7;margin:0;">
            Hi ${applicantName}, ${copy.message}
          </p>
        </div>
        <div style="padding:18px 32px;background:#fafafa;border-top:1px solid #f0f0f0;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            You're receiving this because you applied for a role via
            <a href="https://xeero.me/hiring" style="color:#aaaaaa;text-decoration:none;">Xeero Hiring Room</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildFounderNewApplicationEmail(founderName: string, applicantName: string, roleTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0f0f0;">
        <div style="padding:28px 32px 20px 32px;border-bottom:1px solid #f0f0f0;">
          <img src="https://xeero.me/xeeroLogo.png" alt="Xeero" width="24" height="24" style="display:block;">
        </div>
        <div style="padding:28px 32px;">
          <span style="display:inline-block;font-size:11px;font-weight:600;color:#38a169;background:#f0fff4;border:1px solid #c6f6d5;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">
            New Application
          </span>
          <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 12px 0;line-height:1.3;">
            ${applicantName} applied for ${roleTitle}
          </h1>
          <p style="font-size:14px;color:#555555;line-height:1.7;margin:0 0 24px 0;">
            Hi ${founderName}, a new application just came in. Head to your Hiring Board to review it.
          </p>
          <a href="https://xeero.me/dashboard/hiring" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
            View Application →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { application_id, event } = await req.json();
    if (!application_id || !event) {
      return new Response(JSON.stringify({ error: "application_id and event are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: application } = await supabaseAdmin
      .from("hiring_applications")
      .select("applicant_name, applicant_email, role_id")
      .eq("id", application_id)
      .single();

    if (!application) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: role } = await supabaseAdmin
      .from("hiring_roles")
      .select("title, profile_id, profiles(startup_name, founder_name, user_id)")
      .eq("id", application.role_id)
      .single();

    if (!role) {
      return new Response(JSON.stringify({ error: "Role not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let html: string;
    let to: string;
    let subject: string;

    if (event === "new_application") {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById((role.profiles as any).user_id);
      const founderEmail = authData?.user?.email;
      if (!founderEmail) {
        return new Response(JSON.stringify({ error: "Could not resolve founder email" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      to = founderEmail;
      subject = `New application: ${application.applicant_name} for ${role.title}`;
      html = buildFounderNewApplicationEmail((role.profiles as any).founder_name, application.applicant_name, role.title);
    } else if (APPLICANT_COPY[event]) {
      to = application.applicant_email;
      subject = APPLICANT_COPY[event].subject;
      html = buildApplicantEmail(application.applicant_name, role.title, (role.profiles as any).startup_name, event);
    } else {
      return new Response(JSON.stringify({ error: "Unknown event type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: "Xeero <noreply@xeero.me>", to: [to], subject, html }),
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
    console.error("notify-hiring-application error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});