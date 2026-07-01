"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { ExternalLink, Bell } from "lucide-react";

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

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { profile, profileLoading } = useXeero();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
  }, [profile]);

  const fetchNotifications = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);

    // Mark all as read
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("profile_id", profile.id)
      .eq("read", false);
  };

  if (profileLoading || loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Bell size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.sub}>Opportunities and updates curated for you.</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>
            <Bell size={24} color="#cccccc" />
          </div>
          <h3 style={styles.emptyTitle}>No notifications yet</h3>
          <p style={styles.emptyText}>
            When funding opportunities, pitch competitions, and investor events are available, you'll see them here.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => (
            <div key={n.id} style={{ ...styles.card, opacity: n.read ? 0.8 : 1 }}>
              {n.image_url && (
                <img src={n.image_url} alt="" style={styles.cardImage} />
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <div style={styles.cardBadge}>
                    <span style={styles.cardBadgeText}>
                      {n.type === "opportunity" ? "Opportunity" : "Update"}
                    </span>
                  </div>
                  {!n.read && <div style={styles.unreadDot} />}
                  <span style={styles.cardTime}>{timeAgo(n.created_at)}</span>
                </div>
                <h3 style={styles.cardTitle}>{n.title}</h3>
                <p style={styles.cardBody2}>{n.body}</p>
                {n.cta_label && n.cta_url && (
                  
                  <a  href={n.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.ctaBtn}
                  >
                    {n.cta_label}
                    <ExternalLink size={12} />
                  </a>
                )}
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
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
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