"use client";

export default function ForgotSentView({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <>
      <h1 style={styles.heading}>Check your email</h1>
      <p style={styles.subheading}>
        We sent a password reset link to <strong>{email}</strong>
      </p>
      <p style={styles.link} onClick={onBack}>Back to login</p>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", textAlign: "center", marginBottom: "8px" },
  subheading: { fontSize: "13px", color: "#666666", textAlign: "center", marginBottom: "28px", lineHeight: "1.6" },
  link: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#111111", cursor: "pointer", fontWeight: "500", textDecoration: "underline" },
};