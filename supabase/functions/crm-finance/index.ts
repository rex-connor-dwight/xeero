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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── Subscriptions from payments table ──
    const { data: subscriptions } = await supabaseAdmin
      .from("payments")
      .select("*, profiles(startup_name, slug, founder_name)")
      .eq("payment_type", "subscription")
      .order("created_at", { ascending: false });

    const allSubs = subscriptions || [];
    const subTotal = allSubs.reduce((sum: number, p: any) => sum + Number(p.amount_usd), 0);
    const subThisMonth = allSubs.filter((p: any) => new Date(p.created_at) >= monthStart);
    const subLastMonth = allSubs.filter((p: any) => new Date(p.created_at) >= lastMonthStart && new Date(p.created_at) <= lastMonthEnd);
    const subThisMonthTotal = subThisMonth.reduce((sum: number, p: any) => sum + Number(p.amount_usd), 0);
    const subLastMonthTotal = subLastMonth.reduce((sum: number, p: any) => sum + Number(p.amount_usd), 0);

    // ── Community support from supporters table ──
    const { data: supporters } = await supabaseAdmin
      .from("supporters")
      .select("*, profiles(startup_name, slug)")
      .order("created_at", { ascending: false });

    const allSupport = supporters || [];
    const supportTotal = allSupport.reduce((sum: number, s: any) => sum + Number(s.amount), 0);
    const supportThisMonth = allSupport.filter((s: any) => new Date(s.created_at) >= monthStart);
    const supportLastMonth = allSupport.filter((s: any) => new Date(s.created_at) >= lastMonthStart && new Date(s.created_at) <= lastMonthEnd);
    const supportThisMonthTotal = supportThisMonth.reduce((sum: number, s: any) => sum + Number(s.amount), 0);
    const supportLastMonthTotal = supportLastMonth.reduce((sum: number, s: any) => sum + Number(s.amount), 0);

    // ── Xeero revenue ──
    const commissionRevenue = supportTotal * 0.08;
    const commissionThisMonth = supportThisMonthTotal * 0.08;
    const commissionLastMonth = supportLastMonthTotal * 0.08;
    const totalXeeroRevenue = subTotal + commissionRevenue;
    const totalXeeroThisMonth = subThisMonthTotal + commissionThisMonth;
    const totalXeeroLastMonth = subLastMonthTotal + commissionLastMonth;

    // ── Top startups by support ──
    const byProfile: Record<string, { startup_name: string; slug: string; total: number; count: number }> = {};
    allSupport.forEach((s: any) => {
      const id = s.profile_id;
      if (!byProfile[id]) {
        byProfile[id] = {
          startup_name: s.profiles?.startup_name || "Unknown",
          slug: s.profiles?.slug || "",
          total: 0,
          count: 0,
        };
      }
      byProfile[id].total += Number(s.amount);
      byProfile[id].count += 1;
    });
    const topStartups = Object.values(byProfile)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return new Response(
      JSON.stringify({
        subscriptions: allSubs,
        supporters: allSupport,
        topStartups,
        stats: {
          // Subscriptions
          subTotal,
          subThisMonthTotal,
          subLastMonthTotal,
          subCount: allSubs.length,
          subThisMonthCount: subThisMonth.length,
          // Community support
          supportTotal,
          supportThisMonthTotal,
          supportLastMonthTotal,
          supportCount: allSupport.length,
          // Commission
          commissionRevenue,
          commissionThisMonth,
          commissionLastMonth,
          // Total Xeero revenue
          totalXeeroRevenue,
          totalXeeroThisMonth,
          totalXeeroLastMonth,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("crm-finance error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});