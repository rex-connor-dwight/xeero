"use client";

import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

export default function PordwareStep9({
  application,
  saving,
  onSubmit,
  onBack,
}: {
  application: any;
  saving: boolean;
  onSubmit: (data: Record<string, any>) => void;
  onBack: () => void;
}) {
  const [whySupport, setWhySupport] = useState(application?.why_support_this || "");
  const [whatBuilt, setWhatBuilt] = useState(application?.what_built_without_tech || "");
  const [customerLearning, setCustomerLearning] = useState(application?.customer_learning || "");
  const [fallbackPlan, setFallbackPlan] = useState(application?.fallback_plan || "");

  const canSubmit = whySupport && whatBuilt && customerLearning && fallbackPlan;

  const handleSubmit = () => {
    onSubmit({
      why_support_this: whySupport,
      what_built_without_tech: whatBuilt,
      customer_learning: customerLearning,
      fallback_plan: fallbackPlan,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 9 of 9</p>
      <h2 style={styles.title}>Founder Questions</h2>
      <p style={styles.subtitle}>Last section. These test resourcefulness and clarity, not polish.</p>

      <label style={styles.label}>Why should Pordware support the development of this technology?</label>
      <textarea style={styles.textarea} value={whySupport} onChange={(e) => setWhySupport(e.target.value)} />

      <label style={styles.label}>What have you already built without technology?</label>
      <textarea style={styles.textarea} value={whatBuilt} onChange={(e) => setWhatBuilt(e.target.value)} />

      <label style={styles.label}>What have you learned from your customers that changed the way you think about this business?</label>
      <textarea style={styles.textarea} value={customerLearning} onChange={(e) => setCustomerLearning(e.target.value)} />

      <label style={styles.label}>If we do not fund the technology development, what will you do instead?</label>
      <textarea style={styles.textarea} value={fallbackPlan} onChange={(e) => setFallbackPlan(e.target.value)} />

      <div style={styles.navRow}>
        <button style={styles.backBtn} onClick={onBack}><ArrowLeft size={13} />Back</button>
        <button
          style={{ ...styles.submitBtn, opacity: canSubmit && !saving ? 1 : 0.5 }}
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
        >
          {saving ? "Submitting..." : "Submit Application"}
          {!saving && <Send size={13} />}
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
  submitBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};