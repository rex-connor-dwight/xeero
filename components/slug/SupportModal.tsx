"use client";

import { useState } from "react";
import { Heart, CheckCircle } from "lucide-react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function SupportModal({
  startupName,
  profileId,
  onClose,
}: {
  startupName: string;
  profileId: string;
  onClose: () => void;
}) {
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportAmount, setSupportAmount] = useState<number | null>(null);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportDone, setSupportDone] = useState(false);
  const [supportError, setSupportError] = useState("");

  const handleSupport = async () => {
    if (!supportName || !supportEmail || !supportAmount) return;
    setSupportLoading(true);
    setSupportError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initialize-support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            profile_id: profileId,
            amount_usd: supportAmount,
            tier: supportAmount === 0.1 ? "Test"
              : supportAmount === 1 ? "Believer"
              : supportAmount === 5 ? "Early Supporter"
              : supportAmount === 10 ? "Backing You"
              : supportAmount === 50 ? "Champion"
              : "Lead Believer",
            supporter_name: supportName,
            supporter_email: supportEmail,
            is_public: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        setSupportError(data.error || "Something went wrong.");
        setSupportLoading(false);
        return;
      }

      setSupportLoading(false);

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: supportEmail,
        amount: data.ngn_amount * 100,
        ref: data.reference,
        currency: "NGN",
        callback: () => {
          setSupportDone(true);
        },
        onClose: () => {
          setSupportLoading(false);
        },
      });
      handler.openIframe();

    } catch {
      setSupportError("Something went wrong. Please try again.");
      setSupportLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>
            <Heart size={16} color="#38a169" />
            <span>Support this founder</span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {supportDone ? (
          <div style={styles.successWrapper}>
            <CheckCircle size={28} color="#38a169" />
            <p style={styles.successTitle}>Thank you for believing.</p>
            <p style={styles.successText}>
              The founder will be in touch about early access.
            </p>
          </div>
        ) : (
          <div style={styles.form}>
            <p style={styles.intro}>
              Support <strong>{startupName}</strong> and get early access to what they're building.
            </p>

            <p style={styles.label}>Choose an amount</p>
            <div style={styles.tiers}>
              {[
                { amount: 0.1, label: "Test (₦100)" },
                { amount: 1, label: "Believer" },
                { amount: 5, label: "Early Supporter" },
                { amount: 10, label: "Backing You" },
                { amount: 50, label: "Champion" },
                { amount: 100, label: "Lead Believer" },
              ].map((tier) => (
                <button
                  key={tier.amount}
                  style={{
                    ...styles.tierBtn,
                    ...(supportAmount === tier.amount ? styles.tierBtnActive : {}),
                  }}
                  onClick={() => setSupportAmount(tier.amount)}
                >
                  <span style={styles.tierAmount}>${tier.amount}</span>
                  <span style={styles.tierLabel}>{tier.label}</span>
                </button>
              ))}
            </div>

            <p style={styles.label}>Your details</p>
            <input
              style={styles.input}
              placeholder="Your name"
              value={supportName}
              onChange={(e) => setSupportName(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Your email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />

            {supportError && <p style={styles.error}>{supportError}</p>}

            <button
              style={{
                ...styles.payBtn,
                opacity: supportName && supportEmail && supportAmount && !supportLoading ? 1 : 0.5,
              }}
              onClick={handleSupport}
              disabled={!supportName || !supportEmail || !supportAmount || supportLoading}
            >
              <Heart size={14} color="#ffffff" />
              {supportLoading ? "Processing..." : `Support with $${supportAmount || "..."}`}
            </button>

            <p style={styles.disclaimer}>
              Secure payment via Paystack. You get early access forever.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal: { backgroundColor: "#ffffff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "480px", padding: "24px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  modalTitle: { display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "700", color: "#111111" },
  closeBtn: { fontSize: "14px", color: "#888888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" },
  successWrapper: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "24px 0", textAlign: "center" },
  successTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0" },
  successText: { fontSize: "14px", color: "#666666", margin: "0", lineHeight: "1.6" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  intro: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0" },
  label: { fontSize: "12px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0" },
  tiers: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
  tierBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 8px", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "10px", cursor: "pointer" },
  tierBtnActive: { backgroundColor: "#f0fff4", border: "1px solid #38a169" },
  tierAmount: { fontSize: "16px", fontWeight: "700", color: "#111111" },
  tierLabel: { fontSize: "10px", color: "#888888" },
  input: { width: "100%", padding: "11px 14px", fontSize: "16px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box" },
  error: { fontSize: "12px", color: "#e53e3e", margin: "0" },
  payBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#38a169", border: "none", borderRadius: "10px", cursor: "pointer", transition: "opacity 0.2s ease" },
  disclaimer: { fontSize: "11px", color: "#bbbbbb", textAlign: "center", margin: "0" },
};