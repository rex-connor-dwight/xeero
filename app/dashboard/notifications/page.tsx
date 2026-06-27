"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Bell,
  Lock,
  Lightbulb,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type DataRoomRequest = {
  id: string;
  investor_name: string;
  investor_email: string;
  note: string;
  status: string;
  created_at: string;
  access_token: string;
  token_expires_at: string;
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

async function updateRequestStatus(id: string, status: string) {
  const updates: any = { status };

  // Set 24-hour expiry only when approving
  if (status === "approved") {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    updates.token_expires_at = expiresAt.toISOString();
  }

  const { error } = await supabase
    .from("data_room_requests")
    .update(updates)
    .eq("id", id);
  return error;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { profile, profileLoading } = useXeero();
  const [dataRoomRequests, setDataRoomRequests] = useState<DataRoomRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("data_room_requests")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDataRoomRequests(data || []);
        setRequestsLoading(false);
      });
  }, [profile]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
  
    if (status === "approved") {
      // Call edge function — it updates DB + sends email
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/approve-data-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ request_id: id }),
        }
      );
  
      if (res.ok) {
        // Refetch to get updated request with token
        const { data: updated } = await supabase
          .from("data_room_requests")
          .select("*")
          .eq("id", id)
          .single();
  
        setDataRoomRequests((prev) =>
          prev.map((r) => (r.id === id ? (updated as DataRoomRequest) : r))
        );
      }
    } else {
      // Decline — just update directly
      const error = await updateRequestStatus(id, status);
      if (!error) {
        setDataRoomRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    }
  
    setUpdatingId(null);
  };

  const pendingRequests = dataRoomRequests.filter((r) => r.status === "pending");
  const resolvedRequests = dataRoomRequests.filter((r) => r.status !== "pending");
  const totalNotifications = dataRoomRequests.length;
  const firstName = profile?.founder_name?.split(" ")[0] || "Founder";

  if (profileLoading || requestsLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Bell size={18} color="#111111" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Notifications</h1>
            <p style={styles.headerSub}>
              {totalNotifications === 0
                ? "Nothing here yet"
                : `${pendingRequests.length} pending · ${resolvedRequests.length} resolved`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tip ── */}
      <div style={styles.tipCard}>
        <div style={styles.tipIconBox}>
          <Lightbulb size={16} color="#111111" />
        </div>
        <div style={styles.tipBody}>
          <p style={styles.tipTitle}>
            Welcome to your notification center, {firstName}.
          </p>
          <p style={styles.tipText}>
            Data room access requests, waitlist milestones, and messages from the Xeero team will appear here.
          </p>
        </div>
      </div>

      {/* ── Requests ── */}
      {dataRoomRequests.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>
            <AlertCircle size={32} color="#e5e5e5" />
          </div>
          <h2 style={styles.emptyTitle}>No notifications yet</h2>
          <p style={styles.emptyText}>
            When investors request access to your data room or Xeero sends you updates, they'll appear here.
          </p>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <>
              <p style={styles.sectionLabel}>Pending — {pendingRequests.length}</p>
              <div style={styles.requestsList}>
                {pendingRequests.map((req) => (
                  <div key={req.id} style={styles.requestCard}>
                    <div style={styles.requestTop}>
                      <div style={styles.requestLeft}>
                        <div style={styles.requestAvatar}>
                          <Lock size={14} color="#111111" />
                        </div>
                        <div>
                          <p style={styles.requestTitle}>Data Room Request</p>
                          <p style={styles.requestTime}>{timeAgo(req.created_at)}</p>
                        </div>
                      </div>
                      <span style={styles.pendingBadge}>Pending</span>
                    </div>

                    <div style={styles.requestDetails}>
                      <div style={styles.requestDetailRow}>
                        <span style={styles.requestDetailLabel}>Name</span>
                        <span style={styles.requestDetailValue}>{req.investor_name}</span>
                      </div>
                      <div style={styles.requestDetailRow}>
                        <span style={styles.requestDetailLabel}>Email</span>
                        <a href={`mailto:${req.investor_email}`} style={styles.requestDetailLink}>
                          {req.investor_email}
                        </a>
                      </div>
                      {req.note && (
                        <div style={styles.requestDetailRow}>
                          <span style={styles.requestDetailLabel}>Note</span>
                          <span style={styles.requestDetailValue}>{req.note}</span>
                        </div>
                      )}
                    </div>

                    <div style={styles.requestActions}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleUpdateStatus(req.id, "approved")}
                        disabled={updatingId === req.id}
                      >
                        {updatingId === req.id ? "..." : "Approve"}
                      </button>
                      <button
                        style={styles.declineBtn}
                        onClick={() => handleUpdateStatus(req.id, "declined")}
                        disabled={updatingId === req.id}
                      >
                        {updatingId === req.id ? "..." : "Decline"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {resolvedRequests.length > 0 && (
            <>
              <p style={styles.sectionLabel}>Resolved — {resolvedRequests.length}</p>
              <div style={styles.requestsList}>
                {resolvedRequests.map((req) => (
                  <div key={req.id} style={{ ...styles.requestCard, ...styles.requestCardMuted }}>
                    <div style={styles.requestTop}>
                      <div style={styles.requestLeft}>
                        <div style={{ ...styles.requestAvatar, backgroundColor: "#f5f5f5" }}>
                          <Lock size={14} color="#cccccc" />
                        </div>
                        <div>
                          <p style={{ ...styles.requestTitle, color: "#aaaaaa" }}>
                            Data Room Request
                          </p>
                          <p style={styles.requestTime}>
                            {req.investor_name} · {timeAgo(req.created_at)}
                          </p>
                        </div>
                      </div>
                      <span style={{
                        ...styles.pendingBadge,
                        backgroundColor: req.status === "approved" ? "#f0fff4" : "#fff5f5",
                        color: req.status === "approved" ? "#38a169" : "#e53e3e",
                        border: req.status === "approved" ? "1px solid #c6f6d5" : "1px solid #fed7d7",
                      }}>
                        {req.status === "approved" ? "Approved" : "Declined"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div style={styles.comingSoonCard}>
        <TrendingUp size={16} color="#cccccc" />
        <p style={styles.comingSoonText}>
          Waitlist milestones, profile view alerts, and Xeero team messages coming soon.
        </p>
      </div>

    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = {
  [key: string]: React.CSSProperties;
};

const styles: Styles = {
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  tipCard: { backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "16px 18px", display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "20px", border: "1px solid #f0f0f0" },
  tipIconBox: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #f0f0f0" },
  tipBody: { flex: 1 },
  tipTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 4px 0" },
  tipText: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  requestsList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  requestCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  requestCardMuted: { backgroundColor: "#fafafa", boxShadow: "none" },
  requestTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
  requestLeft: { display: "flex", alignItems: "center", gap: "10px" },
  requestAvatar: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  requestTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  requestTime: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  pendingBadge: { fontSize: "11px", fontWeight: "600", color: "#d69e2e", backgroundColor: "#fffff0", border: "1px solid #fefcbf", padding: "3px 10px", borderRadius: "99px" },
  requestDetails: { backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "8px" },
  requestDetailRow: { display: "flex", gap: "12px", alignItems: "flex-start" },
  requestDetailLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em", width: "44px", flexShrink: 0, paddingTop: "1px" },
  requestDetailValue: { fontSize: "13px", color: "#333333", lineHeight: "1.5", flex: 1 },
  requestDetailLink: { fontSize: "13px", color: "#111111", fontWeight: "500", textDecoration: "underline", flex: 1 },
  requestActions: { display: "flex", gap: "8px" },
  approveBtn: { flex: 1, padding: "9px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  declineBtn: { flex: 1, padding: "9px", fontSize: "13px", fontWeight: "500", color: "#e53e3e", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "16px" },
  emptyIcon: { marginBottom: "12px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#cccccc", margin: "0 0 6px 0" },
  emptyText: { fontSize: "13px", color: "#dddddd", margin: "0", lineHeight: "1.6", maxWidth: "260px" },
  comingSoonCard: { display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px dashed #e5e5e5", marginTop: "8px" },
  comingSoonText: { fontSize: "12px", color: "#cccccc", margin: "0", lineHeight: "1.5" },
};