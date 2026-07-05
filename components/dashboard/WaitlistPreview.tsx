"use client";

import { useRouter } from "next/navigation";

type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  created_at: string;
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

export default function WaitlistPreview({
  waitlist,
  waitlistCount,
  isTeamMember,
}: {
  waitlist: WaitlistEntry[];
  waitlistCount: number;
  isTeamMember: boolean;
}) {
  const router = useRouter();
  const base = isTeamMember ? "/team-dashboard" : "/dashboard";

  return (
    <>
      <p style={styles.sectionLabel}>Waitlist</p>
      <div style={styles.waitlistCard}>
        {waitlist.length === 0 ? (
          <div style={styles.waitlistEmpty}>
            <p style={styles.waitlistEmptyTitle}>No one here yet</p>
            <p style={styles.waitlistEmptyText}>Share the profile link and watch the waitlist grow.</p>
          </div>
        ) : (
          <>
            <div style={styles.waitlistHeader}>
              <p style={styles.waitlistHeaderTitle}>
                {waitlistCount} {waitlistCount === 1 ? "person" : "people"} waiting
              </p>
              <div style={styles.waitlistBar}>
                <div style={{ ...styles.waitlistBarFill, width: `${Math.min(waitlistCount * 3, 100)}%` }} />
              </div>
            </div>
            {waitlist.map((entry) => (
              <div key={entry.id} style={styles.waitlistEntry}>
                <div style={styles.waitlistAvatar}>
                  <span style={styles.waitlistAvatarText}>{entry.email[0].toUpperCase()}</span>
                </div>
                <div style={styles.waitlistEntryInfo}>
                  <p style={styles.waitlistEntryEmail}>{entry.email}</p>
                  {entry.name && <p style={styles.waitlistEntryName}>{entry.name}</p>}
                </div>
                <span style={styles.waitlistEntryTime}>{timeAgo(entry.created_at)}</span>
              </div>
            ))}
            {waitlistCount > 5 && (
              <button style={styles.viewAllBtn} onClick={() => router.push(`${base}/waitlist`)}>
                View all {waitlistCount} →
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  waitlistCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "40px" },
  waitlistEmpty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", textAlign: "center", gap: "8px" },
  waitlistEmptyTitle: { fontSize: "14px", fontWeight: "600", color: "#cccccc", margin: "4px 0 0 0" },
  waitlistEmptyText: { fontSize: "12px", color: "#dddddd", margin: "0", lineHeight: "1.6", maxWidth: "220px" },
  waitlistHeader: { padding: "16px 18px 12px 18px", borderBottom: "1px solid #f5f5f5" },
  waitlistHeaderTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 10px 0" },
  waitlistBar: { width: "100%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  waitlistBarFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.6s ease" },
  waitlistEntry: { display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px", borderBottom: "1px solid #f9f9f9" },
  waitlistAvatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  waitlistAvatarText: { fontSize: "13px", fontWeight: "600", color: "#888888" },
  waitlistEntryInfo: { flex: 1 },
  waitlistEntryEmail: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0" },
  waitlistEntryName: { fontSize: "11px", color: "#aaaaaa", margin: "2px 0 0 0" },
  waitlistEntryTime: { fontSize: "11px", color: "#cccccc", flexShrink: 0 },
  viewAllBtn: { width: "100%", padding: "14px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#fafafa", border: "none", borderTop: "1px solid #f5f5f5", cursor: "pointer", textAlign: "center" },
};