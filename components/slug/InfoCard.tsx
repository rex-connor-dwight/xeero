type InfoCardProps = {
    label: string;
    icon: React.ReactNode;
    value?: string;
    placeholder?: string;
    fullWidth?: boolean;
  };
  
  export function InfoCard({ label, icon, value, placeholder, fullWidth }: InfoCardProps) {
    const isEmpty = !value;
    return (
      <div style={{
        ...styles.infoCard,
        ...(fullWidth ? styles.infoCardFull : {}),
        ...(isEmpty ? styles.infoCardEmpty : {}),
      }}>
        <div style={styles.infoCardTop}>
          <div style={styles.infoCardIconWrapper}>{icon}</div>
          <span style={styles.infoCardCapsule}>{label}</span>
        </div>
        <p style={{ ...styles.infoCardValue, ...(isEmpty ? styles.infoCardValueEmpty : {}) }}>
          {isEmpty ? (placeholder || "Not added yet") : value}
        </p>
      </div>
    );
  }
  
  export function ValidationScoreCard({ score, band }: { score: number; band: string | null }) {
    const color = score >= 70 ? "#38a169" : score >= 40 ? "#d69e2e" : "#e53e3e";
    const bgColor = score >= 70 ? "#f0fff4" : score >= 40 ? "#fffbeb" : "#fff5f5";
    const borderColor = score >= 70 ? "#c6f6d5" : score >= 40 ? "#fef08a" : "#fed7d7";
    return (
      <div style={{ ...styles.validationCard, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
        <div style={styles.validationCardTop}>
          <div>
            <p style={{ ...styles.validationBand, color }}>{band || "Validated"}</p>
            <p style={{ ...styles.validationSubtext, color }}>{score}/100 — Xeero Validation Score</p>
          </div>
        </div>
        <div style={styles.validationBar}>
          <div style={{ ...styles.validationBarFill, width: `${score}%`, backgroundColor: color }} />
        </div>
        <p style={styles.validationNote}>
          This score reflects how thoroughly the founder validated their idea before building.
        </p>
      </div>
    );
  }
  
  type Styles = { [key: string]: React.CSSProperties };
  const styles: Styles = {
    infoCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
    infoCardFull: { gridColumn: "1 / -1" },
    infoCardEmpty: { backgroundColor: "#fafafa", border: "1px dashed #e5e5e5", boxShadow: "none" },
    infoCardTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
    infoCardIconWrapper: { display: "flex", alignItems: "center" },
    infoCardCapsule: { fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "0.07em", backgroundColor: "#f5f5f5", padding: "3px 10px", borderRadius: "99px" },
    infoCardValue: { fontSize: "14px", color: "#333333", lineHeight: "1.7", margin: "0" },
    infoCardValueEmpty: { color: "#cccccc", fontStyle: "italic", fontSize: "13px" },
    validationCard: { borderRadius: "12px", padding: "16px" },
    validationCardTop: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" },
    validationBand: { fontSize: "14px", fontWeight: "700", margin: "0 0 2px 0" },
    validationSubtext: { fontSize: "12px", color: "#888888", margin: "0" },
    validationBar: { width: "100%", height: "6px", backgroundColor: "#e5e5e5", borderRadius: "99px", overflow: "hidden" },
    validationBarFill: { height: "100%", borderRadius: "99px", transition: "width 0.6s ease" },
    validationNote: { fontSize: "11px", color: "#888888", margin: "10px 0 0 0", lineHeight: "1.5" },
  };