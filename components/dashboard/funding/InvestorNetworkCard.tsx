"use client";

import { useState } from "react";
import { Rocket, Lock } from "lucide-react";

export default function InvestorNetworkCard() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.headerIcon}>
          <Rocket size={18} color="#aaaaaa" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>Investor Network</h2>
            <span style={styles.closedBadge}>
              <Lock size={10} />Closed
            </span>
          </div>
          <p style={styles.subtitle}>Submit your startup for review by our investor network.</p>
        </div>
      </div>

      <p style={styles.notice}>
        This is temporarily closed for new applications.{" "}
        <button style={styles.linkBtn} onClick={() => setShowInfo(!showInfo)}>
          {showInfo ? "Hide details" : "Learn more"}
        </button>
      </p>

      {showInfo && (
        <p style={styles.infoText}>
          We're reworking how startups get matched with investors in our network.
          Reopening soon, no action needed on your end in the meantime.
        </p>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", opacity: 0.85 },
  headerRow: { display: "flex", gap: "14px", marginBottom: "4px" },
  headerIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  titleRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  title: { fontSize: "15px", fontWeight: "700", color: "#666666", margin: "0" },
  closedBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: "700", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", padding: "3px 9px", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.04em" },
  subtitle: { fontSize: "12px", color: "#aaaaaa", margin: "4px 0 0 0" },
  notice: { fontSize: "12px", color: "#999999", margin: "16px 0 0 0", lineHeight: "1.6" },
  linkBtn: { background: "none", border: "none", color: "#111111", fontSize: "12px", fontWeight: "600", cursor: "pointer", textDecoration: "underline", padding: "0" },
  infoText: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "8px 0 0 0" },
};