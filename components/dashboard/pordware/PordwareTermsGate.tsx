"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, X } from "lucide-react";

export default function PordwareTermsGate({
  onAcknowledge,
  onClose,
}: {
  onAcknowledge: () => void;
  onClose: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={styles.card}>
      <button style={styles.closeBtn} onClick={onClose}>
        <X size={16} color="#888888" />
      </button>

      <div style={styles.icon}>
        <AlertCircle size={22} color="#d69e2e" />
      </div>

      <h2 style={styles.title}>Before you apply</h2>
      <p style={styles.intro}>
        Please read this carefully. It changes how most founders think this program works.
      </p>

      <div style={styles.pointsList}>
        <div style={styles.point}>
          <p style={styles.pointTitle}>This is not free money</p>
          <p style={styles.pointText}>
            You're expected to contribute a portion of the total development cost. This program is
            not designed for founders looking for free software development.
          </p>
        </div>

        <div style={styles.point}>
          <p style={styles.pointTitle}>You don't hire your own developer</p>
          <p style={styles.pointText}>
            Pordware does not pay you cash to go find or hire a CTO or a development team. A qualified
            portfolio development company under Pordware is assigned to execute the project.
          </p>
        </div>

        <div style={styles.point}>
          <p style={styles.pointTitle}>Nothing here is guaranteed</p>
          <p style={styles.pointText}>
            The final development scope, total cost, your contribution, and Pordware's commitment
            are all determined during assessment. Your requested amount is a starting point, not an approval.
          </p>
        </div>

        <div style={styles.point}>
          <p style={styles.pointTitle}>This is for validated businesses</p>
          <p style={styles.pointText}>
            This program is for founders who've already proven a real problem exists and technology
            is now the constraint. It's not for a first idea or an unvalidated concept.
          </p>
        </div>
      </div>

      <label style={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={styles.checkbox}
        />
        <span style={styles.checkboxLabel}>
          I understand this is not a cash grant, I will contribute to development costs, and a
          Pordware portfolio company, not a developer I choose, will execute the project if approved.
        </span>
      </label>

      <button
        style={{ ...styles.continueBtn, opacity: checked ? 1 : 0.5 }}
        onClick={onAcknowledge}
        disabled={!checked}
      >
        I Understand, Start Application
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "relative" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", display: "flex" },
  icon: { width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  intro: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 22px 0" },
  pointsList: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "22px" },
  point: { paddingBottom: "16px", borderBottom: "1px solid #f5f5f5" },
  pointTitle: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  pointText: { fontSize: "12px", color: "#666666", lineHeight: "1.6", margin: "0" },
  checkboxRow: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px", backgroundColor: "#f9f9f9", borderRadius: "10px", border: "1px solid #f0f0f0", marginBottom: "16px", cursor: "pointer" },
  checkbox: { marginTop: "2px", flexShrink: 0, width: "16px", height: "16px", cursor: "pointer" },
  checkboxLabel: { fontSize: "12px", color: "#444444", lineHeight: "1.6" },
  continueBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};