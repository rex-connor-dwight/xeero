"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PordwareStep7({
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
  const [revenueModel, setRevenueModel] = useState(application?.revenue_model || "");
  const [currentPricing, setCurrentPricing] = useState(application?.current_pricing_model || "");
  const [expectedChange, setExpectedChange] = useState(application?.expected_change_after_tech || "");
  const [expectedRevenue, setExpectedRevenue] = useState(application?.expected_revenue_impact || "");
  const [expectedSavings, setExpectedSavings] = useState(application?.expected_cost_savings || "");
  const [expectedCapacity, setExpectedCapacity] = useState(application?.expected_capacity_increase || "");

  const canContinue = revenueModel && currentPricing && expectedChange;

  const handleNext = () => {
    onNext({
      revenue_model: revenueModel,
      current_pricing_model: currentPricing,
      expected_change_after_tech: expectedChange,
      expected_revenue_impact: expectedRevenue || null,
      expected_cost_savings: expectedSavings || null,
      expected_capacity_increase: expectedCapacity || null,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 7 of 9</p>
      <h2 style={styles.title}>Business Model</h2>
      <p style={styles.subtitle}>The economic impact of the technology investment.</p>

      <label style={styles.label}>How does the business make money?</label>
      <textarea style={styles.textarea} value={revenueModel} onChange={(e) => setRevenueModel(e.target.value)} />

      <label style={styles.label}>What is the current pricing model?</label>
      <textarea style={styles.textarea} value={currentPricing} onChange={(e) => setCurrentPricing(e.target.value)} />

      <label style={styles.label}>What will change after technology is introduced?</label>
      <textarea style={styles.textarea} value={expectedChange} onChange={(e) => setExpectedChange(e.target.value)} />

      <label style={styles.label}>What is the expected revenue impact?</label>
      <textarea style={styles.textarea} value={expectedRevenue} onChange={(e) => setExpectedRevenue(e.target.value)} placeholder="Optional" />

      <label style={styles.label}>What is the expected cost saving?</label>
      <textarea style={styles.textarea} value={expectedSavings} onChange={(e) => setExpectedSavings(e.target.value)} placeholder="Optional" />

      <label style={styles.label}>What is the expected increase in customer/user capacity?</label>
      <textarea style={styles.textarea} value={expectedCapacity} onChange={(e) => setExpectedCapacity(e.target.value)} placeholder="Optional" />

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
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "60px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};