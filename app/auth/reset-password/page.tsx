"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoWrapper}>
          <div style={styles.logoOuter}>
            <div style={styles.logoInner} />
          </div>
        </div>

        {done ? (
          <>
            <h1 style={styles.heading}>Password updated.</h1>
            <p style={styles.subheading}>
              Your password has been changed successfully. Redirecting you to your dashboard...
            </p>
          </>
        ) : (
          <>
            <h1 style={styles.heading}>Choose a new password.</h1>
            <p style={styles.subheading}>
              Pick something strong. At least 8 characters.
            </p>

            <div style={styles.passwordWrapper}>
              <input
                style={styles.passwordInput}
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <span
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={{
                ...styles.primaryButton,
                opacity: loading ? 0.6 : 1,
              }}
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  logoWrapper: { display: "flex", justifyContent: "center", marginBottom: "32px" },
  logoOuter: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" },
  logoInner: { width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#111111" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#111111", textAlign: "center", marginBottom: "8px" },
  subheading: { fontSize: "13px", color: "#666666", textAlign: "center", marginBottom: "28px", lineHeight: "1.6" },
  passwordWrapper: { position: "relative", marginBottom: "12px" },
  passwordInput: { width: "100%", padding: "12px 60px 12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa" },
  passwordToggle: { position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#666666", cursor: "pointer", fontWeight: "500" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "12px", boxSizing: "border-box", backgroundColor: "#fafafa" },
  error: { fontSize: "13px", color: "#e53e3e", marginBottom: "12px", textAlign: "center" },
  primaryButton: { width: "100%", padding: "13px", backgroundColor: "#111111", color: "#ffffff", fontSize: "14px", fontWeight: "600", borderRadius: "8px", border: "none", cursor: "pointer", marginTop: "4px", transition: "opacity 0.2s ease" },
};