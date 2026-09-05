"use client";

export default function Step6Slug({
  slug,
  slugAvailable,
  onSlugChange,
}: {
  slug: string;
  slugAvailable: boolean | null;
  onSlugChange: (slug: string) => void;
}) {
  return (
    <div style={styles.stepContent}>
      <h1 style={styles.heading}>Claim your link.</h1>
      <p style={styles.subheading}>This will be your public profile URL.</p>

      <label style={styles.label}>Your Xeero Link</label>
      <div style={styles.slugWrapper}>
        <span style={styles.slugPrefix}>xeero.me/</span>
        <input
          style={styles.slugInput}
          type="text"
          placeholder="yourstartup"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
        />
      </div>

      {slugAvailable === true && <p style={styles.slugAvailable}>✓ This link is available</p>}
      {slugAvailable === false && <p style={styles.slugTaken}>✗ This link is already taken</p>}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  stepContent: { marginBottom: "32px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", marginBottom: "8px" },
  subheading: { fontSize: "13px", color: "#666666", marginBottom: "28px", lineHeight: "1.6" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#111111", marginBottom: "6px" },
  slugWrapper: { display: "flex", alignItems: "center", border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fafafa", marginBottom: "8px" },
  slugPrefix: { padding: "12px 14px", fontSize: "14px", color: "#999999", backgroundColor: "#f0f0f0", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" },
  slugInput: { flex: 1, padding: "12px 14px", fontSize: "14px", border: "none", outline: "none", backgroundColor: "#fafafa" },
  slugAvailable: { fontSize: "13px", color: "#38a169", marginBottom: "8px" },
  slugTaken: { fontSize: "13px", color: "#e53e3e", marginBottom: "8px" },
};