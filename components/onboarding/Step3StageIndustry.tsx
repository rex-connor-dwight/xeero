"use client";

export default function Step3StageIndustry({
  stage,
  industry,
  businessModel,
  onChange,
}: {
  stage: string;
  industry: string;
  businessModel: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div style={styles.stepContent}>
      <h1 style={styles.heading}>Where are you right now?</h1>
      <p style={styles.subheading}>Help investors understand your current stage.</p>

      <label style={styles.label}>Stage</label>
      <select style={styles.select} value={stage} onChange={(e) => onChange("stage", e.target.value)}>
        <option value="">Select your stage</option>
        <option value="idea">Idea</option>
        <option value="building">Building</option>
        <option value="launched">Launched</option>
        <option value="scaling">Scaling</option>
      </select>

      <label style={styles.label}>Industry</label>
      <select style={styles.select} value={industry} onChange={(e) => onChange("industry", e.target.value)}>
        <option value="">Select your industry</option>
        <option value="fintech">Fintech</option>
        <option value="healthtech">Healthtech</option>
        <option value="edtech">Edtech</option>
        <option value="ecommerce">E-commerce</option>
        <option value="saas">SaaS</option>
        <option value="ai">AI</option>
        <option value="logistics">Logistics</option>
        <option value="other">Other</option>
      </select>

      <label style={styles.label}>Business Model</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. Subscription, one-time fee, marketplace"
        value={businessModel}
        onChange={(e) => onChange("business_model", e.target.value)}
      />
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  stepContent: { marginBottom: "32px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", marginBottom: "8px" },
  subheading: { fontSize: "13px", color: "#666666", marginBottom: "28px", lineHeight: "1.6" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#111111", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa" },
  select: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", appearance: "none" },
};