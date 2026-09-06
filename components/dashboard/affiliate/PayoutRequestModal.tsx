"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

const METHODS = [
  { value: "bank_transfer", label: "Bank transfer (NGN)" },
  { value: "paypal", label: "PayPal" },
  { value: "account_credit", label: "Credit toward my Xeero fees" },
  { value: "other", label: "Other" },
];

export default function PayoutRequestModal({
  profileId,
  amountUsd,
  onClose,
  onSubmitted,
}: {
  profileId: string;
  amountUsd: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [method, setMethod] = useState("bank_transfer");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (method !== "account_credit" && !details.trim()) {
      setError("Please provide the details needed to pay you.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: dbError } = await supabase.from("affiliate_payouts").insert({
      profile_id: profileId,
      amount_usd: amountUsd,
      payout_method: method,
      payout_details: details || null,
      status: "pending",
    });

    if (dbError) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    onSubmitted();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <p style={styles.title}>Request Payout</p>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} color="#888888" /></button>
        </div>

        <p style={styles.amountText}>Requesting <strong>${amountUsd.toFixed(2)}</strong></p>

        <label style={styles.label}>How should we pay you?</label>
        <select style={styles.select} value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {method !== "account_credit" && (
          <>
            <label style={styles.label}>
              {method === "bank_transfer" ? "Bank name, account number, account name" :
               method === "paypal" ? "PayPal email" : "Payment details"}
            </label>
            <textarea
              style={styles.textarea}
              placeholder={
                method === "bank_transfer" ? "e.g. GTBank, 0123456789, Jane Doe" :
                method === "paypal" ? "e.g. jane@email.com" : "Describe how to pay you"
              }
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </>
        )}

        {error && <p style={styles.errorText}>{error}</p>}

        <button
          style={{ ...styles.submitBtn, opacity: submitting ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", display: "flex" },
  amountText: { fontSize: "13px", color: "#666666", margin: "0 0 18px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "12px" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", appearance: "none" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "60px", resize: "vertical", fontFamily: "inherit" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "12px 0 0 0" },
  submitBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "18px" },
};