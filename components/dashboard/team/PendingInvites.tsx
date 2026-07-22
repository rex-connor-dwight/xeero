"use client";

import { Clock, Mail, Trash2 } from "lucide-react";

type Invite = {
  id: string;
  email: string;
  role: string;
  accepted: boolean;
  expires_at: string;
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

export default function PendingInvites({
  invites,
  onDelete,
}: {
  invites: Invite[];
  onDelete: (id: string) => void;
}) {
  if (invites.length === 0) return null;

  return (
    <>
      <p style={styles.sectionLabel}>Pending invites</p>
      <div style={styles.membersList}>
        {invites.map((inv) => (
          <div key={inv.id} style={styles.memberRow}>
            <div style={{ ...styles.memberAvatar, backgroundColor: "#fffbeb" }}>
              <Mail size={16} color="#d69e2e" />
            </div>
            <div style={styles.memberInfo}>
              <p style={styles.memberName}>{inv.email}</p>
              <p style={styles.memberRole}>{inv.role}</p>
              <div style={styles.inviteStatus}>
                <Clock size={11} color="#d69e2e" />
                <span style={styles.inviteStatusText}>
                  Sent {timeAgo(inv.created_at)} · expires {new Date(inv.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button style={styles.deleteBtn} onClick={() => onDelete(inv.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  membersList: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", marginBottom: "24px" },
  memberRow: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px 18px" },
  memberAvatar: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  memberRole: { fontSize: "12px", color: "#888888", margin: "0 0 8px 0" },
  inviteStatus: { display: "flex", alignItems: "center", gap: "4px" },
  inviteStatusText: { fontSize: "11px", color: "#d69e2e" },
  deleteBtn: { width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e", flexShrink: 0 },
};