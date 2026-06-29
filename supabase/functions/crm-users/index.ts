import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ADMIN_EMAILS = ["connor@xeero.me"];
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
    if (authError || !user || !ADMIN_EMAILS.includes(user.email || "")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch all profiles
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, startup_name, founder_name, slug, is_live, validation_score, created_at, industry, stage, location")
      .order("created_at", { ascending: false });

    // Fetch view counts per profile
    const { data: views } = await supabaseAdmin
      .from("profile_views")
      .select("profile_id, created_at");

    // Fetch waitlist counts per profile
    const { data: waitlist } = await supabaseAdmin
      .from("waitlist")
      .select("profile_id");

    // Aggregate
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const enriched = (profiles || []).map((p: any) => {
      const profileViews = views?.filter((v: any) => v.profile_id === p.id) || [];
      const dau = profileViews.filter((v: any) => new Date(v.created_at) > dayAgo).length;
      const mau = profileViews.filter((v: any) => new Date(v.created_at) > monthAgo).length;
      const totalViews = profileViews.length;
      const waitlistCount = waitlist?.filter((w: any) => w.profile_id === p.id).length || 0;
      return { ...p, dau, mau, total_views: totalViews, waitlist_count: waitlistCount };
    });

    // Summary stats
    const totalUsers = enriched.length;
    const liveUsers = enriched.filter((p: any) => p.is_live).length;
    const notLive = enriched.filter((p: any) => !p.is_live).length;
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = enriched.filter((p: any) => new Date(p.created_at) > weekAgo).length;

    return new Response(
      JSON.stringify({ profiles: enriched, stats: { totalUsers, liveUsers, notLive, newThisWeek } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("crm-users error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});