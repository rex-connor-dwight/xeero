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
    const { slug, name, email } = await req.json();

    if (!slug || !name || !email) {
      return new Response(JSON.stringify({ error: "slug, name and email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanSlug = slug
      .trim()
      .replace(/^https?:\/\//i, "")       // strip protocol if present
      .replace(/^www\./i, "")             // strip www. if present
      .replace(/^xeero\.me\//i, "")       // strip domain + slash
      .replace(/^xeero\.me$/i, "")        // handle bare domain with no slash
      .replace(/\/$/, "");                // strip trailing slash

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, startup_name, is_live")
      .eq("slug", cleanSlug)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "not_found", message: "We couldn't find a Xeero profile with that link. Double check the slug and try again." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.is_live) {
      // Still record the signup as interest, but flag it as not qualifying yet
      await supabaseAdmin.from("fireside_signups").insert({
        name, email, track: "funding", xeero_slug: cleanSlug, is_live_at_signup: false,
      });

      return new Response(
        JSON.stringify({
          error: "not_live",
          message: "Your Xeero profile isn't live yet. Go back to your dashboard, complete your profile, and publish it to qualify for the funding track. You can still come back and submit once it's live.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin.from("fireside_signups").insert({
      name, email, track: "funding", xeero_slug: cleanSlug, is_live_at_signup: true,
    });

    return new Response(
      JSON.stringify({ success: true, startup_name: profile.startup_name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("verify-fireside-slug error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});