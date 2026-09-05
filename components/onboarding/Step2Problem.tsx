"use client";

export default function Step2Problem({
  problem,
  solution,
  onChange,
}: {
  problem: string;
  solution: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div style={styles.stepContent}>
      <h1 style={styles.heading}>What problem are you solving?</h1>
      <p style={styles.subheading}>Be clear and specific. Investors fund solutions to real problems.</p>

      <label style={styles.label}>The Problem</label>
      <textarea
        style={styles.textarea}
        placeholder="What pain point does your startup address?"
        value={problem}
        onChange={(e) => onChange("problem", e.target.value)}
      />

      <label style={styles.label}>Your Solution</label>
      <textarea
        style={styles.textarea}
        placeholder="How does your startup solve it?"
        value={solution}
        onChange={(e) => onChange("solution", e.target.value)}
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
  textarea: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", minHeight: "100px", resize: "vertical", fontFamily: "inherit" },
};