"use client";

import { useState } from "react";
import { Cpu, ArrowRight } from "lucide-react";
import PordwareApplicationFlow from "@/components/dashboard/pordware/PordwareApplicationFlow";

export default function PordwareFundCard() {
  const [applying, setApplying] = useState(false);

  if (applying) {
    return <PordwareApplicationFlow onClose={() => setApplying(false)} />;
  }

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.headerIcon}><Cpu size={18} color="#111111" /></div>
        <div>
          <h2 style={styles.title}>Pordware Technology Fund</h2>
          <p style={styles.subtitle}>Build the technology your validated business needs.</p>
        </div>
      </div>

      <p style={styles.body}>
        Pordware commits between $20,000 and $50,000 in technology development to selected startups
        that have already validated their problem and are ready to build the technology layer to scale.
        You contribute a portion of the development cost, Pordware covers the approved balance.
      </p>

      <p style={styles.notFor}>
        This isn't for a first idea, and it isn't free development credit. It's for founders who've
        already proven demand and need technology to remove the bottleneck.
      </p>

      <button style={styles.applyBtn} onClick={() => setApplying(true)}>
        Apply for the Technology Fund
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  headerRow: { display: "flex", gap: "14px", marginBottom: "16px" },
  headerIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  subtitle: { fontSize: "12px", color: "#888888", margin: "0" },
  body: { fontSize: "13px", color: "#555555", lineHeight: "1.7", margin: "0 0 12px 0" },
  notFor: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "0 0 20px 0", fontStyle: "italic" },
  applyBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};