"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PordwareStep4({
  application,
  saving,
  onNext,
  onBack,
}: {
  application: any;
  saving: boolean;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
}) {
  const [currentOperations, setCurrentOperations] = useState(application?.business_current_operations || "");
  const [manualProcesses, setManualProcesses] = useState(application?.manual_processes || "");
  const [scalingBlockers, setScalingBlockers] = useState(application?.scaling_blockers || "");
  const [techImprovementArea, setTechImprovementArea] = useState(application?.tech_improvement_area || "");
  const [consequenceIfNotBuilt, setConsequenceIfNotBuilt] = useState(application?.consequence_if_not_built || "");

  const canContinue = currentOperations && manualProcesses && scalingBlockers && techImprovementArea && consequenceIfNotBuilt;

  const handleNext = () => {
    onNext({
      business_current_operations: currentOperations,
      manual_processes: manualProcesses,
      scaling_blockers: scalingBlockers,
      tech_improvement_area: techImprovementArea,
      consequence_if_not_built: consequenceIfNotBuilt,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 4 of 9</p>
      <h2 style={styles.title}>Current Business</h2>
      <p style={styles.subtitle}>Help us understand whether technology is genuinely the constraint.</p>

      <label style={styles.label}>What does the business currently do?</label>
      <textarea style={styles.textarea} value={currentOperations} onChange={(e) => setCurrentOperations(e.target.value)} />

      <label style={styles.label}>What is currently being done manually?</label>
      <textarea style={styles.textarea} value={manualProcesses} onChange={(e) => setManualProcesses(e.target.value)} />

      <label style={styles.label}>What is preventing the business from scaling?</label>
      <textarea style={styles.textarea} value={scalingBlockers} onChange={(e) => setScalingBlockers(e.target.value)} />

      <label style={styles.label}>What part of the business is technology expected to improve?</label>
      <textarea style={styles.textarea} value={techImprovementArea} onChange={(e) => setTechImprovementArea(e.target.value)} />

      <label style={styles.label}>What happens if the technology is not built?</label>
      <textarea style={styles.textarea} value={consequenceIfNotBuilt} onChange={(e) => setConsequenceIfNotBuilt(e.target.value)} />

      <div style={styles.navRow}>
        <button style={styles.backBtn} onClick={onBack}><ArrowLeft size={13} />Back</button>
        <button
          style={{ ...styles.nextBtn, opacity: canContinue && !saving ? 1 : 0.5 }}
          onClick={handleNext}
          disabled={!canContinue || saving}
        >
          {saving ? "Saving..." : "Save & Continue"}
          {!saving && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  stepLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 20px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};