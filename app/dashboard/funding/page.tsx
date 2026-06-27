"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Rocket, ArrowLeft, CheckCircle, Lock } from "lucide-react";

export default function FundingPage() {
  const router = useRouter();
  const { profile, profileLoading } = useXeero();
  const [fundingStage, setFundingStage] = useState("");
  const [amountRaising, setAmountRaising] = useState("");
  const [useOfFunds, setUseOfFunds] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!profile) return;
    if (!fundingStage || !amountRaising || !useOfFunds) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    const { error: dbError } = await supabase
      .from("funding_applications")
      .insert({
        profile_id: profile.id,
        slug: profile.slug,
        funding_stage: fundingStage,
        amount_raising: amountRaising,
        use_of_funds: useOfFunds,
        additional_notes: additionalNotes,
      });
    if (dbError) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  // Not live guard
  if (!profile?.is_live) {
    return (
      <div style={styles.page}>
        <div style={styles.guardCard}>
          <div style={styles.guardIcon}>
            <Lock size={24} color="#aaaaaa" />
          </div>
          <h2 style={styles.guardTitle}>Publish your profile first</h2>
          <p style={styles.guardText}>
            Your profile needs to be live before you can apply for funding.
            Pay $9 to publish your link and unlock this feature.
          </p>
          <button
            style={styles.guardBtn}
            onClick={() => router.push("/payment")}
          >
            Publish Profile →
          </button>
          <button
            style={styles.backLink}
            onClick={() => router.push("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <CheckCircle size={28} color="#38a169" />
          </div>
          <h2 style={styles.successTitle}>Application submitted!</h2>
          <p style={styles.successText}>
            We've received your funding application for{" "}
            <strong>{profile.startup_name}</strong>. Our team will review it
            and get back to you within 3-5 business days.
          </p>
          <div style={styles.successDetails}>
            <div style={styles.successDetailRow}>
              <span style={styles.successDetailLabel}>Profile</span>
              <span style={styles.successDetailValue}>xeero.me/{profile.slug}</span>
            </div>
            <div style={styles.successDetailRow}>
              <span style={styles.successDetailLabel}>Stage</span>
              <span style={styles.successDetailValue}>{fundingStage}</span>
            </div>
            <div style={styles.successDetailRow}>
              <span style={styles.successDetailLabel}>Raising</span>
              <span style={styles.successDetailValue}>{amountRaising}</span>
            </div>
          </div>
          <button
            style={styles.successBtn}
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <button style={styles.backBtn} onClick={() => router.push("/dashboard")}>
        <ArrowLeft size={14} />
        Dashboard
      </button>

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Rocket size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Apply for Funding</h1>
          <p style={styles.headerSub}>
            Submit your startup for review by our investor network
          </p>
        </div>
      </div>

      {/* Profile pill */}
      <div style={styles.profilePill}>
        <div style={styles.profilePillDot} />
        <span style={styles.profilePillText}>
          Applying as <strong>xeero.me/{profile.slug}</strong>
        </span>
        <span style={styles.profilePillLive}>● Live</span>
      </div>

      {/* Form */}
      <div style={styles.form}>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Funding Details</h2>
          <p style={styles.cardSubtitle}>Tell us about your raise.</p>

          <label style={styles.label}>Funding Stage <span style={styles.required}>*</span></label>
          <select
            style={styles.select}
            value={fundingStage}
            onChange={(e) => setFundingStage(e.target.value)}
          >
            <option value="">Select stage</option>
            <option value="Pre-seed">Pre-seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Bridge">Bridge</option>
            <option value="Grant">Grant</option>
          </select>

          <label style={styles.label}>Amount Raising <span style={styles.required}>*</span></label>
          <input
            style={styles.input}
            placeholder="e.g. $250,000"
            value={amountRaising}
            onChange={(e) => setAmountRaising(e.target.value)}
          />

          <label style={styles.label}>Use of Funds <span style={styles.required}>*</span></label>
          <textarea
            style={styles.textarea}
            placeholder="What will you use this funding for? Be specific, e.g. 6 months runway, hire 2 engineers, launch in 3 new markets."
            value={useOfFunds}
            onChange={(e) => setUseOfFunds(e.target.value)}
          />

          <label style={styles.label}>Additional Notes</label>
          <textarea
            style={{ ...styles.textarea, minHeight: "60px" }}
            placeholder="Anything else you'd like us to know? Traction, partnerships, why now..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />
        </div>

        <div style={styles.infoCard}>
          <p style={styles.infoTitle}>What happens next?</p>
          <div style={styles.infoSteps}>
            {[
              "We review your Xeero profile and application.",
              "If it's a fit, we connect you with relevant investors in our network.",
              "You get an email within 3 to 5 business days.",
            ].map((step, i) => (
              <div key={i} style={styles.infoStep}>
                <div style={styles.infoStepNum}>{i + 1}</div>
                <p style={styles.infoStepText}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button
          style={{
            ...styles.submitBtn,
            opacity: submitting ? 0.6 : 1,
          }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          <Rocket size={14} />
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        <p style={styles.disclaimer}>
          By submitting, you confirm your profile is accurate and you are
          authorised to raise on behalf of this startup.
        </p>

      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "24px", maxWidth: "600px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", padding: "0" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  profilePill: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "10px", padding: "10px 14px", marginBottom: "20px" },
  profilePillDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38a169", flexShrink: 0 },
  profilePillText: { fontSize: "13px", color: "#444444", flex: 1 },
  profilePillLive: { fontSize: "11px", color: "#38a169", fontWeight: "600" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  cardSubtitle: { fontSize: "12px", color: "#aaaaaa", margin: "0 0 20px 0" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#111111", marginBottom: "6px" },
  required: { color: "#e53e3e" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111", appearance: "none" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", minHeight: "96px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111" },
  infoCard: { backgroundColor: "#f9f9f9", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0" },
  infoTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 14px 0" },
  infoSteps: { display: "flex", flexDirection: "column", gap: "12px" },
  infoStep: { display: "flex", alignItems: "flex-start", gap: "12px" },
  infoStepNum: { width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#111111", color: "#ffffff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoStepText: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0" },
  errorText: { fontSize: "13px", color: "#e53e3e", margin: "0" },
  submitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  disclaimer: { fontSize: "11px", color: "#bbbbbb", textAlign: "center", lineHeight: "1.6", margin: "0" },
  guardCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: "40px" },
  guardIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  guardTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  guardText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0" },
  guardBtn: { padding: "11px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "12px", display: "block", width: "100%" },
  backLink: { fontSize: "13px", color: "#aaaaaa", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" },
  successCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: "40px" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  successTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  successText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0" },
  successDetails: { backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "16px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" },
  successDetailRow: { display: "flex", gap: "12px", alignItems: "center" },
  successDetailLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em", width: "56px", flexShrink: 0 },
  successDetailValue: { fontSize: "13px", color: "#111111", fontWeight: "500" },
  successBtn: { padding: "11px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", width: "100%" },
};