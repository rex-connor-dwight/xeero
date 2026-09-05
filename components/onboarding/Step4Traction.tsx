"use client";

export default function Step4Traction({
  traction,
  location,
  onChange,
}: {
  traction: string;
  location: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div style={styles.stepContent}>
      <h1 style={styles.heading}>Any early traction?</h1>
      <p style={styles.subheading}>Numbers build trust. Share whatever you have, even small wins count.</p>

      <label style={styles.label}>Traction</label>
      <textarea
        style={styles.textarea}
        placeholder="e.g. 200 waitlist signups, $5k MRR, 50 beta users"
        value={traction}
        onChange={(e) => onChange("traction", e.target.value)}
      />

      <label style={styles.label}>Location</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. Lagos, Nigeria"
        value={location}
        onChange={(e) => onChange("location", e.target.value)}
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
  textarea: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", minHeight: "100px", resize: "vertical", fontFamily: "inherit" },
};