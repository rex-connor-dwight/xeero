"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Heart,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Stats = {
  totalUsers: number;
  liveUsers: number;
  notLive: number;
  newThisWeek: number;
};

type FinanceStats = {
  totalProcessed: number;
  xeeroRevenue: number;
  thisMonthTotal: number;
  thisMonthXeero: number;
  totalTransactions: number;
  thisMonthCount: number;
};

export default function CrmOverview() {
  const { user, loading } = useXeero();
  const [userStats, setUserStats] = useState<Stats | null>(null);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [pendingSupport, setPendingSupport] = useState(0);
  const [pendingFunding, setPendingFunding] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = async () => {
    setDataLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const [usersRes, financeRes] = await Promise.all([
      fetch(`${base}/functions/v1/crm-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      }),
      fetch(`${base}/functions/v1/crm-finance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      }),
    ]);

    const usersData = await usersRes.json();
    const financeData = await financeRes.json();

    if (usersData.stats) setUserStats(usersData.stats);
    if (financeData.stats) setFinanceStats(financeData.stats);

    // Pending applications
    const { data: supportApps } = await supabase
      .from("support_applications")
      .select("id")
      .eq("status", "pending");
    const { data: fundingApps } = await supabase
      .from("funding_applications")
      .select("id")
      .neq("status", "reviewed");

    setPendingSupport(supportApps?.length || 0);
    setPendingFunding(fundingApps?.length || 0);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) {
      fetchData();
    }
  }, [loading, user]);

  if (loading || dataLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Founders",
      value: userStats?.totalUsers || 0,
      sub: `${userStats?.newThisWeek || 0} this week`,
      icon: <Users size={18} color="#111111" />,
      color: "#111111",
      bg: "#f5f5f5",
    },
    {
      label: "Live Profiles",
      value: userStats?.liveUsers || 0,
      sub: `${userStats?.notLive || 0} not live yet`,
      icon: <TrendingUp size={18} color="#38a169" />,
      color: "#38a169",
      bg: "#f0fff4",
    },
    {
      label: "Xeero Revenue",
      value: `$${(financeStats?.xeeroRevenue || 0).toFixed(2)}`,
      sub: `$${(financeStats?.thisMonthXeero || 0).toFixed(2)} this month`,
      icon: <DollarSign size={18} color="#3182ce" />,
      color: "#3182ce",
      bg: "#ebf8ff",
    },
    {
      label: "Total Processed",
      value: `$${(financeStats?.totalProcessed || 0).toFixed(2)}`,
      sub: `${financeStats?.totalTransactions || 0} transactions`,
      icon: <Heart size={18} color="#d69e2e" />,
      color: "#d69e2e",
      bg: "#fffbeb",
    },
  ];

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.sub}>Everything happening on Xeero right now.</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        {metrics.map((m) => (
          <div key={m.label} style={styles.metricCard}>
            <div style={{ ...styles.metricIcon, backgroundColor: m.bg }}>
              {m.icon}
            </div>
            <p style={styles.metricLabel}>{m.label}</p>
            <p style={{ ...styles.metricValue, color: m.color }}>{m.value}</p>
            <p style={styles.metricSub}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      {(pendingSupport > 0 || pendingFunding > 0) && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Needs Attention</p>
          <div style={styles.attentionList}>
            {pendingSupport > 0 && (
              <div style={styles.attentionCard}>
                <div style={styles.attentionLeft}>
                  <div style={styles.attentionDot} />
                  <div>
                    <p style={styles.attentionTitle}>
                      {pendingSupport} community support application{pendingSupport > 1 ? "s" : ""} pending
                    </p>
                    <p style={styles.attentionSub}>Founders waiting for approval to receive support</p>
                  </div>
                </div>
                <a href="/crm/applications" style={styles.attentionBtn}>
                  Review <ArrowUpRight size={12} />
                </a>
              </div>
            )}
            {pendingFunding > 0 && (
              <div style={styles.attentionCard}>
                <div style={styles.attentionLeft}>
                  <div style={{ ...styles.attentionDot, backgroundColor: "#3182ce" }} />
                  <div>
                    <p style={styles.attentionTitle}>
                      {pendingFunding} funding application{pendingFunding > 1 ? "s" : ""} unreviewed
                    </p>
                    <p style={styles.attentionSub}>Founders waiting for funding review</p>
                  </div>
                </div>
                <a href="/crm/applications" style={styles.attentionBtn}>
                  Review <ArrowUpRight size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Quick Access</p>
        <div style={styles.quickGrid}>
          {[
            { label: "Manage Users", sub: "View all founders", path: "/crm/users", icon: <Users size={20} color="#111111" /> },
            { label: "Applications", sub: "Support & funding", path: "/crm/applications", icon: <FileText size={20} color="#111111" /> },
            { label: "Finance", sub: "Revenue & transactions", path: "/crm/finance", icon: <DollarSign size={20} color="#111111" /> },
          ].map((q) => (
            <a key={q.path} href={q.path} style={styles.quickCard}>
              <div style={styles.quickIcon}>{q.icon}</div>
              <div>
                <p style={styles.quickLabel}>{q.label}</p>
                <p style={styles.quickSub}>{q.sub}</p>
              </div>
              <ArrowUpRight size={16} color="#cccccc" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "32px", maxWidth: "900px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  refreshBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" },
  metricCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  metricIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" },
  metricLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px 0" },
  metricValue: { fontSize: "28px", fontWeight: "700", margin: "0 0 4px 0" },
  metricSub: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  section: { marginBottom: "28px" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px 0" },
  attentionList: { display: "flex", flexDirection: "column", gap: "8px" },
  attentionCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  attentionLeft: { display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 },
  attentionDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d69e2e", flexShrink: 0, marginTop: "4px" },
  attentionTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  attentionSub: { fontSize: "12px", color: "#888888", margin: "0" },
  attentionBtn: { display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px", textDecoration: "none", flexShrink: 0 },
  quickGrid: { display: "flex", flexDirection: "column", gap: "8px" },
  quickCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" },
  quickIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  quickLabel: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  quickSub: { fontSize: "12px", color: "#888888", margin: "0" },
};