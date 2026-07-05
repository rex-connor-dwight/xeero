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

function buildInviteEmail(
  startupName: string,
  founderName: string,
  role: string,
  inviteUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <div style="width:100%;height:6px;background:linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%);"></div>

        <div style="padding:36px 32px;">
          <div style="margin-bottom:24px;">
            <span style="font-size:11px;font-weight:600;color:#aaaaaa;text-transform:uppercase;letter-spacing:0.08em;">Team Invitation</span>
          </div>
          <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 16px 0;line-height:1.3;">
            You've been invited to join ${startupName}
          </h1>
          <p style="font-size:14px;color:#555555;line-height:1.8;margin:0 0 24px 0;">
            ${founderName} has invited you to join <strong>${startupName}</strong> on Xeero as <strong>${role}</strong>.
            Click the button below to accept your invitation and set up your profile.
          </p>
          <div style="background:#f9f9f9;border:1px solid #f0f0f0;border-radius:10px;padding:16px;margin-bottom:28px;">
            <p style="font-size:12px;color:#aaaaaa;margin:0 0 4px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Your role</p>
            <p style="font-size:16px;font-weight:700;color:#111111;margin:0;">${role}</p>
          </div>
          <a href="${inviteUrl}" style="display:inline-block;padding:13px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;">
            Accept Invitation →
          </a>
          <p style="font-size:12px;color:#aaaaaa;margin:20px 0 0 0;line-height:1.6;">
            This invitation expires in 7 days. If you didn't expect this, you can safely ignore it.
          </p>
        </div>

        <div style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
          <p style="font-size:11px;color:#cccccc;margin:0;line-height:1.6;">
            Powered by <a href="https://xeero.me" style="color:#aaaaaa;text-decoration:none;">Xeero</a> — the startup OS for African founders.
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
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { profile_id, email, role, permissions } = await req.json();

    if (!profile_id || !email || !role) {
      return new Response(JSON.stringify({ error: "profile_id, email and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, startup_name, founder_name, plan_type, plan_expires_at")
      .eq("id", profile_id)
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found or unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Require an active Xeero for Teams plan
    const hasActiveTeamsPlan =
      profile.plan_type === "teams" &&
      (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

    if (!hasActiveTeamsPlan) {
      return new Response(JSON.stringify({ error: "Upgrade to Xeero for Teams to invite team members." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already invited
    const { data: existing } = await supabaseAdmin
      .from("team_invites")
      .select("id, accepted")
      .eq("profile_id", profile_id)
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing && existing.accepted) {
      return new Response(JSON.stringify({ error: "This person has already joined your team." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete old pending invite if exists
    if (existing) {
      await supabaseAdmin.from("team_invites").delete().eq("id", existing.id);
    }

    // Create invite
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("team_invites")
      .insert({
        profile_id,
        email: email.toLowerCase().trim(),
        role,
        permissions: permissions || [],
      })
      .select()
      .single();

    if (inviteError || !invite) {
      console.error("Invite creation error:", inviteError);
      return new Response(JSON.stringify({ error: "Failed to create invite." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inviteUrl = `https://xeero.me/join?token=${invite.token}`;
    const html = buildInviteEmail(
      profile.startup_name,
      profile.founder_name,
      role,
      inviteUrl
    );

    // Send invite email
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xeero <noreply@xeero.me>",
        to: [email.toLowerCase().trim()],
        subject: `You've been invited to join ${profile.startup_name} on Xeero`,
        html,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
      return new Response(JSON.stringify({ error: "Failed to send invite email." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Invite sent to ${email} for ${profile.startup_name}`);

    return new Response(
      JSON.stringify({ success: true, invite_id: invite.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("send-team-invite error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});