"use client";

type AuthMode = "login" | "signup";

export default function MainView({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
  onForgotClick,
}: {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  onForgotClick: () => void;
}) {
  return (
    <>
      <h1 style={styles.heading}>
        {mode === "login" ? "Welcome back to Xeero." : "Create your Xeero account."}
      </h1>
      <p style={styles.subheading}>
        {mode === "login" ? (
          <>
            First time here?{" "}
            <span style={styles.inlineLink} onClick={() => setMode("signup")}>
              Sign up for free
            </span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span style={styles.inlineLink} onClick={() => setMode("login")}>
              Sign in
            </span>
          </>
        )}
      </p>

      <input
        style={styles.input}
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div style={styles.passwordWrapper}>
        <input
          style={styles.passwordInput}
          type={showPassword ? "text" : "password"}
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "Hide" : "Show"}
        </span>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button style={styles.primaryButton} onClick={onSubmit} disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>

      {mode === "login" && (
        <p style={styles.link} onClick={onForgotClick}>Forgot password?</p>
      )}
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", textAlign: "center", marginBottom: "8px" },
  subheading: { fontSize: "13px", color: "#666666", textAlign: "center", marginBottom: "28px", lineHeight: "1.6" },
  inlineLink: { color: "#111111", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "12px", boxSizing: "border-box", backgroundColor: "#fafafa" },
  passwordWrapper: { position: "relative", marginBottom: "12px" },
  passwordInput: { width: "100%", padding: "12px 60px 12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa" },
  passwordToggle: { position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#666666", cursor: "pointer", fontWeight: "500" },
  primaryButton: { width: "100%", padding: "13px", backgroundColor: "#111111", color: "#ffffff", fontSize: "14px", fontWeight: "600", borderRadius: "8px", marginTop: "4px" },
  link: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#111111", cursor: "pointer", fontWeight: "500", textDecoration: "underline" },
  error: { fontSize: "13px", color: "#e53e3e", marginBottom: "12px", textAlign: "center" },
};