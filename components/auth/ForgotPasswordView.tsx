"use client";

export default function ForgotPasswordView({
  email,
  setEmail,
  error,
  loading,
  onSubmit,
  onBack,
}: {
  email: string;
  setEmail: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <h1 style={styles.heading}>Reset your password</h1>
      <p style={styles.subheading}>We'll send a reset link to your email.</p>
      <input
        style={styles.input}
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.primaryButton} onClick={onSubmit} disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      <p style={styles.link} onClick={onBack}>Back to login</p>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", textAlign: "center", marginBottom: "8px" },
  subheading: { fontSize: "13px", color: "#666666", textAlign: "center", marginBottom: "28px", lineHeight: "1.6" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "12px", boxSizing: "border-box", backgroundColor: "#fafafa" },
  primaryButton: { width: "100%", padding: "13px", backgroundColor: "#111111", color: "#ffffff", fontSize: "14px", fontWeight: "600", borderRadius: "8px", marginTop: "4px" },
  link: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#111111", cursor: "pointer", fontWeight: "500", textDecoration: "underline" },
  error: { fontSize: "13px", color: "#e53e3e", marginBottom: "12px", textAlign: "center" },
};