"use client";

import { useState, useEffect } from "react";
import { Users, Eye, TrendingUp } from "lucide-react";

export default function DashboardStats({
  waitlistCount,
  profileViews,
  dataRoomRequests,
}: {
  waitlistCount: number;
  profileViews: number;
  dataRoomRequests: number;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const stats = [
    { icon: <Users size={15} color="#111111" />, label: "Waitlist", value: waitlistCount, sub: "Total signups" },
    { icon: <Eye size={15} color="#111111" />, label: "Views", value: profileViews, sub: "Profile views" },
    { icon: <TrendingUp size={15} color="#111111" />, label: "Data Room", value: dataRoomRequests, sub: "Requests received" },
  ];

  return (
    <div style={{
      ...styles.statsRow,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    }}>
      {stats.map((stat) => (
        <div key={stat.label} style={isMobile ? styles.statCardMobile : styles.statCard}>
          {isMobile ? (
            <div style={styles.statCardMobileInner}>
              <div style={styles.statIconBox}>{stat.icon}</div>
              <div style={styles.statMobileInfo}>
                <span style={styles.statLabel}>{stat.label}</span>
                <span style={styles.statSub}>{stat.sub}</span>
              </div>
              <span style={styles.statValueMobile}>{stat.value}</span>
            </div>
          ) : (
            <>
              <div style={styles.statTop}>
                <div style={styles.statIconBox}>{stat.icon}</div>
                <span style={styles.statLabel}>{stat.label}</span>
              </div>
              <p style={styles.statValue}>{stat.value}</p>
              <p style={styles.statSub}>{stat.sub}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  statsRow: { display: "grid", gap: "12px", marginBottom: "24px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statCardMobile: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "14px 16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statCardMobileInner: { display: "flex", alignItems: "center", gap: "12px" },
  statMobileInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  statValueMobile: { fontSize: "22px", fontWeight: "700", color: "#111111", flexShrink: 0 },
  statTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  statIconBox: { width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: "11px", fontWeight: "500", color: "#999999" },
  statValue: { fontSize: "26px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  statSub: { fontSize: "11px", color: "#cccccc", margin: "0" },
};