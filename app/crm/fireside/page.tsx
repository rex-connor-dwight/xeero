"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Flame, Users, CheckCircle, XCircle, ExternalLink } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Signup = {
  id: string;
  name: string;
  email: string;
  track: "interest" | "funding";
  xeero_slug: string | null;
  is_live_at_signup: boolean | null;
  created_at: string;
};

export default function CrmFiresidePage() {
  const { user, loading } = useXeero();
  const [signups, setSignups] = useState<Signup[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "interest" | "funding">("all");

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) {
      supabase
        .from("fireside_signups")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setSignups(data || []);
          setDataLoading(false);
        });
    }
  }, [loading, user]);

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const interestCount = signups.filter((s) => s.track === "interest").length;
  const fundingCount = signups.filter((s) => s.track === "funding").length;
  const liveFundingCount = signups.filter((s) => s.track === "funding" && s.is_live_at_signup).length;

  const filtered = filter === "all" ? signups : signups.filter((s) => s.track === filter);

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Flame size={18} color="#f97316" /></div>
        <div>
          <h1 style={styles.headerTitle}>Fireside Signups</h1>
          <p style={styles.headerSub}>{signups.length} total · progress toward 500</p>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{signups.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{interestCount}</span>
          <span style={styles.statLabel}>General Interest</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{fundingCount}</span>
          <span style={styles.statLabel}>Funding Track</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: "#38a169" }}>{liveFundingCount}</span>
          <span style={styles.statLabel}>Qualified (Live)</span>
        </div>
      </div>

      <div style={styles.filterRow}>
        {(["all", "interest", "funding"] as const).map((f) => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "interest" ? "General Interest" : "Funding Track"}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filtered.map((s) => (
          <div key={s.id} style={styles.row}>
            <div style={styles.rowLeft}>
              <p style={styles.rowName}>{s.name}</p>
              <p style={styles.rowEmail}>{s.email}</p>
              {s.track === "funding" && s.xeero_slug && (
                
                <a  href={`https://xeero.me/${s.xeero_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.slugLink}
                >
                  xeero.me/{s.xeero_slug} <ExternalLink size={11} />
                </a>
              )}
            </div>
            <div style={styles.rowRight}>
              {s.track === "funding" ? (
                s.is_live_at_signup ? (
                  <span style={styles.qualifiedBadge}>
                    <CheckCircle size={11} />Qualified
                  </span>
                ) : (
                  <span style={styles.notLiveBadge}>
                    <XCircle size={11} />Not Live
                  </span>
                )
              ) : (
                <span style={styles.interestBadge}>
                  <Users size={11} />Interest
                </span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No signups yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "800px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "4px" },
  statValue: { fontSize: "24px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" },
  filterRow: { display: "flex", gap: "6px", marginBottom: "16px" },
  filterBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  filterBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #dddddd", fontWeight: "600" },
  list: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f9f9f9", gap: "12px" },
  rowLeft: { flex: 1, minWidth: 0 },
  rowName: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  rowEmail: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  slugLink: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#3182ce", textDecoration: "none" },
  rowRight: { flexShrink: 0 },
  qualifiedBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "3px 10px", borderRadius: "99px" },
  notLiveBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#d69e2e", backgroundColor: "#fffbeb", border: "1px solid #fef08a", padding: "3px 10px", borderRadius: "99px" },
  interestBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", padding: "3px 10px", borderRadius: "99px" },
  emptyCard: { padding: "40px", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
};