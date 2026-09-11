"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Ticket, Search, CheckCircle, Clock, DollarSign, ScanLine } from "lucide-react";
import CheckinModal from "@/components/venture-room/CheckinModal";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  startup_name: string | null;
  role: string | null;
  ticket_code: string;
  payment_status: string;
  amount_ngn: number;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

function timeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CrmVentureRoomPage() {
  const { loading } = useXeero();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "checked_in">("all");
  const [showCheckin, setShowCheckin] = useState(false);

  const fetchRegistrations = () => {
    supabase
      .from("venture_room_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRegistrations(data || []);
        setDataLoading(false);
      });
  };

  useEffect(() => {
    if (!loading) fetchRegistrations();
  }, [loading]);

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const paidCount = registrations.filter((r) => r.payment_status === "paid").length;
  const pendingCount = registrations.filter((r) => r.payment_status === "pending").length;
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const totalRevenue = registrations
    .filter((r) => r.payment_status === "paid")
    .reduce((sum, r) => sum + Number(r.amount_ngn), 0);

  const filtered = registrations.filter((r) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && r.payment_status === "paid") ||
      (filter === "pending" && r.payment_status === "pending") ||
      (filter === "checked_in" && r.checked_in);

    const matchesSearch =
      !search ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.ticket_code.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div style={styles.page}>

      {showCheckin && (
        <CheckinModal onClose={() => setShowCheckin(false)} onCheckedIn={fetchRegistrations} />
      )}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Ticket size={18} color="#111111" /></div>
          <div>
            <h1 style={styles.headerTitle}>The Venture Room</h1>
            <p style={styles.headerSub}>{registrations.length} registration{registrations.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button style={styles.checkinBtn} onClick={() => setShowCheckin(true)}>
          <ScanLine size={14} />Check-In
        </button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <CheckCircle size={14} color="#38a169" />
          <span style={styles.statValue}>{paidCount}</span>
          <span style={styles.statLabel}>Paid</span>
        </div>
        <div style={styles.statCard}>
          <Clock size={14} color="#d69e2e" />
          <span style={styles.statValue}>{pendingCount}</span>
          <span style={styles.statLabel}>Pending</span>
        </div>
        <div style={styles.statCard}>
          <Ticket size={14} color="#3182ce" />
          <span style={styles.statValue}>{checkedInCount}</span>
          <span style={styles.statLabel}>Checked In</span>
        </div>
        <div style={styles.statCard}>
          <DollarSign size={14} color="#111111" />
          <span style={styles.statValue}>₦{totalRevenue.toLocaleString()}</span>
          <span style={styles.statLabel}>Revenue</span>
        </div>
      </div>

      <div style={styles.controlsRow}>
        <div style={styles.searchWrapper}>
          <Search size={14} color="#aaaaaa" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            placeholder="Search name, email, or ticket code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.filterRow}>
          {(["all", "paid", "pending", "checked_in"] as const).map((f) => (
            <button
              key={f}
              style={{ ...styles.filterChip, ...(filter === f ? styles.filterChipActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "checked_in" ? "Checked In" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={styles.emptyText}>No registrations match.</p>
      ) : (
        <div style={styles.list}>
          <div style={styles.listHeader}>
            <span>Attendee</span>
            <span>Ticket</span>
            <span>Status</span>
          </div>
          {filtered.map((r) => (
            <div key={r.id} style={styles.row}>
              <div style={styles.rowLeft}>
                <p style={styles.rowName}>{r.full_name}</p>
                <p style={styles.rowMeta}>{r.email}{r.startup_name ? ` · ${r.startup_name}` : ""}</p>
                <p style={styles.rowTime}>{timeAgo(r.created_at)}</p>
              </div>
              <div style={styles.rowCode}>{r.ticket_code}</div>
              <div style={styles.rowStatus}>
                <span style={{
                  ...styles.statusBadge,
                  ...(r.payment_status === "paid" ? styles.statusPaid : styles.statusPending),
                }}>
                  {r.payment_status === "paid" ? "Paid" : "Pending"}
                </span>
                {r.checked_in && <span style={styles.checkedInBadge}>Checked in</span>}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "900px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", gap: "14px", flexWrap: "wrap" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  checkinBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "6px" },
  statValue: { fontSize: "18px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500" },
  controlsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  searchWrapper: { position: "relative", flex: 1, minWidth: "220px" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "10px 14px 10px 36px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box", color: "#111111" },
  filterRow: { display: "flex", gap: "6px" },
  filterChip: { padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" },
  filterChipActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111" },
  emptyText: { fontSize: "13px", color: "#cccccc" },
  list: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  listHeader: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", padding: "10px 18px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0", fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em" },
  row: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", padding: "14px 18px", alignItems: "center", borderBottom: "1px solid #f5f5f5" },
  rowLeft: {},
  rowName: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  rowMeta: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  rowTime: { fontSize: "11px", color: "#cccccc", margin: "0" },
  rowCode: { fontSize: "12px", fontWeight: "600", color: "#3182ce", fontFamily: "monospace" },
  rowStatus: { display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" },
  statusBadge: { fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "99px", whiteSpace: "nowrap" },
  statusPaid: { color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5" },
  statusPending: { color: "#d69e2e", backgroundColor: "#fffbeb", border: "1px solid #fef08a" },
  checkedInBadge: { fontSize: "10px", fontWeight: "600", color: "#3182ce", backgroundColor: "#ebf8ff", border: "1px solid #bee3f8", padding: "2px 8px", borderRadius: "99px" },
};