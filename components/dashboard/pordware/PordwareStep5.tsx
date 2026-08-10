"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PLATFORM_OPTIONS = ["Web", "Mobile", "Backend", "API/Integrations", "Admin Dashboard", "Internal Tools", "Other"];

export default function PordwareStep5({
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
  const [technologyDescription, setTechnologyDescription] = useState(application?.technology_description || "");
  const [whyNeededNow, setWhyNeededNow] = useState(application?.why_needed_now || "");
  const [currentAlternative, setCurrentAlternative] = useState(application?.current_alternative || "");
  const [hasExistingMvp, setHasExistingMvp] = useState<boolean | null>(application?.has_existing_mvp ?? null);
  const [platforms, setPlatforms] = useState<string[]>(application?.platforms_required || []);
  const [minimumProduct, setMinimumProduct] = useState(application?.minimum_product_description || "");
  const [success90Days, setSuccess90Days] = useState(application?.success_90_days || "");

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const canContinue = technologyDescription && whyNeededNow && hasExistingMvp !== null && platforms.length > 0 && minimumProduct && success90Days;

  const handleNext = () => {
    onNext({
      technology_description: technologyDescription,
      why_needed_now: whyNeededNow,
      current_alternative: currentAlternative || null,
      has_existing_mvp: hasExistingMvp,
      platforms_required: platforms,
      minimum_product_description: minimumProduct,
      success_90_days: success90Days,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 5 of 9</p>
      <h2 style={styles.title}>Technology Request</h2>
      <p style={styles.subtitle}>What do you actually need built.</p>

      <label style={styles.label}>What do you want to build?</label>
      <textarea style={styles.textarea} value={technologyDescription} onChange={(e) => setTechnologyDescription(e.target.value)} />

      <label style={styles.label}>Why does the business need this technology now?</label>
      <textarea style={styles.textarea} value={whyNeededNow} onChange={(e) => setWhyNeededNow(e.target.value)} />

      <label style={styles.label}>What is currently being used instead?</label>
      <textarea style={styles.textarea} value={currentAlternative} onChange={(e) => setCurrentAlternative(e.target.value)} placeholder="Optional" />

      <label style={styles.label}>Is there an existing MVP?</label>
      <div style={styles.toggleRow}>
        <button style={{ ...styles.toggleBtn, ...(hasExistingMvp === true ? styles.toggleBtnActive : {}) }} onClick={() => setHasExistingMvp(true)}>Yes</button>
        <button style={{ ...styles.toggleBtn, ...(hasExistingMvp === false ? styles.toggleBtnActive : {}) }} onClick={() => setHasExistingMvp(false)}>No</button>
      </div>

      <label style={styles.label}>What platforms are required?</label>
      <div style={styles.chipGrid}>
        {PLATFORM_OPTIONS.map((p) => (
          <button
            key={p}
            style={{ ...styles.chip, ...(platforms.includes(p) ? styles.chipActive : {}) }}
            onClick={() => togglePlatform(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <label style={styles.label}>Describe the minimum technology product required to move the business forward</label>
      <textarea style={styles.textarea} value={minimumProduct} onChange={(e) => setMinimumProduct(e.target.value)} />

      <label style={styles.label}>What would success look like 90 days after the technology is launched?</label>
      <textarea style={styles.textarea} value={success90Days} onChange={(e) => setSuccess90Days(e.target.value)} />

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
  toggleRow: { display: "flex", gap: "8px" },
  toggleBtn: { flex: 1, padding: "10px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  toggleBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  chipActive: { color: "#111111", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", fontWeight: "600" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};