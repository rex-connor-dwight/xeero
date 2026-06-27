"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

// ── Logic ──────────────────────────────────────────────────────────────────

type AuthMode = "login" | "signup";
type View = "main" | "forgot" | "magic-sent" | "forgot-sent";

async function handleLogin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

async function handleSignup(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  return error;
}

async function handleMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return error;
}

async function handleForgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`,
  });
  return error;
}

// ── Inner Component ────────────────────────────────────────────────────────

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [view, setView] = useState<View>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "link_expired") {
      setError("Your confirmation link expired. Please sign up again.");
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const err =
      mode === "login"
        ? await handleLogin(email, password)
        : await handleSignup(email, password);

        if (err) {
          setError(err.message);
        } else {
          if (mode === "signup") {
            // Fire welcome email silently
            fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/welcome-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ email }),
              }
            ).catch(() => {});
          
            router.push("/confirm");
          } else {
            // Check if profile exists
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", user.id)
                .single();
              
                if (profile) {
                  router.push("/dashboard");
                } else {
                  router.push("/onboarding");
                }
            }
          }
        }

    setLoading(false);
  };

  const handleMagic = async () => {
    setLoading(true);
    setError("");
    const err = await handleMagicLink(email);
    if (err) {
      setError(err.message);
    } else {
      setView("magic-sent");
    }
    setLoading(false);
  };

  const handleForgot = async () => {
    setLoading(true);
    setError("");
    const err = await handleForgotPassword(email);
    if (err) {
      setError(err.message);
    } else {
      setView("forgot-sent");
    }
    setLoading(false);
  };

  const resetView = () => {
    setView("main");
    setError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── Logo ── */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoOuter}>
            <div style={styles.logoInner} />
          </div>
        </div>

        {/* ── Forgot Password ── */}
        {view === "forgot" && (
          <>
            <h1 style={styles.heading}>Reset your password</h1>
            <p style={styles.subheading}>
              We'll send a reset link to your email.
            </p>
            <input
              style={styles.input}
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={styles.primaryButton}
              onClick={handleForgot}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p style={styles.link} onClick={resetView}>Back to login</p>
          </>
        )}

        {/* ── Forgot Sent ── */}
        {view === "forgot-sent" && (
          <>
            <h1 style={styles.heading}>Check your email</h1>
            <p style={styles.subheading}>
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={styles.link} onClick={resetView}>Back to login</p>
          </>
        )}

        {/* ── Magic Sent ── */}
        {view === "magic-sent" && (
          <>
            <h1 style={styles.heading}>Magic link sent.</h1>
            <p style={styles.subheading}>
              Check your email at <strong>{email}</strong> and click the
              link to sign in.
            </p>
            <p style={styles.link} onClick={resetView}>Back to login</p>
          </>
        )}

        {/* ── Main View ── */}
        {view === "main" && (
          <>
            <h1 style={styles.heading}>
              {mode === "login"
                ? "Welcome back to Xeero."
                : "Create your Xeero account."}
            </h1>
            <p style={styles.subheading}>
              {mode === "login" ? (
                <>
                  First time here?{" "}
                  <span
                    style={styles.inlineLink}
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                  >
                    Sign up for free
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    style={styles.inlineLink}
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                  >
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
              <span
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={styles.primaryButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            <button
              style={styles.secondaryButton}
              onClick={handleMagic}
              disabled={loading}
            >
              Send me a magic link
            </button>

            {mode === "login" && (
              <p
                style={styles.link}
                onClick={() => {
                  setView("forgot");
                  setError("");
                }}
              >
                Forgot password?
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
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
    textAlign: "center",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "13px",
    color: "#666666",
    textAlign: "center",
    marginBottom: "28px",
    lineHeight: "1.6",
  },
  inlineLink: {
    color: "#111111",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "12px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },
  passwordWrapper: {
    position: "relative",
    marginBottom: "12px",
  },
  passwordInput: {
    width: "100%",
    padding: "12px 60px 12px 14px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },
  passwordToggle: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "12px",
    color: "#666666",
    cursor: "pointer",
    fontWeight: "500",
  },
  primaryButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#111111",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "8px",
    marginTop: "4px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e5e5e5",
  },
  dividerText: {
    fontSize: "12px",
    color: "#999999",
  },
  secondaryButton: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
  },
  link: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#111111",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "underline",
  },
  error: {
    fontSize: "13px",
    color: "#e53e3e",
    marginBottom: "12px",
    textAlign: "center",
  },
};