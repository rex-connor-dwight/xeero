"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PordwareStep2({
  activeProfile,
  application,
  saving,
  onNext,
  onBack,
}: {
  activeProfile: any;
  application: any;
  saving: boolean;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
}) {
  const [startupName, setStartupName] = useState(application?.startup_name || activeProfile?.startup_name || "");
  const [websiteUrl, setWebsiteUrl] = useState(application?.website_url || activeProfile?.website || "");
  const [industry, setIndustry] = useState(application?.industry || activeProfile?.industry || "");
  const [marketServed, setMarketServed] = useState(application?.market_served || activeProfile?.location || "");
  const [startupStage, setStartupStage] = useState(application?.startup_stage || activeProfile?.stage || "");
  const [revenueStatus, setRevenueStatus] = useState(application?.revenue_status || "");
  const [revenueAmount, setRevenueAmount] = useState(application?.revenue_amount || "");
  const [customerCount, setCustomerCount] = useState(application?.customer_count || "");
  const [fundingStatus, setFundingStatus] = useState(application?.funding_status || "");
  const [amountRaised, setAmountRaised] = useState(application?.amount_raised_to_date || "");
  const [currentlyFundraising, setCurrentlyFundraising] = useState<boolean | null>(application?.currently_fundraising ?? null);

  const canContinue = startupName && industry && startupStage && revenueStatus && fundingStatus && currentlyFundraising !== null;

  const handleNext = () => {
    onNext({
      startup_name: startupName,
      website_url: websiteUrl || null,
      industry,
      market_served: marketServed || null,
      startup_stage: startupStage,
      revenue_status: revenueStatus,
      revenue_amount: revenueAmount || null,
      customer_count: customerCount || null,
      funding_status: fundingStatus,
      amount_raised_to_date: amountRaised || null,
      currently_fundraising: currentlyFundraising,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 2 of 9</p>
      <h2 style={styles.title}>Startup Information</h2>
      <p style={styles.subtitle}>Where things stand today.</p>

      <label style={styles.label}>Startup name</label>
      <input style={styles.input} value={startupName} onChange={(e) => setStartupName(e.target.value)} />

      <label style={styles.label}>Website / product URL</label>
      <input style={styles.input} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />

      <label style={styles.label}>Industry</label>
      <input style={styles.input} value={industry} onChange={(e) => setIndustry(e.target.value)} />

      <label style={styles.label}>Location / market served</label>
      <input style={styles.input} value={marketServed} onChange={(e) => setMarketServed(e.target.value)} />

      <label style={styles.label}>Startup stage</label>
      <input style={styles.input} value={startupStage} onChange={(e) => setStartupStage(e.target.value)} placeholder="e.g. Pre-seed, MVP, Growth" />

      <label style={styles.label}>Revenue status</label>
      <select style={styles.select} value={revenueStatus} onChange={(e) => setRevenueStatus(e.target.value)}>
        <option value="">Select</option>
        <option value="pre_revenue">Pre-revenue</option>
        <option value="early_revenue">Early revenue</option>
        <option value="revenue_generating">Revenue generating</option>
      </select>

      <label style={styles.label}>Monthly / annual revenue (if applicable)</label>
      <input style={styles.input} value={revenueAmount} onChange={(e) => setRevenueAmount(e.target.value)} placeholder="e.g. $2,000/month" />

      <label style={styles.label}>Number of users / customers</label>
      <input style={styles.input} value={customerCount} onChange={(e) => setCustomerCount(e.target.value)} />

      <label style={styles.label}>Funding status</label>
      <select style={styles.select} value={fundingStatus} onChange={(e) => setFundingStatus(e.target.value)}>
        <option value="">Select</option>
        <option value="bootstrapped">Bootstrapped</option>
        <option value="raised">Raised previously</option>
        <option value="raising">Currently raising</option>
      </select>

      <label style={styles.label}>Amount raised to date</label>
      <input style={styles.input} value={amountRaised} onChange={(e) => setAmountRaised(e.target.value)} placeholder="e.g. $0, or $50,000" />

      <label style={styles.label}>Currently fundraising?</label>
      <div style={styles.toggleRow}>
        <button
          style={{ ...styles.toggleBtn, ...(currentlyFundraising === true ? styles.toggleBtnActive : {}) }}
          onClick={() => setCurrentlyFundraising(true)}
        >
          Yes
        </button>
        <button
          style={{ ...styles.toggleBtn, ...(currentlyFundraising === false ? styles.toggleBtnActive : {}) }}
          onClick={() => setCurrentlyFundraising(false)}
        >
          No
        </button>
      </div>

      <div style={styles.navRow}>
        <button style={styles.backBtn} onClick={onBack}><ArrowLeft size={13} />Back</button>
        <button
          style={{ ...styles.nextBtn, opacity: canContinue && !saving ? 1 : 0.5 }}
          onClick={handleNext}
          disabled={!canContinue || saving}
        >
          {saving ? "Saving..." : "Save & Continue"}
          {!saving && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  stepLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 20px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", appearance: "none" },
  toggleRow: { display: "flex", gap: "8px" },
  toggleBtn: { flex: 1, padding: "10px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  toggleBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};