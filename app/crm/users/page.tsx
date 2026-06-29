"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  RefreshCw,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type UserProfile = {
  id: string;
  startup_name: string;
  founder_name: string;
  slug: string;
  is_live: boolean;
  validation_score: number | null;
  industry: string;
  stage: string;
  location: string;
  created_at: string;
  dau: number;
  mau: number;
  total_views: number;
  waitlist_count: number;
};

type Filter = "all" | "live" | "not_live";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 86400) return "today";
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function UsersPage() {
  const { user, loading } = useXeero();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = async () => {
    setDataLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const res = await fetch(`${base}/functions/v1/crm-users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    setProfiles(data.profiles || []);
    setStats(data.stats || null);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handleToggleLive = async (profile: UserProfile) => {
    setTogglingId(profile.id);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/crm-toggle-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ profile_id: profile.id, is_live: !profile.is_live }),
    });
    await fetchData();
    setTogglingId(null);
  };

  const filtered = profiles
    .filter((p) => filter === "all" ? true : filter === "live" ? p.is_live : !p.is_live)
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.startup_name?.toLowerCase().includes(q) || p.founder_name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
    });

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Users</h1>
          <p style={styles.sub}>All founders on Xeero.</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {[
          { label: "Total", value: stats?.totalUsers || 0 },
          { label: "Live", value: stats?.liveUsers || 0, color: "#38a169" },
          { label: "Not Live", value: stats?.notLive || 0, color: "#d69e2e" },
          { label: "This Week", value: stats?.newThisWeek || 0, color: "#3182ce" },
        ].map((s) => (
          <div key={s.label} style={styles.statPill}>
            <span style={{ ...styles.statValue, color: s.color || "#111111" }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={styles.controls}>
        <div style={styles.filterRow}>
          {(["all", "live", "not_live"] as Filter[]).map((f) => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "live" ? "Live" : "Not Live"}
            </button>
          ))}
        </div>
        <div style={styles.searchWrapper}>
          <Search size={14} color="#aaaaaa" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            style={styles.searchInput}
            placeholder="Search founders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          <span style={{ ...styles.tableCell, flex: 2 }}>Founder</span>
          <span style={styles.tableCell}>Status</span>
          <span style={styles.tableCell}>Score</span>
          <span style={styles.tableCell}>Views</span>
          <span style={styles.tableCell}>Waitlist</span>
          <span style={styles.tableCell}>Joined</span>
          <span style={styles.tableCell}>Actions</span>
        </div>

        {filtered.length === 0 && (
          <div style={styles.emptyRow}>
            <p style={styles.emptyText}>No founders found.</p>
          </div>
        )}

        {filtered.map((p) => (
          <div key={p.id} style={styles.tableRow}>
            <div style={{ ...styles.tableCell, flex: 2 }}>
              <div style={styles.founderCell}>
                <div style={styles.avatar}>
                  <span style={styles.avatarText}>{p.startup_name?.[0]?.toUpperCase() || "?"}</span>
                </div>
                <div>
                  <p style={styles.startupName}>{p.startup_name || "Unnamed"}</p>
                  <p style={styles.founderName}>{p.founder_name} · xeero.me/{p.slug}</p>
                </div>
              </div>
            </div>

            <div style={styles.tableCell}>
              <span style={{
                fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "99px",
                color: p.is_live ? "#38a169" : "#d69e2e",
                backgroundColor: p.is_live ? "#f0fff4" : "#fffbeb",
                border: `1px solid ${p.is_live ? "#c6f6d5" : "#fef08a"}`,
              }}>
                {p.is_live ? "Live" : "Draft"}
              </span>
            </div>

            <div style={styles.tableCell}>
              {p.validation_score ? (
                <span style={{ fontSize: "13px", fontWeight: "600", color: p.validation_score >= 70 ? "#38a169" : p.validation_score >= 40 ? "#d69e2e" : "#e53e3e" }}>
                  {p.validation_score}
                </span>
              ) : (
                <span style={{ fontSize: "12px", color: "#cccccc" }}>—</span>
              )}
            </div>

            <div style={styles.tableCell}>
              <span style={styles.metaText}>{p.total_views}</span>
            </div>

            <div style={styles.tableCell}>
              <span style={styles.metaText}>{p.waitlist_count}</span>
            </div>

            <div style={styles.tableCell}>
              <span style={styles.metaText}>{timeAgo(p.created_at)}</span>
            </div>

            <div style={styles.tableCell}>
              <div style={styles.actionBtns}>
                <a href={`https://xeero.me/${p.slug}`} target="_blank" rel="noopener noreferrer" style={styles.iconBtn}>
                  <ExternalLink size={13} color="#888888" />
                </a>
                <button
                  style={styles.iconBtn}
                  onClick={() => handleToggleLive(p)}
                  disabled={togglingId === p.id}
                  title={p.is_live ? "Take offline" : "Make live"}
                >
                  {p.is_live
                    ? <ToggleRight size={18} color="#38a169" />
                    : <ToggleLeft size={18} color="#cccccc" />
                  }
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "32px", maxWidth: "1100px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  refreshBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  statsRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  statPill: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "#ffffff", borderRadius: "99px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statValue: { fontSize: "16px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "12px", color: "#aaaaaa" },
  controls: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  filterRow: { display: "flex", gap: "6px" },
  filterBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  filterBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #dddddd", fontWeight: "600" },
  searchWrapper: { position: "relative", flex: 1, minWidth: "200px" },
  searchInput: { width: "100%", padding: "8px 12px 8px 34px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" },
  tableWrapper: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  tableHeader: { display: "flex", alignItems: "center", padding: "12px 20px", backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0", gap: "16px" },
  tableRow: { display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f9f9f9", gap: "16px" },
  tableCell: { flex: 1, fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em" },
  founderCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: "13px", fontWeight: "700", color: "#666666" },
  startupName: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 1px 0" },
  founderName: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  metaText: { fontSize: "13px", color: "#555555", fontWeight: "500" },
  actionBtns: { display: "flex", alignItems: "center", gap: "6px" },
  iconBtn: { width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" },
  emptyRow: { padding: "48px 32px", textAlign: "center" },
  emptyText: { fontSize: "14px", color: "#aaaaaa", margin: "0" },
};