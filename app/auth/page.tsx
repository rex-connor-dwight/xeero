"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import MainView from "@/components/auth/MainView";
import ForgotPasswordView from "@/components/auth/ForgotPasswordView";
import ForgotSentView from "@/components/auth/ForgotSentView";
import AuthShowcasePanel from "@/components/auth/AuthShowcasePanel";
import { captureReferralCode, consumeReferralCode } from "@/lib/referral";

type AuthMode = "login" | "signup";
type View = "main" | "forgot" | "forgot-sent";

async function handleLogin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error;
}

async function handleSignup(email: string, password: string) {
  // Read the referral code before signup so it can be attached as metadata
  // on the auth.users row itself — this survives the email confirmation gap,
  // since confirmation can happen in a completely different browser tab or
  // device than the one that started signup, where localStorage isn't shared.
  const referralCode = consumeReferralCode();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/onboarding`,
      data: referralCode ? { referral_code: referralCode } : undefined,
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

    const err = mode === "login" ? await handleLogin(email, password) : await handleSignup(email, password);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      // Welcome email now fires after onboarding is completed, not here.
      // Supabase's own "Confirm signup" email (configured in the Dashboard)
      // is the only email sent at this point.
      router.push("/confirm");
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: founderProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (founderProfile) {
          router.push("/dashboard");
          setLoading(false);
          return;
        }

        const { data: teamProfile } = await supabase
          .from("team_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (teamProfile) {
          router.push("/team-dashboard");
          setLoading(false);
          return;
        }

        router.push("/onboarding");
      }
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

      <div style={styles.formSide}>
        <div style={styles.card}>

          <div style={styles.logoWrapper}>
            <img src="/xeeroLogo.png" alt="Xeero" style={styles.logoImage} />
          </div>

          {view === "forgot" && (
            <ForgotPasswordView
              email={email}
              setEmail={setEmail}
              error={error}
              loading={loading}
              onSubmit={handleForgot}
              onBack={resetView}
            />
          )}

          {view === "forgot-sent" && <ForgotSentView email={email} onBack={resetView} />}

          {view === "main" && (
            <MainView
              mode={mode}
              setMode={(m) => { setMode(m); setError(""); }}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              loading={loading}
              onSubmit={handleSubmit}
              onForgotClick={() => { setView("forgot"); setError(""); }}
            />
          )}
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

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
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
  card: { width: "100%", maxWidth: "360px" },
  logoWrapper: { display: "flex", justifyContent: "center", marginBottom: "32px" },
  logoImage: { width: "56px", height: "56px", objectFit: "contain" },
};