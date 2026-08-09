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
  pending_review: {
    label: "Under Review",
    message: "Your incorporation request is being reviewed by our team.",
  },
  name_reserved: {
    label: "Name Reserved",
    message: "Your proposed company name has been reserved. We're moving forward with filing.",
  },
  in_progress: {
    label: "In Progress",
    message: "Your incorporation is actively being processed.",
  },
  completed: {
    label: "Completed",
    message: "Your company has been successfully incorporated. Congratulations!",
  },
  rejected: {
    label: "Update Required",
    message: "There's an issue with your request that needs your attention. See the note below.",
  },
};

function buildEmailHtml(
  founderName: string,
  startupName: string,
  proposedName: string,
  status: string,
  adminNotes: string | null
) {
  const statusInfo = STATUS_COPY[status] || { label: status, message: "Your incorporation status has been updated." };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="width:100%;height:6px;background:linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%);"></div>
        <div style="padding:36px 32px;">
          <span style="display:inline-block;font-size:11px;font-weight:600;color:#3182ce;background:#ebf8ff;border:1px solid #bee3f8;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">
            ${statusInfo.label}
          </span>
          <h1 style="font-size:20px;font-weight:700;color:#111111;margin:0 0 12px 0;line-height:1.3;">
            Update on your incorporation, ${proposedName}
          </h1>
          <p style="font-size:14px;color:#555555;line-height:1.7;margin:0 0 20px 0;">
            Hi ${founderName}, ${statusInfo.message}
          </p>
          ${adminNotes ? `
            <div style="background:#f9f9f9;border:1px solid #f0f0f0;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="font-size:11px;color:#aaaaaa;margin:0 0 6px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Note from the team</p>
              <p style="font-size:14px;color:#333333;margin:0;line-height:1.6;white-space:pre-wrap;">${adminNotes}</p>
            </div>
          ` : ""}
          <a href="https://xeero.me/dashboard/services/incorporate" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
            View Details →
          </a>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            You're receiving this because you have an active incorporation request for ${startupName} on
            <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
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

    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: request } = await supabaseAdmin
      .from("incorporation_requests")
      .select("*, profiles(founder_name, startup_name, user_id)")
      .eq("id", request_id)
      .single();

    if (!request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(request.profiles.user_id);
    const founderEmail = authData?.user?.email;

    if (!founderEmail) {
      return new Response(JSON.stringify({ error: "Could not resolve founder email" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(
      request.profiles.founder_name,
      request.profiles.startup_name,
      request.proposed_name,
      request.status,
      request.admin_notes
    );

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [founderEmail],
        subject: `Update on your incorporation — ${STATUS_COPY[request.status]?.label || request.status}`,
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
    console.error("notify-incorporation-update error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});