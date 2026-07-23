import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader?.replace("Bearer ", "") || ""
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reason } = await req.json();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing pending request
    const { data: existing } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("id, scheduled_for")
      .eq("profile_id", profile.id)
      .eq("status", "pending")
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ already_requested: true, scheduled_for: existing.scheduled_for }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 30);

    const { data: request, error } = await supabaseAdmin
      .from("account_deletion_requests")
      .insert({
        profile_id: profile.id,
        user_id: user.id,
        reason: reason || null,
        scheduled_for: scheduledFor.toISOString(),
      })
      .select()
      .single();

    if (error || !request) {
      console.error("Failed to create deletion request:", error);
      return new Response(JSON.stringify({ error: "Failed to submit request" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, scheduled_for: request.scheduled_for }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("request-account-deletion error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});