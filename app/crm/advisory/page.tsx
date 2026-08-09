"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Calendar, DollarSign, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle, Clock, XCircle, RefreshCw,
} from "lucide-react";
import { getPackage } from "@/lib/data/advisoryPackages";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Booking = {
  id: string;
  package_key: string;
  founder_name: string;
  founder_email: string;
  xeero_slug: string | null;
  amount_usd: number;
  amount_ngn: number | null;
  paystack_reference: string | null;
  payment_status: string;
  booking_status: string;
  session_mode: string | null;
  calendly_event_uri: string | null;
  scheduled_at: string | null;
  notes: string | null;
  follow_up_status: string;
  created_at: string;
  updated_at: string;
};

const BOOKING_STATUS_OPTIONS = [
  { value: "awaiting_payment", label: "Awaiting Payment", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "awaiting_booking", label: "Awaiting Booking", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "booked", label: "Booked", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "completed", label: "Completed", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
  { value: "cancelled", label: "Cancelled", color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7" },
  { value: "rescheduled", label: "Rescheduled", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
];

const FOLLOW_UP_OPTIONS = [
  { value: "none", label: "None" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "not_applicable", label: "N/A" },
];

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CrmAdvisoryPage() {
  const { user, loading } = useXeero();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const fetchData = async () => {
    const { data } = await supabase
      .from("consultation_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handleUpdateBookingStatus = async (id: string, booking_status: string) => {
    setSavingId(id);
    await supabase
      .from("consultation_bookings")
      .update({ booking_status, updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchData();
    setSavingId(null);
  };

  const handleUpdateFollowUp = async (id: string, follow_up_status: string) => {
    setSavingId(id);
    await supabase
      .from("consultation_bookings")
      .update({ follow_up_status, updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchData();
    setSavingId(null);
  };

  const handleSaveNotes = async (id: string) => {
    setSavingId(id);
    await supabase
      .from("consultation_bookings")
      .update({ notes: notesDraft[id] ?? "", updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchData();
    setSavingId(null);
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const paid = bookings.filter((b) => b.payment_status === "confirmed" || b.amount_usd === 0);
  const pendingPayment = bookings.filter((b) => b.payment_status === "pending");
  const needsAction = bookings.filter((b) => b.booking_status === "awaiting_booking" && (b.payment_status === "confirmed" || b.amount_usd === 0));
  const completed = bookings.filter((b) => b.booking_status === "completed");

  const filtered =
    filter === "all" ? bookings :
    filter === "pending_payment" ? pendingPayment :
    filter === "needs_action" ? needsAction :
    filter === "completed" ? completed :
    bookings;

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Calendar size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Advisory Bookings</h1>
          <p style={styles.headerSub}>{bookings.length} total</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}><RefreshCw size={13} /></button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{bookings.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: "#d69e2e" }}>{pendingPayment.length}</span>
          <span style={styles.statLabel}>Payment Pending</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: "#3182ce" }}>{needsAction.length}</span>
          <span style={styles.statLabel}>Awaiting Booking</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: "#38a169" }}>{completed.length}</span>
          <span style={styles.statLabel}>Completed</span>
        </div>
      </div>

      <div style={styles.filterRow}>
        {[
          { key: "all", label: "All" },
          { key: "pending_payment", label: "Payment Pending" },
          { key: "needs_action", label: "Awaiting Booking" },
          { key: "completed", label: "Completed" },
        ].map((f) => (
          <button
            key={f.key}
            style={{ ...styles.filterBtn, ...(filter === f.key ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyCard}><p style={styles.emptyText}>No bookings here.</p></div>
      ) : (
        <div style={styles.list}>
          {filtered.map((b) => {
            const pkg = getPackage(b.package_key as any);
            const statusInfo = BOOKING_STATUS_OPTIONS.find((s) => s.value === b.booking_status) || BOOKING_STATUS_OPTIONS[0];
            const isExpanded = expandedId === b.id;
            const isFree = b.amount_usd === 0;

            return (
              <div key={b.id} style={styles.card}>
                <div style={styles.cardTop} onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                  <div style={styles.cardLeft}>
                    <p style={styles.cardTitle}>{b.founder_name}</p>
                    <p style={styles.cardSub}>{b.founder_email}</p>
                    <p style={styles.cardMeta}>{pkg?.name || b.package_key} · {timeAgo(b.created_at)}</p>
                  </div>
                  <div style={styles.cardRight}>
                    {!isFree && (
                      <span style={{
                        ...styles.paymentBadge,
                        color: b.payment_status === "confirmed" ? "#38a169" : "#d69e2e",
                        backgroundColor: b.payment_status === "confirmed" ? "#f0fff4" : "#fffbeb",
                        border: `1px solid ${b.payment_status === "confirmed" ? "#c6f6d5" : "#fef08a"}`,
                      }}>
                        {b.payment_status === "confirmed" ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {b.payment_status === "confirmed" ? "Paid" : "Pending"}
                      </span>
                    )}
                    <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
                      {statusInfo.label}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.expanded}>
                    <div style={styles.detailGrid}>
                      <div>
                        <p style={styles.detailLabel}>Package</p>
                        <p style={styles.detailValue}>{pkg?.name || b.package_key}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Amount</p>
                        <p style={styles.detailValue}>
                          {isFree ? "Free" : `$${b.amount_usd}${b.amount_ngn ? ` (₦${b.amount_ngn.toLocaleString()})` : ""}`}
                        </p>
                      </div>
                      {b.session_mode && (
                        <div>
                          <p style={styles.detailLabel}>Format</p>
                          <p style={styles.detailValue}>{b.session_mode === "virtual" ? "Virtual" : "Physical"}</p>
                        </div>
                      )}
                      {b.paystack_reference && (
                        <div>
                          <p style={styles.detailLabel}>Payment Reference</p>
                          <p style={styles.detailValue}>{b.paystack_reference}</p>
                        </div>
                      )}
                      {b.xeero_slug && (
                        <div>
                          <p style={styles.detailLabel}>Xeero Profile</p>
                          <a href={`https://xeero.me/${b.xeero_slug}`} target="_blank" rel="noopener noreferrer" style={styles.slugLink}>
                            xeero.me/{b.xeero_slug} <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                      {b.scheduled_at && (
                        <div>
                          <p style={styles.detailLabel}>Scheduled For</p>
                          <p style={styles.detailValue}>{new Date(b.scheduled_at).toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p style={styles.fieldLabel}>Booking Status</p>
                      <div style={styles.statusGrid}>
                        {BOOKING_STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            style={{
                              ...styles.statusBtn,
                              ...(b.booking_status === opt.value ? { backgroundColor: opt.bg, border: `1px solid ${opt.border}`, color: opt.color, fontWeight: 600 } : {}),
                            }}
                            onClick={() => handleUpdateBookingStatus(b.id, opt.value)}
                            disabled={savingId === b.id}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={styles.fieldLabel}>Follow-up Status</p>
                      <div style={styles.statusGrid}>
                        {FOLLOW_UP_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            style={{
                              ...styles.statusBtn,
                              ...(b.follow_up_status === opt.value ? styles.statusBtnActive : {}),
                            }}
                            onClick={() => handleUpdateFollowUp(b.id, opt.value)}
                            disabled={savingId === b.id}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={styles.fieldLabel}>Notes</p>
                      <textarea
                        style={styles.textarea}
                        placeholder="Session notes, action items, follow-up plan..."
                        defaultValue={b.notes || ""}
                        onChange={(e) => setNotesDraft((prev) => ({ ...prev, [b.id]: e.target.value }))}
                      />
                      <button
                        style={{ ...styles.saveBtn, opacity: savingId === b.id ? 0.6 : 1 }}
                        onClick={() => handleSaveNotes(b.id)}
                        disabled={savingId === b.id}
                      >
                        {savingId === b.id ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "820px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  refreshBtn: { width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", marginLeft: "auto" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "4px" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" },
  filterRow: { display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" },
  filterBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  filterBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #dddddd", fontWeight: "600" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "40px", border: "1px solid #f0f0f0", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", gap: "12px" },
  cardLeft: { flex: 1, minWidth: 0 },
  cardRight: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" },
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  cardSub: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  cardMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  paymentBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap" },
  statusBadge: { fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap" },
  expanded: { padding: "0 20px 20px 20px", borderTop: "1px solid #f5f5f5", display: "flex", flexDirection: "column", gap: "16px" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "16px" },
  detailLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px 0" },
  detailValue: { fontSize: "13px", color: "#111111", margin: "0", wordBreak: "break-word" },
  slugLink: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#3182ce", textDecoration: "none" },
  fieldLabel: { fontSize: "12px", fontWeight: "600", color: "#555555", margin: "0 0 8px 0" },
  statusGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  statusBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  statusBtnActive: { backgroundColor: "#ebf8ff", border: "1px solid #bee3f8", color: "#3182ce", fontWeight: 600 },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111", marginBottom: "8px" },
  saveBtn: { padding: "8px 16px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};