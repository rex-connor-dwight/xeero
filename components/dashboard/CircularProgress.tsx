"use client";

export default function CircularProgress({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={styles.wrapper}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={styles.inner}>
        <span style={{ ...styles.score, color }}>{score}%</span>
        <span style={styles.label}>Validation{"\n"}score</span>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  wrapper: { position: "relative", width: "140px", height: "140px", flexShrink: 0 },
  inner: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" },
  score: { fontSize: "28px", fontWeight: "700", lineHeight: "1" },
  label: { fontSize: "10px", color: "#aaaaaa", fontWeight: "500", textAlign: "center", lineHeight: "1.3", maxWidth: "70px", whiteSpace: "pre-line" },
};