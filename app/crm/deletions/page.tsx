"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Trash2, Clock, CheckCircle, X, AlertTriangle } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type DeletionRequest = {
  id: string;
  profile_id: string;
  reason: string | null;
  requested_at: string;
  scheduled_for: string;
  status: "pending" | "cancelled" | "completed";
  completed_at: string | null;
  profiles: { startup_name: string; slug: string; founder_name: string };
};

function timeUntil(dateString: string) {
  const diff = new Date(dateString).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  return `${days} day${days !== 1 ? "s" : ""} left`;
}

export default function CrmDeletionsPage() {
  const { user, loading } = useXeero();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchData = async () => {
    const { data } = await supabase
      .from("account_deletion_requests")
      .select("*, profiles(startup_name, slug, founder_name)")
      .order("requested_at", { ascending: false });
    setRequests(data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handleExecute = async (requestId: string) => {
    setExecuting(requestId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/execute-account-deletion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ request_id: requestId }),
        }
      );
      const data = await res.json();
      if (data.success) await fetchData();
    } catch (err) {
      console.error("execute deletion error:", err);
    }
    setExecuting(null);
    setConfirmingId(null);
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const pending = requests.filter((r) => r.status === "pending");
  const due = pending.filter((r) => new Date(r.scheduled_for) <= new Date());
  const upcoming = pending.filter((r) => new Date(r.scheduled_for) > new Date());
  const completed = requests.filter((r) => r.status === "completed");
  const cancelled = requests.filter((r) => r.status === "cancelled");

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Trash2 size={18} color="#e53e3e" /></div>
        <div>
          <h1 style={styles.headerTitle}>Account Deletions</h1>
          <p style={styles.headerSub}>{pending.length} pending · {due.length} ready to process</p>
        </div>
      </div>

      {due.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Ready to process ({due.length})</p>
          {due.map((r) => (
            <div key={r.id} style={{ ...styles.card, ...styles.dueCard }}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.cardTitle}>{r.profiles?.startup_name || "Unknown"}</p>
                  <p style={styles.cardSub}>{r.profiles?.founder_name} · xeero.me/{r.profiles?.slug}</p>
                  {r.reason && <p style={styles.cardReason}>"{r.reason}"</p>}
                </div>
                <span style={styles.dueBadge}><AlertTriangle size={11} />{timeUntil(r.scheduled_for)}</span>
              </div>

              {confirmingId === r.id ? (
                <div style={styles.confirmRow}>
                  <span style={styles.confirmText}>Permanently delete this account and all data?</span>
                  <button style={styles.confirmYesBtn} onClick={() => handleExecute(r.id)} disabled={executing === r.id}>
                    {executing === r.id ? "Deleting..." : "Yes, delete permanently"}
                  </button>
                  <button style={styles.confirmNoBtn} onClick={() => setConfirmingId(null)}>Cancel</button>
                </div>
              ) : (
                <button style={styles.executeBtn} onClick={() => setConfirmingId(r.id)}>
                  <Trash2 size={13} />Process Deletion
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={styles.section}>
        <p style={styles.sectionLabel}>Upcoming ({upcoming.length})</p>
        {upcoming.length === 0 && <p style={styles.emptyText}>No upcoming deletions.</p>}
        {upcoming.map((r) => (
          <div key={r.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <p style={styles.cardTitle}>{r.profiles?.startup_name || "Unknown"}</p>
                <p style={styles.cardSub}>{r.profiles?.founder_name} · xeero.me/{r.profiles?.slug}</p>
              </div>
              <span style={styles.upcomingBadge}><Clock size={11} />{timeUntil(r.scheduled_for)}</span>
            </div>
          </div>
        ))}
      </div>

      {(completed.length > 0 || cancelled.length > 0) && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>History</p>
          {[...completed, ...cancelled].map((r) => (
            <div key={r.id} style={{ ...styles.card, opacity: 0.6 }}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.cardTitle}>{r.profiles?.startup_name || "Deleted account"}</p>
                  <p style={styles.cardSub}>Requested {new Date(r.requested_at).toLocaleDateString()}</p>
                </div>
                <span style={r.status === "completed" ? styles.completedBadge : styles.cancelledBadge}>
                  {r.status === "completed" ? <CheckCircle size={11} /> : <X size={11} />}
                  {r.status === "completed" ? "Completed" : "Cancelled"}
                </span>
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
  page: { padding: "32px", maxWidth: "760px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  section: { marginBottom: "24px" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "16px 18px", marginBottom: "10px" },
  dueCard: { border: "1px solid #fed7d7", backgroundColor: "#fff5f5" },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" },
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  cardSub: { fontSize: "12px", color: "#888888", margin: "0" },
  cardReason: { fontSize: "12px", color: "#999999", fontStyle: "italic", margin: "6px 0 0 0" },
  dueBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#e53e3e", backgroundColor: "#ffffff", border: "1px solid #fed7d7", padding: "3px 10px", borderRadius: "99px", flexShrink: 0, whiteSpace: "nowrap" },
  upcomingBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#d69e2e", backgroundColor: "#fffbeb", border: "1px solid #fef08a", padding: "3px 10px", borderRadius: "99px", flexShrink: 0, whiteSpace: "nowrap" },
  completedBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "3px 10px", borderRadius: "99px", flexShrink: 0 },
  cancelledBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", padding: "3px 10px", borderRadius: "99px", flexShrink: 0 },
  executeBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#e53e3e", border: "none", borderRadius: "8px", cursor: "pointer" },
  confirmRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  confirmText: { fontSize: "12px", color: "#888888", fontWeight: "500" },
  confirmYesBtn: { padding: "8px 14px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#e53e3e", border: "none", borderRadius: "8px", cursor: "pointer" },
  confirmNoBtn: { padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
};