"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";
import { X, CheckCircle, Copy } from "lucide-react";
import ETicket from "@/components/venture-room/ETicket";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function RegistrationModal({ onClose }: { onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startupName, setStartupName] = useState("");
  const [role, setRole] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
  }, []);

  const canSubmit = fullName && email;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initialize-venture-room-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName, email, phone: phone || undefined,
            startup_name: startupName || undefined, role: role || undefined,
            coupon_code: couponCode || undefined,
          }),
        }
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: data.ngn_amount * 100,
        ref: data.reference,
        currency: "NGN",
        metadata: { registration_id: data.registration_id, ticket_code: data.ticket_code },
        callback: () => {
          setTicketCode(data.ticket_code);
          setRegisteredName(fullName);
          setRegisteredEmail(email);
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
      handler.openIframe();

    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!ticketCode) return;
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} color={VR_COLORS.primary} /></button>

        {ticketCode ? (
          <div style={styles.successState}>
            <div style={styles.successIcon}><CheckCircle size={30} color={VR_COLORS.primary} /></div>
            <h2 style={styles.successTitle}>You're in.</h2>
            <p style={styles.successText}>
              Save your ticket. Bring it with you on 26 September to check in at Bridge by Obsidian.
            </p>
            <ETicket fullName={registeredName} email={registeredEmail} ticketCode={ticketCode} />
            <button style={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Register for The Venture Room</h2>
            <p style={styles.subtitle}>26 September 2026 · Bridge by Obsidian, Yaba, Lagos</p>

            <label style={styles.label}>Full name</label>
            <input style={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />

            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label style={styles.label}>Phone (optional)</label>
            <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />

            <label style={styles.label}>Startup name (optional)</label>
            <input style={styles.input} value={startupName} onChange={(e) => setStartupName(e.target.value)} />

            <label style={styles.label}>Your role (optional)</label>
            <input style={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder, CEO" />

            <label style={styles.label}>Coupon code (optional)</label>
            <input style={styles.input} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Have a code?" />

            {error && <p style={styles.errorText}>{error}</p>}

            <button
              style={{ ...styles.submitBtn, opacity: canSubmit && !loading ? 1 : 0.5 }}
              onClick={handleRegister}
              disabled={!canSubmit || loading}
            >
              {loading ? "Processing..." : "Continue to Pay & Register"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(48,22,96,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { position: "relative", backgroundColor: VR_COLORS.white, borderRadius: "20px", padding: "36px", maxWidth: "420px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  closeBtn: { position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer" },
  title: { fontFamily: VR_FONTS.body, fontSize: "20px", fontWeight: 700, color: VR_COLORS.primary, margin: "0 0 6px 0" },
  subtitle: { fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 500, color: VR_COLORS.primary, opacity: 0.6, margin: "0 0 24px 0" },
  label: { fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 600, color: VR_COLORS.primary, display: "block", marginBottom: "6px", marginTop: "14px" },
  input: { width: "100%", padding: "11px 14px", fontSize: "14px", fontFamily: VR_FONTS.body, border: `1px solid ${VR_COLORS.primary}25`, borderRadius: "9px", outline: "none", backgroundColor: "#FAFAF8", color: VR_COLORS.primary, boxSizing: "border-box" },
  errorText: { fontFamily: VR_FONTS.body, fontSize: "12px", color: "#e53e3e", margin: "14px 0 0 0" },
  submitBtn: { width: "100%", padding: "14px", fontFamily: VR_FONTS.body, fontSize: "14px", fontWeight: 700, color: VR_COLORS.white, backgroundColor: VR_COLORS.primary, border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "24px" },
  successState: { textAlign: "center", paddingTop: "8px" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: VR_COLORS.accent + "40", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  successTitle: { fontFamily: VR_FONTS.display, fontSize: "24px", color: VR_COLORS.primary, margin: "0 0 10px 0" },
  successText: { fontFamily: VR_FONTS.body, fontSize: "13px", color: VR_COLORS.primary, opacity: 0.75, lineHeight: "1.6", margin: "0 0 24px 0" },
  codeBox: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", backgroundColor: VR_COLORS.accent + "25", border: `1px solid ${VR_COLORS.accent}`, borderRadius: "12px", marginBottom: "20px" },
  codeText: { fontFamily: VR_FONTS.display, fontSize: "18px", color: VR_COLORS.primary, letterSpacing: "0.05em" },
  copyBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 700, color: VR_COLORS.primary, backgroundColor: VR_COLORS.white, border: `1px solid ${VR_COLORS.primary}30`, borderRadius: "8px", cursor: "pointer" },
  doneBtn: { width: "100%", padding: "13px", fontFamily: VR_FONTS.body, fontSize: "13px", fontWeight: 700, color: VR_COLORS.white, backgroundColor: VR_COLORS.primary, border: "none", borderRadius: "10px", cursor: "pointer" },
};