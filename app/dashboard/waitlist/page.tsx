"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  Users,
  Search,
  Download,
  Mail,
  Clock,
  AlertCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

// ── Logic ──────────────────────────────────────────────────────────────────

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function exportCSV(entries: WaitlistEntry[], startupName: string) {
  const header = "Name,Email,Joined\n";
  const rows = entries
    .map((e) => `${e.name || ""},${e.email},${new Date(e.created_at).toLocaleDateString()}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${startupName}-waitlist.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  const router = useRouter();
  const { profile, profileLoading } = useXeero();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("waitlist")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setWaitlist(data || []);
        setWaitlistLoading(false);
      });
  }, [profile]);

  const filtered = waitlist.filter(
    (e) =>
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.name && e.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (profileLoading || waitlistLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  const startupName = profile?.startup_name || "";

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Users size={18} color="#111111" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Waitlist</h1>
            <p style={styles.headerSub}>
              {waitlist.length} {waitlist.length === 1 ? "person" : "people"} waiting for {startupName}
            </p>
          </div>
        </div>
        {waitlist.length > 0 && (
          <button
            style={styles.exportBtn}
            onClick={() => exportCSV(waitlist, startupName)}
          >
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {/* ── Stats Bar ── */}
      {waitlist.length > 0 && (
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{waitlist.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {waitlist.filter((e) => {
                const d = new Date(e.created_at);
                return new Date().getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </span>
            <span style={styles.statLabel}>This week</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {waitlist.filter((e) => {
                const d = new Date(e.created_at);
                return new Date().getTime() - d.getTime() < 24 * 60 * 60 * 1000;
              }).length}
            </span>
            <span style={styles.statLabel}>Today</span>
          </div>
        </div>
      )}

      {/* ── Search ── */}
      {waitlist.length > 0 && (
        <div style={styles.searchWrapper}>
          <Search size={14} color="#aaaaaa" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── List ── */}
      {waitlist.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <AlertCircle size={32} color="#e5e5e5" />
          </div>
          <h2 style={styles.emptyTitle}>No one here yet</h2>
          <p style={styles.emptyText}>
            Share your profile link to start building your waitlist.
          </p>
          <button
            style={styles.emptyBtn}
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No results for "{search}"</p>
        </div>
      ) : (
        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <span style={styles.listHeaderCell}>Person</span>
            <span style={styles.listHeaderCell}>Email</span>
            <span style={styles.listHeaderCell}>Joined</span>
          </div>
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                ...styles.listRow,
                backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa",
              }}
            >
              <div style={styles.listRowLeft}>
                <div style={styles.listAvatar}>
                  <span style={styles.listAvatarText}>
                    {(entry.name || entry.email)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={styles.listName}>
                    {entry.name || <span style={styles.listNoName}>No name</span>}
                  </p>
                </div>
              </div>
              <div style={styles.listEmail}>
                <Mail size={12} color="#aaaaaa" />
                <span style={styles.listEmailText}>{entry.email}</span>
              </div>
              <div style={styles.listTime}>
                <Clock size={11} color="#cccccc" />
                <span style={styles.listTimeText}>{timeAgo(entry.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = {
  [key: string]: React.CSSProperties;
};

const styles: Styles = {
  page: { padding: "24px", maxWidth: "760px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  exportBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  statsBar: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statItem: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" },
  statDivider: { width: "1px", height: "32px", backgroundColor: "#f0f0f0" },
  searchWrapper: { position: "relative", marginBottom: "14px" },
  searchIcon: { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "11px 14px 11px 38px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box", color: "#111111" },
  listCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  listHeader: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", padding: "10px 18px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0" },
  listHeaderCell: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em" },
  listRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", padding: "13px 18px", alignItems: "center", borderBottom: "1px solid #f5f5f5" },
  listRowLeft: { display: "flex", alignItems: "center", gap: "10px" },
  listAvatar: { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  listAvatarText: { fontSize: "12px", fontWeight: "600", color: "#888888" },
  listName: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0" },
  listNoName: { color: "#cccccc", fontStyle: "italic", fontWeight: "400" },
  listEmail: { display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" },
  listEmailText: { fontSize: "12px", color: "#666666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  listTime: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  listTimeText: { fontSize: "11px", color: "#cccccc", whiteSpace: "nowrap" },
  emptyState: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIcon: { marginBottom: "12px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#cccccc", margin: "0 0 6px 0" },
  emptyText: { fontSize: "13px", color: "#dddddd", margin: "0 0 20px 0", lineHeight: "1.6", maxWidth: "240px" },
  emptyBtn: { padding: "9px 18px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "none", borderRadius: "8px", cursor: "pointer" },
};