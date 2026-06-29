"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  RefreshCw,
  TrendingUp,
  DollarSign,
  Heart,
  Users,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type TopStartup = {
  startup_name: string;
  slug: string;
  total: number;
  count: number;
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FinancePage() {
  const { user, loading } = useXeero();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [supporters, setSupporters] = useState<any[]>([]);
  const [topStartups, setTopStartups] = useState<TopStartup[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "support">("subscriptions");

  const fetchData = async () => {
    setDataLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const res = await fetch(`${base}/functions/v1/crm-finance`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    setSubscriptions(data.subscriptions || []);
    setSupporters(data.supporters || []);
    setTopStartups(data.topStartups || []);
    setStats(data.stats || null);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const monthChange = stats?.totalXeeroLastMonth > 0
    ? (((stats?.totalXeeroThisMonth - stats?.totalXeeroLastMonth) / stats?.totalXeeroLastMonth) * 100).toFixed(0)
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Finance</h1>
          <p style={styles.sub}>All revenue streams across Xeero.</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* ── Total Revenue Hero ── */}
      <div style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <p style={styles.heroLabel}>Total Xeero Revenue</p>
          <p style={styles.heroAmount}>${(stats?.totalXeeroRevenue || 0).toFixed(2)}</p>
          <p style={styles.heroSub}>subscriptions + commission</p>
          <div style={styles.heroDivider} />
          <div style={styles.heroStats}>
            <span style={styles.heroStat}>${(stats?.totalXeeroThisMonth || 0).toFixed(2)} this month</span>
            {monthChange && (
              <span style={{ ...styles.heroStat, color: Number(monthChange) >= 0 ? "#38a169" : "#e53e3e" }}>
                {Number(monthChange) >= 0 ? "+" : ""}{monthChange}% vs last month
              </span>
            )}
          </div>
        </div>
        <div style={styles.heroRight}>
          <div style={styles.revenueBreakdown}>
            <div style={styles.revenueItem}>
              <div style={styles.revenueIcon}>
                <Users size={16} color="#3182ce" />
              </div>
              <div>
                <p style={styles.revenueLabel}>Subscriptions</p>
                <p style={styles.revenueValue}>${(stats?.subTotal || 0).toFixed(2)}</p>
                <p style={styles.revenueSub}>{stats?.subCount || 0} founders · ${(stats?.subThisMonthTotal || 0).toFixed(2)} this month</p>
              </div>
            </div>
            <div style={styles.revenueItem}>
              <div style={{ ...styles.revenueIcon, backgroundColor: "#f0fff4" }}>
                <Heart size={16} color="#38a169" />
              </div>
              <div>
                <p style={styles.revenueLabel}>Commission (8%)</p>
                <p style={styles.revenueValue}>${(stats?.commissionRevenue || 0).toFixed(2)}</p>
                <p style={styles.revenueSub}>{stats?.supportCount || 0} support payments · ${(stats?.commissionThisMonth || 0).toFixed(2)} this month</p>
              </div>
            </div>
            <div style={styles.revenueItem}>
              <div style={{ ...styles.revenueIcon, backgroundColor: "#fffbeb" }}>
                <TrendingUp size={16} color="#d69e2e" />
              </div>
              <div>
                <p style={styles.revenueLabel}>Gross Support (all founders)</p>
                <p style={styles.revenueValue}>${(stats?.supportTotal || 0).toFixed(2)}</p>
                <p style={styles.revenueSub}>${(stats?.supportThisMonthTotal || 0).toFixed(2)} this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two Column ── */}
      <div style={styles.twoCol}>

        {/* Top Startups */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Top Startups by Support</p>
          {topStartups.length === 0 && <p style={styles.emptyText}>No data yet.</p>}
          {topStartups.map((s, i) => (
            <div key={s.slug} style={styles.topRow}>
              <span style={styles.topRank}>{i + 1}</span>
              <div style={styles.topInfo}>
                <p style={styles.topName}>{s.startup_name}</p>
                <p style={styles.topSlug}>xeero.me/{s.slug} · {s.count} supporter{s.count !== 1 ? "s" : ""}</p>
              </div>
              <div style={styles.topRight}>
                <p style={styles.topAmount}>${Number(s.total).toFixed(2)}</p>
                <p style={styles.topXeero}>+${(Number(s.total) * 0.08).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div style={styles.card}>
          <div style={styles.tabsRow}>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "subscriptions" ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab("subscriptions")}
            >
              Subscriptions
            </button>
            <button
              style={{ ...styles.tabBtn, ...(activeTab === "support" ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab("support")}
            >
              Support
            </button>
          </div>

          {activeTab === "subscriptions" && (
            <>
              {subscriptions.length === 0 && <p style={styles.emptyText}>No subscriptions yet.</p>}
              {subscriptions.slice(0, 15).map((p: any) => (
                <div key={p.id} style={styles.txRow}>
                  <div style={styles.txAvatar}>
                    <span style={styles.txAvatarText}>
                      {p.profiles?.startup_name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div style={styles.txInfo}>
                    <p style={styles.txName}>{p.profiles?.startup_name || "Unknown"}</p>
                    <p style={styles.txSub}>{p.profiles?.founder_name} · {timeAgo(p.created_at)}</p>
                  </div>
                  <div style={styles.txRight}>
                    <p style={styles.txAmount}>${Number(p.amount_usd).toFixed(2)}</p>
                    <p style={styles.txType}>Subscription</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "support" && (
            <>
              {supporters.length === 0 && <p style={styles.emptyText}>No support payments yet.</p>}
              {supporters.slice(0, 15).map((s: any) => (
                <div key={s.id} style={styles.txRow}>
                  <div style={styles.txAvatar}>
                    <span style={styles.txAvatarText}>
                      {s.supporter_name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div style={styles.txInfo}>
                    <p style={styles.txName}>{s.supporter_name}</p>
                    <p style={styles.txSub}>{s.profiles?.startup_name} · {timeAgo(s.created_at)}</p>
                  </div>
                  <div style={styles.txRight}>
                    <p style={styles.txAmount}>${Number(s.amount).toFixed(2)}</p>
                    <p style={styles.txXeero}>+${(Number(s.amount) * 0.08).toFixed(2)} Xeero</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "32px", maxWidth: "1100px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  refreshBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  heroCard: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", borderRadius: "20px", padding: "28px", marginBottom: "24px", display: "flex", gap: "40px", flexWrap: "wrap" },
  heroLeft: { flex: "0 0 220px" },
  heroLabel: { fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" },
  heroAmount: { fontSize: "36px", fontWeight: "700", color: "#ffffff", margin: "0 0 4px 0", letterSpacing: "-1px" },
  heroSub: { fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0 0 16px 0" },
  heroDivider: { height: "1px", backgroundColor: "rgba(255,255,255,0.08)", marginBottom: "14px" },
  heroStats: { display: "flex", flexDirection: "column", gap: "4px" },
  heroStat: { fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  heroRight: { flex: 1, minWidth: "260px" },
  revenueBreakdown: { display: "flex", flexDirection: "column", gap: "12px" },
  revenueItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" },
  revenueIcon: { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#ebf8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  revenueLabel: { fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 2px 0", fontWeight: "500" },
  revenueValue: { fontSize: "18px", fontWeight: "700", color: "#ffffff", margin: "0 0 1px 0" },
  revenueSub: { fontSize: "10px", color: "rgba(255,255,255,0.25)", margin: "0" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 16px 0" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  tabsRow: { display: "flex", gap: "6px", marginBottom: "16px" },
  tabBtn: { padding: "6px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "99px", cursor: "pointer" },
  tabBtnActive: { color: "#111111", backgroundColor: "#111111"},
  topRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f9f9f9" },
  topRank: { fontSize: "12px", fontWeight: "700", color: "#cccccc", width: "20px", flexShrink: 0 },
  topInfo: { flex: 1 },
  topName: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 1px 0" },
  topSlug: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  topRight: { flexShrink: 0, textAlign: "right" },
  topAmount: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 1px 0" },
  topXeero: { fontSize: "10px", color: "#38a169", fontWeight: "600", margin: "0" },
  txRow: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1px solid #f9f9f9" },
  txAvatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  txAvatarText: { fontSize: "12px", fontWeight: "700", color: "#666666" },
  txInfo: { flex: 1 },
  txName: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 1px 0" },
  txSub: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  txRight: { flexShrink: 0, textAlign: "right" },
  txAmount: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 1px 0" },
  txXeero: { fontSize: "10px", color: "#38a169", fontWeight: "600", margin: "0" },
  txType: { fontSize: "10px", color: "#3182ce", fontWeight: "600", margin: "0" },
};