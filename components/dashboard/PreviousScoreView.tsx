"use client";

import { RefreshCw } from "lucide-react";
import CircularProgress from "@/components/dashboard/CircularProgress";
import { calculateScore, getScoreBand } from "@/lib/data/validate";

export default function PreviousScoreView({
  score,
  answers,
  readOnly,
  onRevalidate,
}: {
  score: number;
  band: string;
  answers: any;
  readOnly?: boolean;
  onRevalidate: () => void;
}) {
  const scoreBand = getScoreBand(score);
  const breakdown = answers ? calculateScore(answers).breakdown : [];

  const levels = [
    { label: "Strong signals", value: breakdown.filter((b) => b.points === b.max).length, color: "#38a169" },
    { label: "Partial signals", value: breakdown.filter((b) => b.points > 0 && b.points < b.max).length, color: "#d69e2e" },
    { label: "Missing signals", value: breakdown.filter((b) => b.points === 0).length, color: "#e53e3e" },
  ];

  return (
    <div style={styles.resultsWrapper}>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>{scoreBand.label}</span>
          {!readOnly && (
            <button style={styles.revalidateBtn} onClick={onRevalidate}>
              <RefreshCw size={12} />Revalidate
            </button>
          )}
        </div>

        <div style={styles.body}>
          <CircularProgress score={score} color={scoreBand.color} />
          <div style={styles.distribution}>
            <p style={styles.distributionTitle}>Validation Level</p>
            {levels.map((level) => (
              <div key={level.label} style={styles.distributionRow}>
                <span style={styles.distributionLabel}>{level.label}</span>
                <span style={styles.distributionColon}>:</span>
                <span style={{ ...styles.distributionValue, color: level.color }}>
                  {level.value}/{breakdown.length || 5}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.divider} />
        <p style={styles.advice}>{scoreBand.advice}</p>
      </div>

      {breakdown.length > 0 && (
        <div style={styles.breakdownCard}>
          <p style={styles.breakdownTitle}>Score Breakdown</p>
          {breakdown.map((item) => (
            <div key={item.label} style={styles.breakdownRow}>
              <div style={styles.breakdownLeft}>
                <span style={styles.breakdownLabel}>{item.label}</span>
                <div style={styles.breakdownBar}>
                  <div style={{
                    ...styles.breakdownBarFill,
                    width: `${(item.points / item.max) * 100}%`,
                    backgroundColor: item.points === item.max ? "#38a169" : item.points > 0 ? "#d69e2e" : "#e5e5e5",
                  }} />
                </div>
              </div>
              <span style={{ ...styles.breakdownScore, color: item.points === 0 ? "#cccccc" : "#111111" }}>
                {item.points}/{item.max}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  resultsWrapper: { width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "14px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: "17px", fontWeight: "700", color: "#111111" },
  revalidateBtn: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", padding: "5px 12px", cursor: "pointer" },
  body: { display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" },
  distribution: { flex: 1, minWidth: "160px", display: "flex", flexDirection: "column", gap: "10px" },
  distributionTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 4px 0" },
  distributionRow: { display: "flex", alignItems: "center", gap: "8px" },
  distributionLabel: { fontSize: "13px", color: "#555555", flex: 1 },
  distributionColon: { fontSize: "13px", color: "#cccccc" },
  distributionValue: { fontSize: "13px", fontWeight: "600", minWidth: "32px", textAlign: "right" },
  divider: { height: "1px", backgroundColor: "#f0f0f0" },
  advice: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0" },
  breakdownCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "22px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  breakdownTitle: { fontSize: "12px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px 0" },
  breakdownRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  breakdownLeft: { flex: 1 },
  breakdownLabel: { fontSize: "12px", fontWeight: "500", color: "#444444", display: "block", marginBottom: "4px" },
  breakdownBar: { width: "100%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  breakdownBarFill: { height: "100%", borderRadius: "99px", transition: "width 0.5s ease" },
  breakdownScore: { fontSize: "12px", fontWeight: "600", flexShrink: 0, width: "36px", textAlign: "right" },
};