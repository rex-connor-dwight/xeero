"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  Rocket,
  ArrowLeft,
  CheckCircle,
  Lock,
  Heart,
  Building2,
  ChevronDown,
} from "lucide-react";

// ── Nigerian Banks ─────────────────────────────────────────────────────────

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Opay", code: "999992" },
  { name: "Palmpay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

export default function FundingPage() {
  const router = useRouter();
  const { profile, profileLoading } = useXeero();

  // ── Funding application state ──
  const [fundingStage, setFundingStage] = useState("");
  const [amountRaising, setAmountRaising] = useState("");
  const [useOfFunds, setUseOfFunds] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // ── Support application state ──
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);

  // ── Fetch existing support application ──
  useEffect(() => {
    if (!profile) return;
    supabase
      .from("support_applications")
      .select("*")
      .eq("profile_id", profile.id)
      .single()
      .then(({ data }) => {
        if (data) setExistingApplication(data);
        setLoadingApplication(false);
      });
  }, [profile]);

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = NIGERIAN_BANKS.find((b) => b.code === e.target.value);
    if (selected) {
      setBankName(selected.name);
      setBankCode(selected.code);
    }
  };

  const handleFundingSubmit = async () => {
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

  const handleSupportSubmit = async () => {
    if (!profile) return;
    if (!bankCode || !accountNumber || !accountName) {
      setSupportError("Please fill in all bank details.");
      return;
    }
    if (accountNumber.length < 10) {
      setSupportError("Please enter a valid 10-digit account number.");
      return;
    }
    setSupportSubmitting(true);
    setSupportError("");
    const { error: dbError } = await supabase
      .from("support_applications")
      .insert({
        profile_id: profile.id,
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        status: "pending",
      });
    if (dbError) {
      setSupportError("Something went wrong. Please try again.");
      setSupportSubmitting(false);
      return;
    }
    setSupportSubmitted(true);
    setSupportSubmitting(false);
  };

  if (profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

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
          <button style={styles.guardBtn} onClick={() => router.push("/payment")}>
            Publish Profile →
          </button>
          <button style={styles.backLink} onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            and get back to you within 3 to 5 business days.
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
          <button style={styles.successBtn} onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Support application status badge ──
  const renderSupportStatus = () => {
    if (loadingApplication) return null;

    if (existingApplication) {
      const status = existingApplication.status;
      const color = status === "approved" ? "#38a169" : status === "declined" ? "#e53e3e" : "#d69e2e";
      const bg = status === "approved" ? "#f0fff4" : status === "declined" ? "#fff5f5" : "#fffbeb";
      const border = status === "approved" ? "#c6f6d5" : status === "declined" ? "#fed7d7" : "#fef08a";
      const label = status === "approved" ? "Approved" : status === "declined" ? "Declined" : "Under Review";

      return (
        <div style={{ ...styles.statusBadge, backgroundColor: bg, border: `1px solid ${border}` }}>
          <div style={{ ...styles.statusDot, backgroundColor: color }} />
          <div>
            <p style={{ ...styles.statusLabel, color }}>{label}</p>
            {status === "approved" && (
              <p style={styles.statusSub}>
                Your profile now accepts community support. Supporters can find the button on your public page.
              </p>
            )}
            {status === "pending" && (
              <p style={styles.statusSub}>
                We are reviewing your application. You will hear from us within 2 to 3 business days.
              </p>
            )}
            {status === "declined" && (
              <p style={styles.statusSub}>
                Your application was not approved at this time. You can reapply after 30 days.
              </p>
            )}
          </div>
        </div>
      );
    }

    if (supportSubmitted) {
      return (
        <div style={{ ...styles.statusBadge, backgroundColor: "#fffbeb", border: "1px solid #fef08a" }}>
          <div style={{ ...styles.statusDot, backgroundColor: "#d69e2e" }} />
          <div>
            <p style={{ ...styles.statusLabel, color: "#d69e2e" }}>Application Received</p>
            <p style={styles.statusSub}>
              We will review your details and get back to you within 2 to 3 business days.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={styles.page}>

      <button style={styles.backBtn} onClick={() => router.push("/dashboard")}>
        <ArrowLeft size={14} />
        Dashboard
      </button>

      {/* ── Funding Application ── */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Rocket size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Apply for Funding</h1>
          <p style={styles.headerSub}>Submit your startup for review by our investor network</p>
        </div>
      </div>

      <div style={styles.profilePill}>
        <div style={styles.profilePillDot} />
        <span style={styles.profilePillText}>
          Applying as <strong>xeero.me/{profile.slug}</strong>
        </span>
        <span style={styles.profilePillLive}>Live</span>
      </div>

      <div style={styles.form}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Funding Details</h2>
          <p style={styles.cardSubtitle}>Tell us about your raise.</p>

          <label style={styles.label}>Funding Stage <span style={styles.required}>*</span></label>
          <select style={styles.select} value={fundingStage} onChange={(e) => setFundingStage(e.target.value)}>
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
            placeholder="What will you use this funding for? Be specific."
            value={useOfFunds}
            onChange={(e) => setUseOfFunds(e.target.value)}
          />

          <label style={styles.label}>Additional Notes</label>
          <textarea
            style={{ ...styles.textarea, minHeight: "60px" }}
            placeholder="Anything else you'd like us to know?"
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
          style={{ ...styles.submitBtn, opacity: submitting ? 0.6 : 1 }}
          onClick={handleFundingSubmit}
          disabled={submitting}
        >
          <Rocket size={14} />
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        <p style={styles.disclaimer}>
          By submitting, you confirm your profile is accurate and you are authorised to raise on behalf of this startup.
        </p>

        {/* ── Divider ── */}
        <div style={styles.divider} />

        {/* ── Community Support Section ── */}
        <div style={styles.supportHeader}>
          <div style={styles.headerIcon}>
            <Heart size={18} color="#111111" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Community Support</h1>
            <p style={styles.headerSub}>
              Let visitors support your startup directly from your profile
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <p style={styles.supportIntro}>
            Once approved, a support button appears on your public profile. Visitors can support you with $1, $5, $10, $50, or $100. You keep 92%. Xeero takes 8% to cover infrastructure and payment processing.
          </p>

          <div style={styles.supportTiers}>
            {[
              { amount: "$1", label: "Believer" },
              { amount: "$5", label: "Early Supporter" },
              { amount: "$10", label: "Backing You" },
              { amount: "$50", label: "Champion" },
              { amount: "$100", label: "Lead Believer" },
            ].map((tier) => (
              <div key={tier.amount} style={styles.tierPill}>
                <span style={styles.tierAmount}>{tier.amount}</span>
                <span style={styles.tierLabel}>{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status or form */}
        {renderSupportStatus()}

        {!existingApplication && !supportSubmitted && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Bank Details</h2>
            <p style={styles.cardSubtitle}>
              Where should we send your supporter payments? We need your Nigerian bank account to set up your Paystack wallet.
            </p>

            <label style={styles.label}>Bank <span style={styles.required}>*</span></label>
            <div style={styles.selectWrapper}>
              <select
                style={styles.select}
                value={bankCode}
                onChange={handleBankChange}
              >
                <option value="">Select your bank</option>
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} color="#aaaaaa" style={styles.selectIcon} />
            </div>

            <label style={styles.label}>Account Number <span style={styles.required}>*</span></label>
            <input
              style={styles.input}
              placeholder="10-digit account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
            />

            <label style={styles.label}>Account Name <span style={styles.required}>*</span></label>
            <input
              style={styles.input}
              placeholder="Name on your bank account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />

            {supportError && <p style={styles.errorText}>{supportError}</p>}

            <button
              style={{
                ...styles.submitBtn,
                opacity: supportSubmitting ? 0.6 : 1,
                marginTop: "4px",
              }}
              onClick={handleSupportSubmit}
              disabled={supportSubmitting}
            >
              <Building2 size={14} />
              {supportSubmitting ? "Submitting..." : "Apply for Community Support"}
            </button>

            <p style={styles.disclaimer}>
              Your bank details are used only to receive supporter payments via Paystack. We do not store card details.
            </p>
          </div>
        )}

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
  supportHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" },
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
  selectWrapper: { position: "relative", marginBottom: "16px" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111", appearance: "none" },
  selectIcon: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
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
  divider: { height: "1px", backgroundColor: "#f0f0f0", margin: "8px 0" },
  supportIntro: { fontSize: "13px", color: "#666666", lineHeight: "1.7", margin: "0 0 20px 0" },
  supportTiers: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tierPill: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", backgroundColor: "#f5f5f5", borderRadius: "99px", border: "1px solid #eeeeee" },
  tierAmount: { fontSize: "13px", fontWeight: "700", color: "#111111" },
  tierLabel: { fontSize: "11px", color: "#888888" },
  statusBadge: { borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "12px" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, marginTop: "5px" },
  statusLabel: { fontSize: "13px", fontWeight: "600", margin: "0 0 4px 0" },
  statusSub: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.6" },
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