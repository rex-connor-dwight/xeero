"use client";

type WaitlistEntry = { id: string; email: string; name: string; created_at: string };

export default function WaitlistStats({
  waitlist,
  emailHistoryCount,
}: {
  waitlist: WaitlistEntry[];
  emailHistoryCount: number;
}) {
  if (waitlist.length === 0) return null;

  const thisWeek = waitlist.filter(
    (e) => new Date().getTime() - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;
  const today = waitlist.filter(
    (e) => new Date().getTime() - new Date(e.created_at).getTime() < 24 * 60 * 60 * 1000
  ).length;

  return (
    <div style={styles.statsBar}>
      <div style={styles.statItem}>
        <span style={styles.statValue}>{waitlist.length}</span>
        <span style={styles.statLabel}>Total</span>
      </div>
      <div style={styles.statDivider} />
      <div style={styles.statItem}>
        <span style={styles.statValue}>{thisWeek}</span>
        <span style={styles.statLabel}>This week</span>
      </div>
      <div style={styles.statDivider} />
      <div style={styles.statItem}>
        <span style={styles.statValue}>{today}</span>
        <span style={styles.statLabel}>Today</span>
      </div>
      <div style={styles.statDivider} />
      <div style={styles.statItem}>
        <span style={styles.statValue}>{emailHistoryCount}</span>
        <span style={styles.statLabel}>Emails sent</span>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  statsBar: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statItem: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" },
  statDivider: { width: "1px", height: "32px", backgroundColor: "#f0f0f0" },
};