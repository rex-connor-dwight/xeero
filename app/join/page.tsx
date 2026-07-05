"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, AlertCircle, Lock, Users } from "lucide-react";

type InviteData = {
  id: string;
  profile_id: string;
  email: string;
  role: string;
  permissions: string[];
  accepted: boolean;
  expires_at: string;
  profiles: {
    startup_name: string;
    founder_name: string;
    logo_url: string | null;
    slug: string;
  };
};

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"invite" | "auth" | "profile" | "done">("invite");

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link.");
      setLoading(false);
      return;
    }

    supabase
      .from("team_invites")
      .select("*, profiles(startup_name, founder_name, logo_url, slug)")
      .eq("token", token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("This invite link is invalid or has expired.");
          setLoading(false);
          return;
        }

        if (data.accepted) {
          setError("This invite has already been accepted.");
          setLoading(false);
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setError("This invite link has expired. Ask the founder to send a new one.");
          setLoading(false);
          return;
        }

        setInvite(data as any);
        setEmail(data.email);
        setLoading(false);
      });
  }, [token]);

  const handleAuth = async () => {
    if (!email || !password || !invite) return;
    setAuthLoading(true);
    setAuthError("");

    try {
      let userId = "";

      if (authMode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `https://xeero.me/join?token=${token}` },
        });
        if (signupError) { setAuthError(signupError.message); setAuthLoading(false); return; }
        userId = data.user?.id || "";
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) { setAuthError(loginError.message); setAuthLoading(false); return; }
        userId = data.user?.id || "";
      }

      if (!userId) {
        setAuthError("Something went wrong. Please try again.");
        setAuthLoading(false);
        return;
      }

      setStep("profile");
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
    setAuthLoading(false);
  };

  const handleProfileSave = async () => {
    if (!name || !invite) return;
    setProfileSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfileSaving(false); return; }

    // Create team profile
    const { error: profileError } = await supabase
      .from("team_profiles")
      .insert({
        user_id: user.id,
        profile_id: invite.profile_id,
        name,
        role: invite.role,
        bio: bio || null,
        linkedin_url: linkedin || null,
        twitter_url: twitter || null,
        permissions: invite.permissions || [],
      });

    if (profileError) {
      setProfileSaving(false);
      return;
    }

    // Mark invite as accepted
    await supabase
      .from("team_invites")
      .update({ accepted: true })
      .eq("token", token!);

    setStep("done");
    setProfileSaving(false);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>
            <AlertCircle size={28} color="#e53e3e" />
          </div>
          <h1 style={styles.title}>Invalid invite</h1>
          <p style={styles.subtitle}>{error}</p>
          <button style={styles.btn} onClick={() => router.push("/")}>
            Go to Xeero
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>
            <CheckCircle size={28} color="#38a169" />
          </div>
          <h1 style={styles.title}>You're in!</h1>
          <p style={styles.subtitle}>
            Welcome to <strong>{invite?.profiles.startup_name}</strong>. Your profile has been set up.
          </p>
          <button style={styles.btn} onClick={() => router.push("/team-dashboard")}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Startup info */}
        <div style={styles.startupRow}>
          <div style={styles.startupLogo}>
            {invite?.profiles.logo_url ? (
              <img src={invite.profiles.logo_url} alt="" style={styles.logoImg} />
            ) : (
              <span style={styles.logoInitial}>
                {invite?.profiles.startup_name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p style={styles.startupName}>{invite?.profiles.startup_name}</p>
            <p style={styles.startupFounder}>Founded by {invite?.profiles.founder_name}</p>
          </div>
        </div>

        <div style={styles.inviteBadge}>
          <Users size={14} color="#3182ce" />
          <span style={styles.inviteBadgeText}>
            You've been invited as <strong>{invite?.role}</strong>
          </span>
        </div>

        {step === "invite" && (
          <>
            <h1 style={styles.title}>Accept your invitation</h1>
            <p style={styles.subtitle}>
              {invite?.profiles.founder_name} has invited you to join {invite?.profiles.startup_name} on Xeero.
              Create an account or sign in to accept.
            </p>
            <button style={styles.btn} onClick={() => setStep("auth")}>
              Continue →
            </button>
          </>
        )}

        {step === "auth" && (
          <>
            <h1 style={styles.title}>
              {authMode === "signup" ? "Create your account" : "Sign in"}
            </h1>

            <div style={styles.authToggle}>
              <button
                style={{ ...styles.authToggleBtn, ...(authMode === "signup" ? styles.authToggleBtnActive : {}) }}
                onClick={() => setAuthMode("signup")}
              >
                Sign up
              </button>
              <button
                style={{ ...styles.authToggleBtn, ...(authMode === "login" ? styles.authToggleBtnActive : {}) }}
                onClick={() => setAuthMode("login")}
              >
                Sign in
              </button>
            </div>

            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />

            {authError && <p style={styles.errorText}>{authError}</p>}

            <button
              style={{ ...styles.btn, opacity: email && password && !authLoading ? 1 : 0.5 }}
              onClick={handleAuth}
              disabled={!email || !password || authLoading}
            >
              <Lock size={14} />
              {authLoading ? "Please wait..." : authMode === "signup" ? "Create account" : "Sign in"}
            </button>
          </>
        )}

        {step === "profile" && (
          <>
            <h1 style={styles.title}>Set up your profile</h1>
            <p style={styles.subtitle}>This will appear on {invite?.profiles.startup_name}'s public profile.</p>

            <label style={styles.label}>Full name <span style={styles.req}>*</span></label>
            <input
              style={styles.input}
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label style={styles.label}>Bio (optional)</label>
            <textarea
              style={styles.textarea}
              placeholder="A short bio about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <label style={styles.label}>LinkedIn (optional)</label>
            <input
              style={styles.input}
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />

            <label style={styles.label}>Twitter / X (optional)</label>
            <input
              style={styles.input}
              placeholder="https://x.com/..."
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />

            <button
              style={{ ...styles.btn, opacity: name && !profileSaving ? 1 : 0.5 }}
              onClick={handleProfileSave}
              disabled={!name || profileSaving}
            >
              {profileSaving ? "Saving..." : "Complete setup →"}
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
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  card: { backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", maxWidth: "440px", width: "100%", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" },
  startupRow: { display: "flex", alignItems: "center", gap: "12px", padding: "14px", backgroundColor: "#f9f9f9", borderRadius: "10px", border: "1px solid #f0f0f0" },
  startupLogo: { width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoInitial: { fontSize: "16px", fontWeight: "700", color: "#ffffff" },
  startupName: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  startupFounder: { fontSize: "12px", color: "#888888", margin: "0" },
  inviteBadge: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", backgroundColor: "#ebf8ff", border: "1px solid #bee3f8", borderRadius: "8px" },
  inviteBadgeText: { fontSize: "13px", color: "#3182ce" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0" },
  subtitle: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block" },
  req: { color: "#e53e3e" },
  input: { width: "100%", padding: "11px 14px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  textarea: { width: "100%", padding: "11px 14px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "80px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111" },
  authToggle: { display: "flex", gap: "4px", backgroundColor: "#f5f5f5", borderRadius: "8px", padding: "4px" },
  authToggleBtn: { flex: 1, padding: "8px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "transparent", border: "none", borderRadius: "6px", cursor: "pointer" },
  authToggleBtnActive: { backgroundColor: "#ffffff", color: "#111111", fontWeight: "600", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0" },
  btn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" },
  errorIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" },
};