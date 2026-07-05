"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { ExternalLink, Bell, Lock, Lightbulb } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  read: boolean;
  created_at: string;
};

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
  if (status === "approved") {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    updates.token_expires_at = expiresAt.toISOString();
  }
  const { error } = await supabase.from("data_room_requests").update(updates).eq("id", id);
  return error;
}

export default function NotificationsView() {
  const { profile, profileLoading, isTeamMember, founderProfile, teamProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;
  const canManageDataRoom = !isTeamMember || (teamProfile?.permissions || []).includes("data_room");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataRoomRequests, setDataRoomRequests] = useState<DataRoomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile) return;
    fetchAll();
  }, [activeProfile]);

  const fetchAll = async () => {
    if (!activeProfile) return;

    const [notifRes, drRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", activeProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("data_room_requests")
        .select("*")
        .eq("profile_id", activeProfile.id)
        .order("created_at", { ascending: false }),
    ]);

    setNotifications(notifRes.data || []);
    setDataRoomRequests(drRes.data || []);
    setLoading(false);

    if (!isTeamMember) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("profile_id", activeProfile.id)
        .eq("read", false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!canManageDataRoom) return;
    setUpdatingId(id);

    if (status === "approved") {
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
        const { data: updated } = await supabase
          .from("data_room_requests")
          .select("*")
          .eq("id", id)
          .single();
        setDataRoomRequests((prev) => prev.map((r) => (r.id === id ? (updated as DataRoomRequest) : r)));
      }
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/decline-data-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ request_id: id }),
        }
      );
      setDataRoomRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }

    setUpdatingId(null);
  };

  if (profileLoading || loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const pendingRequests = dataRoomRequests.filter((r) => r.status === "pending");
  const resolvedRequests = dataRoomRequests.filter((r) => r.status !== "pending");
  const hasAnything = notifications.length > 0 || dataRoomRequests.length > 0;

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Bell size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.sub}>
            {pendingRequests.length > 0
              ? `${pendingRequests.length} data room request${pendingRequests.length !== 1 ? "s" : ""} pending`
              : `Updates for ${activeProfile?.startup_name || "this startup"}`}
          </p>
        </div>
      </div>

      {!hasAnything ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>
            <Bell size={24} color="#cccccc" />
          </div>
          <h3 style={styles.emptyTitle}>No notifications yet</h3>
          <p style={styles.emptyText}>
            Data room requests, funding opportunities, and updates will show up here.
          </p>
        </div>
      ) : (
        <>
          {/* ── Pending Data Room Requests ── */}
          {pendingRequests.length > 0 && (
            <>
              <p style={styles.sectionLabel}>Pending — {pendingRequests.length}</p>
              <div style={styles.list}>
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

                    {canManageDataRoom ? (
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
                    ) : (
                      <p style={styles.noPermissionText}>
                        You don't have permission to manage data room requests. Ask the founder to review this.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Resolved Data Room Requests ── */}
          {resolvedRequests.length > 0 && (
            <>
              <p style={styles.sectionLabel}>Resolved — {resolvedRequests.length}</p>
              <div style={styles.list}>
                {resolvedRequests.map((req) => (
                  <div key={req.id} style={{ ...styles.requestCard, ...styles.requestCardMuted }}>
                    <div style={styles.requestTop}>
                      <div style={styles.requestLeft}>
                        <div style={{ ...styles.requestAvatar, backgroundColor: "#f5f5f5" }}>
                          <Lock size={14} color="#cccccc" />
                        </div>
                        <div>
                          <p style={{ ...styles.requestTitle, color: "#aaaaaa" }}>Data Room Request</p>
                          <p style={styles.requestTime}>{req.investor_name} · {timeAgo(req.created_at)}</p>
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

          {/* ── Opportunities / Updates ── */}
          {notifications.length > 0 && (
            <>
              <p style={styles.sectionLabel}>Updates</p>
              <div style={styles.list}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ ...styles.card, opacity: n.read || isTeamMember ? 0.8 : 1 }}>
                    {n.image_url && <img src={n.image_url} alt="" style={styles.cardImage} />}
                    <div style={styles.cardBody}>
                      <div style={styles.cardTop}>
                        <div style={styles.cardBadge}>
                          <span style={styles.cardBadgeText}>
                            {n.type === "opportunity" ? "Opportunity" : "Update"}
                          </span>
                        </div>
                        {!n.read && !isTeamMember && <div style={styles.unreadDot} />}
                        <span style={styles.cardTime}>{timeAgo(n.created_at)}</span>
                      </div>
                      <h3 style={styles.cardTitle}>{n.title}</h3>
                      <p style={styles.cardBody2}>{n.body}</p>
                      {n.cta_label && n.cta_url && (
                        <a href={n.cta_url} target="_blank" rel="noopener noreferrer" style={styles.ctaBtn}>
                          {n.cta_label}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px 0" },
  list: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
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
  noPermissionText: { fontSize: "12px", color: "#aaaaaa", fontStyle: "italic", margin: "0" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardImage: { width: "100%", height: "140px", objectFit: "cover", display: "block" },
  cardBody: { padding: "20px" },
  cardTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  cardBadge: { display: "inline-block", padding: "3px 10px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "99px" },
  cardBadgeText: { fontSize: "10px", fontWeight: "600", color: "#38a169", textTransform: "uppercase", letterSpacing: "0.08em" },
  unreadDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#111111" },
  cardTime: { fontSize: "11px", color: "#bbbbbb", marginLeft: "auto" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0", lineHeight: "1.3" },
  cardBody2: { fontSize: "13px", color: "#555555", lineHeight: "1.7", margin: "0 0 16px 0" },
  ctaBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", backgroundColor: "#111111", color: "#ffffff", fontSize: "13px", fontWeight: "600", borderRadius: "8px", textDecoration: "none" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  emptyText: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0", maxWidth: "280px" },
};