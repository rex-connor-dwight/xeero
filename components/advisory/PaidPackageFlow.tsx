"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getCalendlyLink, PHYSICAL_COORDINATION_NOTE, type AdvisoryPackage } from "@/lib/data/advisoryPackages";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function PaidPackageFlow({
  pkg,
  onBack,
}: {
  pkg: AdvisoryPackage;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sessionMode, setSessionMode] = useState<"virtual" | "physical" | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
  }, []);

  const canPay = name && email && (!pkg.hasModeSelection || sessionMode);

  const handlePay = async () => {
    if (!canPay) return;
    setInitializing(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initialize-consultation-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            package_key: pkg.key,
            founder_name: name,
            founder_email: email,
            session_mode: sessionMode,
          }),
        }
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setInitializing(false);
        return;
      }

      setInitializing(false);

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: data.ngn_amount * 100,
        ref: data.reference,
        currency: "NGN",
        metadata: {
          booking_id: data.booking_id,
          package_key: pkg.key,
          usd_price: data.usd_amount,
          custom_fields: [
            { display_name: "Booking ID", variable_name: "booking_id", value: data.booking_id },
          ],
        },
        callback: () => {
          setConfirmed(true);
        },
        onClose: () => {},
      });
      handler.openIframe();

    } catch {
      setError("Something went wrong. Please try again.");
      setInitializing(false);
    }
  };

  if (confirmed) {
    const calendlyLink = getCalendlyLink(pkg.key, sessionMode);
    return (
      <div style={styles.card}>
        <div style={styles.successIcon}><CheckCircle size={24} color="#38a169" /></div>
        <h2 style={styles.title}>Payment confirmed</h2>
        <p style={styles.text}>
          You're booked in for the {pkg.name}. Choose a time that works for you below.
        </p>
        {pkg.key === "founder_intensive" && sessionMode === "physical" && (
          <p style={styles.noteText}>{PHYSICAL_COORDINATION_NOTE}</p>
        )}
        <a href={calendlyLink} target="_blank" rel="noopener noreferrer" style={styles.calendlyBtn}>
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
      <h2 style={styles.title}>{pkg.name}</h2>
      <p style={styles.text}>{pkg.priceLabel} — {pkg.duration}</p>

      <label style={styles.label}>Your name</label>
      <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />

      <label style={styles.label}>Your email</label>
      <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@startup.com" />

      {pkg.hasModeSelection && (
        <>
          <label style={styles.label}>Format</label>
          <div style={styles.modeRow}>
            <button
              style={{ ...styles.modeBtn, ...(sessionMode === "virtual" ? styles.modeBtnActive : {}) }}
              onClick={() => setSessionMode("virtual")}
            >
              Virtual
            </button>
            <button
              style={{ ...styles.modeBtn, ...(sessionMode === "physical" ? styles.modeBtnActive : {}) }}
              onClick={() => setSessionMode("physical")}
            >
              Physical
            </button>
          </div>
        </>
      )}

      {error && <p style={styles.errorTextInline}>{error}</p>}

      <button
        style={{ ...styles.submitBtn, opacity: canPay && !initializing ? 1 : 0.5 }}
        onClick={handlePay}
        disabled={!canPay || initializing}
      >
        {initializing ? "Preparing..." : `Pay ${pkg.priceLabel} and Continue`}
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "32px", maxWidth: "440px", margin: "0 auto" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "16px", padding: "0" },
  title: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  text: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0 0 20px 0" },
  noteText: { fontSize: "12px", color: "#92610a", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px", padding: "10px 12px", lineHeight: "1.6", marginBottom: "16px" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "12px" },
  input: { width: "100%", padding: "11px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  modeRow: { display: "flex", gap: "8px" },
  modeBtn: { flex: 1, padding: "11px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  modeBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  errorTextInline: { fontSize: "12px", color: "#e53e3e", margin: "14px 0 0 0" },
  submitBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "700", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "20px" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  calendlyBtn: { display: "block", textAlign: "center", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", borderRadius: "10px", textDecoration: "none", marginTop: "8px" },
};