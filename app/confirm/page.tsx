"use client";

import AuthShowcasePanel from "@/components/auth/AuthShowcasePanel";

export default function ConfirmPage() {
  return (
    <div style={styles.page}>

      <div style={styles.formSide}>
        <div style={styles.card}>

          <div style={styles.logoWrapper}>
            <img src="/xeeroLogo.png" alt="Xeero" style={styles.logoImage} />
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

      <div style={styles.showcaseSide} className="auth-showcase-side">
        <AuthShowcasePanel />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-showcase-side { display: none !important; }
        }
      `}</style>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#ffffff",
  },
  formSide: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  showcaseSide: { display: "flex", flex: 1, minHeight: "100vh" },
  card: { width: "100%", maxWidth: "360px", textAlign: "center" },
  logoWrapper: { display: "flex", justifyContent: "center", marginBottom: "32px" },
  logoImage: { width: "56px", height: "56px", objectFit: "contain" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", marginBottom: "8px" },
  subheading: { fontSize: "14px", color: "#666666", lineHeight: "1.7", marginBottom: "32px" },
  hint: { backgroundColor: "#f5f5f5", borderRadius: "8px", padding: "16px", marginBottom: "32px" },
  hintText: { fontSize: "13px", color: "#999999", margin: "0" },
  footer: { fontSize: "12px", color: "#cccccc", margin: "0" },
};