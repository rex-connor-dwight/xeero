"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PordwareStep3({
  activeProfile,
  application,
  saving,
  onNext,
  onBack,
}: {
  activeProfile: any;
  application: any;
  saving: boolean;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
}) {
  const [problemDescription, setProblemDescription] = useState(application?.problem_description || activeProfile?.problem || "");
  const [whoExperiences, setWhoExperiences] = useState(application?.who_experiences_problem || "");
  const [currentSolutions, setCurrentSolutions] = useState(application?.current_solutions || "");
  const [validationMethod, setValidationMethod] = useState(application?.validation_method || "");
  const [customersSpoken, setCustomersSpoken] = useState(application?.customers_spoken_to || "");
  const [demandEvidence, setDemandEvidence] = useState(application?.demand_evidence || "");
  const [paidForManual, setPaidForManual] = useState<boolean | null>(application?.customers_paid_for_manual_version ?? null);
  const [preRevenueEvidence, setPreRevenueEvidence] = useState(application?.pre_revenue_demand_evidence || "");

  const canContinue = problemDescription && whoExperiences && currentSolutions && validationMethod && customersSpoken && demandEvidence && paidForManual !== null;

  const handleNext = () => {
    onNext({
      problem_description: problemDescription,
      who_experiences_problem: whoExperiences,
      current_solutions: currentSolutions,
      validation_method: validationMethod,
      customers_spoken_to: customersSpoken,
      demand_evidence: demandEvidence,
      customers_paid_for_manual_version: paidForManual,
      pre_revenue_demand_evidence: preRevenueEvidence || null,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 3 of 9</p>
      <h2 style={styles.title}>Problem Validation</h2>
      <p style={styles.subtitle}>We're looking for evidence, not ambition. Be specific.</p>

      <label style={styles.label}>What problem are you solving?</label>
      <textarea style={styles.textarea} value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} />

      <label style={styles.label}>Who experiences this problem?</label>
      <textarea style={styles.textarea} value={whoExperiences} onChange={(e) => setWhoExperiences(e.target.value)} />

      <label style={styles.label}>How are people currently solving it?</label>
      <textarea style={styles.textarea} value={currentSolutions} onChange={(e) => setCurrentSolutions(e.target.value)} />

      <label style={styles.label}>How did you validate that this problem exists?</label>
      <textarea style={styles.textarea} value={validationMethod} onChange={(e) => setValidationMethod(e.target.value)} />

      <label style={styles.label}>How many potential customers/users have you spoken to?</label>
      <input style={styles.input} value={customersSpoken} onChange={(e) => setCustomersSpoken(e.target.value)} placeholder="e.g. 40+ interviews" />

      <label style={styles.label}>What evidence do you have that people want the solution?</label>
      <textarea style={styles.textarea} value={demandEvidence} onChange={(e) => setDemandEvidence(e.target.value)} />

      <label style={styles.label}>Have customers paid for the existing/manual version of the solution?</label>
      <div style={styles.toggleRow}>
        <button
          style={{ ...styles.toggleBtn, ...(paidForManual === true ? styles.toggleBtnActive : {}) }}
          onClick={() => setPaidForManual(true)}
        >
          Yes
        </button>
        <button
          style={{ ...styles.toggleBtn, ...(paidForManual === false ? styles.toggleBtnActive : {}) }}
          onClick={() => setPaidForManual(false)}
        >
          No
        </button>
      </div>

      <label style={styles.label}>If pre-revenue, what evidence demonstrates demand?</label>
      <textarea style={styles.textarea} value={preRevenueEvidence} onChange={(e) => setPreRevenueEvidence(e.target.value)} placeholder="Optional if you already have revenue" />

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
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  toggleRow: { display: "flex", gap: "8px" },
  toggleBtn: { flex: 1, padding: "10px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  toggleBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};