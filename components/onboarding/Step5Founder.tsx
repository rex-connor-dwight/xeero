"use client";

export default function Step5Founder({
  founderName,
  founderRole,
  founderBio,
  founderLinkedin,
  founderTwitter,
  onChange,
}: {
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderLinkedin: string;
  founderTwitter: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div style={styles.stepContent}>
      <h1 style={styles.heading}>Tell us about yourself.</h1>
      <p style={styles.subheading}>Investors bet on founders as much as ideas.</p>

      <label style={styles.label}>Your Name</label>
      <input style={styles.input} type="text" placeholder="e.g. John Doe" value={founderName} onChange={(e) => onChange("founder_name", e.target.value)} />

      <label style={styles.label}>Your Role</label>
      <input style={styles.input} type="text" placeholder="e.g. CEO, CTO, Co-founder" value={founderRole} onChange={(e) => onChange("founder_role", e.target.value)} />

      <label style={styles.label}>Short Bio</label>
      <textarea style={styles.textarea} placeholder="2-3 sentences about your background" value={founderBio} onChange={(e) => onChange("founder_bio", e.target.value)} />

      <label style={styles.label}>LinkedIn URL</label>
      <input style={styles.input} type="text" placeholder="https://linkedin.com/in/yourname" value={founderLinkedin} onChange={(e) => onChange("founder_linkedin", e.target.value)} />

      <label style={styles.label}>Twitter / X URL</label>
      <input style={styles.input} type="text" placeholder="https://x.com/yourhandle" value={founderTwitter} onChange={(e) => onChange("founder_twitter", e.target.value)} />
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