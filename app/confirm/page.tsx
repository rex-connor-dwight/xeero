"use client";

// ── Component ──────────────────────────────────────────────────────────────

export default function ConfirmPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoWrapper}>
          <div style={styles.logoOuter}>
            <div style={styles.logoInner} />
          </div>
        </div>

        <h1 style={styles.heading}>Check your email.</h1>
        <p style={styles.subheading}>
          We sent a confirmation link to your email address. Click the link to activate your account and start building your Xeero profile.
        </p>

        <div style={styles.hint}>
          <p style={styles.hintText}>
            Can't find it? Check your spam folder.
          </p>
        </div>

        <p style={styles.footer}>© 2026 Xeero</p>

      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = {
  [key: string]: React.CSSProperties;
};

const styles: Styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "32px",
  },
  logoOuter: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#111111",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111111",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "14px",
    color: "#666666",
    lineHeight: "1.7",
    marginBottom: "32px",
  },
  hint: {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "32px",
  },
  hintText: {
    fontSize: "13px",
    color: "#999999",
    margin: "0",
  },
  footer: {
    fontSize: "12px",
    color: "#cccccc",
    margin: "0",
  },
};