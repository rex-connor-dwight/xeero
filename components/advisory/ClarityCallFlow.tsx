"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { CALENDLY_LINKS } from "@/lib/data/advisoryPackages";

export default function ClarityCallFlow({ onBack }: { onBack: () => void }) {
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!slug.trim()) return;
    setChecking(true);
    setError("");

    const cleanSlug = slug
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/^xeero\.me\//i, "")
      .replace(/^xeero\.me$/i, "")
      .replace(/\/$/, "");

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("is_live, startup_name")
      .eq("slug", cleanSlug)
      .single();

    if (fetchError || !data) {
      setError("We couldn't find a Xeero profile with that link. Double check and try again.");
      setChecking(false);
      return;
    }

    if (!data.is_live) {
      setError("Your Xeero profile isn't live yet. Publish your profile first, then come back to book your Clarity Call.");
      setChecking(false);
      return;
    }

    setVerified(true);
    setChecking(false);
  };

  if (verified) {
    return (
      <div style={styles.card}>
        <div style={styles.successIcon}><CheckCircle size={24} color="#38a169" /></div>
        <h2 style={styles.title}>You're verified</h2>
        <p style={styles.text}>Pick a time that works for you below.</p>
        
        <a  href={CALENDLY_LINKS.clarity}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.calendlyBtn}
        >
          Choose a time →
        </a>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <button style={styles.backBtn} onClick={onBack}>
        <ArrowLeft size={13} />Back
      </button>
      <h2 style={styles.title}>Book your Clarity Call</h2>
      <p style={styles.text}>
        Free for founders on Xeero. Enter your profile link to verify and get access to booking.
      </p>

      <input
        style={styles.input}
        placeholder="xeero.me/yourstartup"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={13} color="#d69e2e" />
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      <button
        style={{ ...styles.submitBtn, opacity: slug.trim() && !checking ? 1 : 0.5 }}
        onClick={handleVerify}
        disabled={!slug.trim() || checking}
      >
        {checking ? "Checking..." : "Verify and Continue"}
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "32px", maxWidth: "440px", margin: "0 auto" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "16px", padding: "0" },
  title: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  text: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0 0 20px 0" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", marginBottom: "12px" },
  errorBox: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 14px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px", marginBottom: "14px" },
  errorText: { fontSize: "12px", color: "#92610a", lineHeight: "1.6" },
  submitBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  calendlyBtn: { display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", borderRadius: "10px", textDecoration: "none" },
};