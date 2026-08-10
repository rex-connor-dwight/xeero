"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PordwareStep6({
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
  const [hasEstimate, setHasEstimate] = useState<boolean | null>(application?.has_development_estimate ?? null);
  const [estimatedCost, setEstimatedCost] = useState(application?.estimated_total_cost?.toString() || "");
  const [founderContribution, setFounderContribution] = useState(application?.founder_contribution_amount?.toString() || "");
  const [requestedAmount, setRequestedAmount] = useState(application?.requested_pordware_amount?.toString() || "");
  const [existingDevTeam, setExistingDevTeam] = useState(application?.existing_dev_team || "");
  const [previousWork, setPreviousWork] = useState(application?.previous_development_work || "");
  const [existingAssets, setExistingAssets] = useState(application?.existing_codebase_assets || "");

  const canContinue = hasEstimate !== null && estimatedCost && founderContribution && requestedAmount;

  const handleNext = () => {
    onNext({
      has_development_estimate: hasEstimate,
      estimated_total_cost: parseFloat(estimatedCost) || null,
      founder_contribution_amount: parseFloat(founderContribution) || null,
      requested_pordware_amount: parseFloat(requestedAmount) || null,
      existing_dev_team: existingDevTeam || null,
      previous_development_work: previousWork || null,
      existing_codebase_assets: existingAssets || null,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 6 of 9</p>
      <h2 style={styles.title}>Development Budget</h2>
      <p style={styles.subtitle}>
        These numbers are a starting point. Final scope, cost, and contribution split are determined during assessment.
      </p>

      <label style={styles.label}>Do you already have a development estimate?</label>
      <div style={styles.toggleRow}>
        <button style={{ ...styles.toggleBtn, ...(hasEstimate === true ? styles.toggleBtnActive : {}) }} onClick={() => setHasEstimate(true)}>Yes</button>
        <button style={{ ...styles.toggleBtn, ...(hasEstimate === false ? styles.toggleBtnActive : {}) }} onClick={() => setHasEstimate(false)}>No</button>
      </div>

      <label style={styles.label}>Estimated total development cost (USD)</label>
      <input style={styles.input} type="number" min="0" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} placeholder="e.g. 30000" />

      <label style={styles.label}>Amount you can contribute (USD)</label>
      <input style={styles.input} type="number" min="0" value={founderContribution} onChange={(e) => setFounderContribution(e.target.value)} />

      <label style={styles.label}>Amount you're requesting Pordware cover (USD)</label>
      <input style={styles.input} type="number" min="0" value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} />

      <label style={styles.label}>Any existing development team?</label>
      <textarea style={styles.textarea} value={existingDevTeam} onChange={(e) => setExistingDevTeam(e.target.value)} placeholder="Optional" />

      <label style={styles.label}>Any previous development work completed?</label>
      <textarea style={styles.textarea} value={previousWork} onChange={(e) => setPreviousWork(e.target.value)} placeholder="Optional" />

      <label style={styles.label}>Any existing codebase or technology assets?</label>
      <textarea style={styles.textarea} value={existingAssets} onChange={(e) => setExistingAssets(e.target.value)} placeholder="Optional" />

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
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "60px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  toggleRow: { display: "flex", gap: "8px" },
  toggleBtn: { flex: 1, padding: "10px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  toggleBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};