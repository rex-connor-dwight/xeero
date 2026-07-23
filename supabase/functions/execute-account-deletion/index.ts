import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
const ADMIN_EMAILS = ["connor@xeero.me"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function deleteStorageFolder(bucket: string, prefix: string) {
  const { data: files } = await supabaseAdmin.storage.from(bucket).list(prefix);
  if (files && files.length > 0) {
    const paths = files.map((f: { name: string }) => `${prefix}/${f.name}`);
    await supabaseAdmin.storage.from(bucket).remove(paths);
  }
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
      .from("account_deletion_requests")
      .select("*, profiles(user_id)")
      .eq("id", request_id)
      .single();

    if (!request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUserId = request.profiles.user_id;

    // Clean up storage files first (cascade won't touch these)
    await deleteStorageFolder("logos", targetUserId);
    await deleteStorageFolder("decks", targetUserId);
    await deleteStorageFolder("dataroom", targetUserId);

    // Delete the profile — cascades through every related table automatically
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", request.profile_id);

    if (profileDeleteError) {
      console.error("Failed to delete profile:", profileDeleteError);
      return new Response(JSON.stringify({ error: "Failed to delete profile data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the actual auth account
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (authDeleteError) {
      console.error("Failed to delete auth user:", authDeleteError);
      // Profile data is already gone at this point — log this for manual follow-up
    }

    // Mark the request completed
    await supabaseAdmin
      .from("account_deletion_requests")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", request_id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("execute-account-deletion error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});