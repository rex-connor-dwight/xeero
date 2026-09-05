"use client";

export default function Step1Identity({
  startupName,
  tagline,
  onChange,
}: {
  startupName: string;
  tagline: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div style={styles.stepContent}>
      <h1 style={styles.heading}>What are you building?</h1>
      <p style={styles.subheading}>Start with the basics. You can always edit this later.</p>

      <label style={styles.label}>Startup Name</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. Xeero"
        value={startupName}
        onChange={(e) => onChange("startup_name", e.target.value)}
      />

      <label style={styles.label}>Tagline</label>
      <input
        style={styles.input}
        type="text"
        placeholder="e.g. From idea to funding, one link."
        value={tagline}
        onChange={(e) => onChange("tagline", e.target.value)}
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
};