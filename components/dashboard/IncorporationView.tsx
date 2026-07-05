"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Building2, ArrowLeft, CheckCircle, Send } from "lucide-react";
import IncorporationNotes from "@/components/dashboard/IncorporationNotes";
import UpgradeGateModal from "@/components/dashboard/UpgradeGateModal";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const COUNTRY_PRICING: Record<string, number> = {
  nigeria: 55,
  ghana: 180,
  delaware: 600,
};

const COUNTRY_LABELS: Record<string, string> = {
  nigeria: "Nigeria — Private Limited Liability (CAC)",
  ghana: "Ghana — Limited Liability Company (RGD)",
  delaware: "Delaware, USA — C-Corporation",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_review: { label: "Under Review", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  name_reserved: { label: "Name Reserved", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  in_progress: { label: "In Progress", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  completed: { label: "Completed", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
  rejected: { label: "Rejected", color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7" },
};

export default function IncorporationView() {
  const router = useRouter();
  const { profile, isTeamMember, founderProfile, profileLoading, isTeamsActive } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [showGate, setShowGate] = useState(false);

  const [country, setCountry] = useState("nigeria");
  const [entityType, setEntityType] = useState("Private Limited Liability Company");
  const [proposedName, setProposedName] = useState("");
  const [altName1, setAltName1] = useState("");
  const [altName2, setAltName2] = useState("");
  const [installmentMonths, setInstallmentMonths] = useState<6 | 12>(6);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!activeProfile) return;
    supabase
      .from("incorporation_requests")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setExistingRequest(data || null);
        setLoading(false);
      });
  }, [activeProfile]);

  const totalCost = COUNTRY_PRICING[country];
  const depositAmount = Math.ceil(totalCost * 0.2 * 100) / 100;
  const remainingBalance = totalCost - depositAmount;
  const amountPerInstallment = Math.ceil((remainingBalance / installmentMonths) * 100) / 100;

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setEntityType(
      value === "nigeria" ? "Private Limited Liability Company"
      : value === "ghana" ? "Limited Liability Company"
      : "C-Corporation"
    );
  };

  const handleSubmit = async () => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    if (!activeProfile || !proposedName || !entityType) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("incorporation_requests")
      .insert({
        profile_id: activeProfile.id,
        country,
        entity_type: entityType,
        proposed_name: proposedName,
        alt_name_1: altName1 || null,
        alt_name_2: altName2 || null,
        installment_months: installmentMonths,
        total_cost_usd: totalCost,
        amount_per_installment: amountPerInstallment,
        deposit_amount_usd: depositAmount,
      })
      .select()
      .single();

    if (!error && data) {
      setExistingRequest(data);
    }
    setSubmitting(false);
  };

  const handlePayInstallment = async () => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    if (!existingRequest) return;
    setPaying(true);
    setPayError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initialize-incorporation-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ request_id: existingRequest.id }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) {
        setPayError(data.error || "Something went wrong.");
        setPaying(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: (await supabase.auth.getUser()).data.user?.email,
        amount: data.ngn_amount * 100,
        ref: data.reference,
        currency: "NGN",
        callback: () => {
          window.location.reload();
        },
        onClose: () => {
          setPaying(false);
        },
      });
      handler.openIframe();

    } catch {
      setPayError("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  if (profileLoading || loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const backPath = isTeamMember ? "/team-dashboard/services" : "/dashboard/services";

  // ── Existing request — status + payment tracker ──
  if (existingRequest) {
    const statusInfo = STATUS_CONFIG[existingRequest.status];
    const totalInstallmentsIncludingDeposit = existingRequest.installment_months + 1;
    const paidCount = existingRequest.paid_installments;
    const progress = (paidCount / totalInstallmentsIncludingDeposit) * 100;
    const isFullyPaid = paidCount >= totalInstallmentsIncludingDeposit;

    return (
      <div style={styles.page}>
        {showGate && <UpgradeGateModal featureName="Incorporate Now, Pay Later" onClose={() => setShowGate(false)} />}

        <button style={styles.backBtn} onClick={() => router.push(backPath)}>
          <ArrowLeft size={14} />Services
        </button>

        <div style={styles.header}>
          <div style={styles.headerIcon}><Building2 size={18} color="#111111" /></div>
          <div>
            <h1 style={styles.headerTitle}>Incorporate Now, Pay Later</h1>
            <p style={styles.headerSub}>{COUNTRY_LABELS[existingRequest.country]}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.statusRow}>
            <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
              {statusInfo.label}
            </span>
          </div>

          <div style={styles.detailGrid}>
            <div>
              <p style={styles.detailLabel}>Proposed Name</p>
              <p style={styles.detailValue}>{existingRequest.proposed_name}</p>
            </div>
            <div>
              <p style={styles.detailLabel}>Entity Type</p>
              <p style={styles.detailValue}>{existingRequest.entity_type}</p>
            </div>
          </div>

          {existingRequest.admin_notes && (
            <div style={styles.notesBox}>
              <p style={styles.notesLabel}>Note from the team</p>
              <p style={styles.notesText}>{existingRequest.admin_notes}</p>
            </div>
          )}
        </div>

        {!isTeamMember && (
          <div style={styles.card}>
            <p style={styles.cardTitle}>Payment Plan</p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <p style={styles.progressText}>
              {paidCount} of {totalInstallmentsIncludingDeposit} payments made
              — deposit of ${existingRequest.deposit_amount_usd || (existingRequest.total_cost_usd * 0.2).toFixed(2)}, then ${existingRequest.amount_per_installment}/month
            </p>

            {isFullyPaid ? (
              <div style={styles.paidBox}>
                <CheckCircle size={16} color="#38a169" />
                <span style={styles.paidText}>Fully paid. Incorporation processing is underway.</span>
              </div>
            ) : (
              <>
                {payError && <p style={styles.errorText}>{payError}</p>}
                <button
                  style={{ ...styles.payBtn, opacity: paying ? 0.6 : 1 }}
                  onClick={handlePayInstallment}
                  disabled={paying}
                >
                  {paying
                    ? "Processing..."
                    : paidCount === 0
                    ? `Pay Deposit — $${existingRequest.deposit_amount_usd || (existingRequest.total_cost_usd * 0.2).toFixed(2)}`
                    : `Pay Next Installment — $${existingRequest.amount_per_installment}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── New request form ──
  return (
    <div style={styles.page}>
      {showGate && <UpgradeGateModal featureName="Incorporate Now, Pay Later" onClose={() => setShowGate(false)} />}

      <button style={styles.backBtn} onClick={() => router.push(backPath)}>
        <ArrowLeft size={14} />Services
      </button>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Building2 size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Incorporate Now, Pay Later</h1>
          <p style={styles.headerSub}>Register your company. Pay a deposit, spread the rest.</p>
        </div>
      </div>

      <IncorporationNotes country={country} />

      <div style={styles.card}>
        <label style={styles.label}>Country <span style={styles.req}>*</span></label>
        <select style={styles.select} value={country} onChange={(e) => handleCountryChange(e.target.value)}>
          <option value="nigeria">Nigeria — Private Limited Liability (CAC)</option>
          <option value="ghana">Ghana — Limited Liability Company (RGD)</option>
          <option value="delaware">Delaware, USA — C-Corporation</option>
        </select>

        <label style={styles.label}>Entity Type <span style={styles.req}>*</span></label>
        <input
          style={styles.input}
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        />

        <label style={styles.label}>Proposed Company Name <span style={styles.req}>*</span></label>
        <input
          style={styles.input}
          placeholder="e.g. FleetBridge Technologies Ltd"
          value={proposedName}
          onChange={(e) => setProposedName(e.target.value)}
        />

        <label style={styles.label}>Alternative Name (optional)</label>
        <input style={styles.input} value={altName1} onChange={(e) => setAltName1(e.target.value)} />

        <label style={styles.label}>Second Alternative (optional)</label>
        <input style={styles.input} value={altName2} onChange={(e) => setAltName2(e.target.value)} />

        <label style={styles.label}>Payment Plan</label>
        <div style={styles.installmentGrid}>
          {[6, 12].map((months) => (
            <button
              key={months}
              style={{
                ...styles.installmentBtn,
                ...(installmentMonths === months ? styles.installmentBtnActive : {}),
              }}
              onClick={() => setInstallmentMonths(months as 6 | 12)}
            >
              <span style={styles.installmentMonths}>{months} months</span>
              <span style={styles.installmentAmount}>
                ${Math.ceil(((totalCost - totalCost * 0.2) / months) * 100) / 100}/mo after deposit
              </span>
            </button>
          ))}
        </div>

        <div style={styles.totalBox}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total cost</span>
            <span style={styles.totalValue}>${totalCost}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalSubLabel}>Deposit due now (20%)</span>
            <span style={styles.totalSubValue}>${depositAmount}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalSubLabel}>Then {installmentMonths} × </span>
            <span style={styles.totalSubValue}>${amountPerInstallment}/mo</span>
          </div>
        </div>

        <button
          style={{ ...styles.submitBtn, opacity: proposedName && entityType && !submitting ? 1 : 0.5 }}
          onClick={handleSubmit}
          disabled={!proposedName || !entityType || submitting}
        >
          <Send size={13} />
          {submitting ? "Submitting..." : "Submit Request"}
        </button>

        <p style={styles.disclaimer}>
          After submitting, our team reviews your request within 2-3 business days. Once approved, you'll be prompted to pay your deposit to reserve your name and begin processing.
        </p>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "560px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", padding: "0" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "16px" },
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 14px 0" },
  label: { display: "block", fontSize: "13px", fontWeight: "500", color: "#111111", marginBottom: "6px", marginTop: "14px" },
  req: { color: "#e53e3e" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111", appearance: "none" },
  installmentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  installmentBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "14px", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "10px", cursor: "pointer" },
  installmentBtnActive: { backgroundColor: "#f0fff4", border: "1px solid #38a169" },
  installmentMonths: { fontSize: "14px", fontWeight: "700", color: "#111111" },
  installmentAmount: { fontSize: "11px", color: "#888888", textAlign: "center" },
  totalBox: { padding: "14px", backgroundColor: "#f9f9f9", borderRadius: "10px", marginTop: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: "13px", color: "#888888", fontWeight: "500" },
  totalValue: { fontSize: "18px", fontWeight: "700", color: "#111111" },
  totalSubLabel: { fontSize: "12px", color: "#aaaaaa" },
  totalSubValue: { fontSize: "12px", color: "#555555", fontWeight: "600" },
  submitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  disclaimer: { fontSize: "11px", color: "#bbbbbb", textAlign: "center", lineHeight: "1.6", margin: "12px 0 0 0" },
  statusRow: { marginBottom: "16px" },
  statusBadge: { fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "99px" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "8px" },
  detailLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px 0" },
  detailValue: { fontSize: "13px", color: "#111111", margin: "0" },
  notesBox: { backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "14px", marginTop: "14px" },
  notesLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px 0" },
  notesText: { fontSize: "13px", color: "#555555", lineHeight: "1.6", margin: "0" },
  progressBar: { width: "100%", height: "6px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden", marginBottom: "8px" },
  progressFill: { height: "100%", backgroundColor: "#38a169", borderRadius: "99px", transition: "width 0.5s ease" },
  progressText: { fontSize: "12px", color: "#888888", margin: "0 0 16px 0" },
  paidBox: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "10px" },
  paidText: { fontSize: "13px", color: "#38a169", fontWeight: "500" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0 0 10px 0" },
  payBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};