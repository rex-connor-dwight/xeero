"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Search, RotateCcw, X } from "lucide-react";

type Result = {
  status: "valid" | "already_checked_in" | "unpaid" | "not_found";
  registration?: {
    full_name: string;
    email: string;
    startup_name: string | null;
    checked_in_at: string | null;
  };
};

export default function CheckinModal({ onClose, onCheckedIn }: { onClose: () => void; onCheckedIn: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleLookup = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);

    const { data } = await supabase
      .from("venture_room_registrations")
      .select("full_name, email, startup_name, payment_status, checked_in, checked_in_at")
      .eq("ticket_code", trimmed)
      .maybeSingle();

    if (!data) {
      setResult({ status: "not_found" });
    } else if (data.payment_status !== "paid") {
      setResult({ status: "unpaid", registration: data });
    } else if (data.checked_in) {
      setResult({ status: "already_checked_in", registration: data });
    } else {
      setResult({ status: "valid", registration: data });
    }

    setLoading(false);
  };

  const handleConfirmCheckin = async () => {
    setConfirming(true);
    await supabase
      .from("venture_room_registrations")
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq("ticket_code", code.trim().toUpperCase());
    setConfirming(false);
    setResult({
      status: "already_checked_in",
      registration: { ...result!.registration!, checked_in_at: new Date().toISOString() },
    });
    onCheckedIn();
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><X size={16} color="#888888" /></button>

        <h1 style={styles.title}>Check-In</h1>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Enter ticket code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            autoFocus
          />
          <button style={styles.lookupBtn} onClick={handleLookup} disabled={loading || !code.trim()}>
            <Search size={16} />
          </button>
        </div>

        {loading && <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>}

        {result && !loading && (
          <div style={styles.resultCard}>
            {result.status === "not_found" && (
              <>
                <XCircle size={40} color="#e53e3e" />
                <p style={styles.resultTitle}>Ticket not found</p>
                <p style={styles.resultText}>No registration matches this code.</p>
              </>
            )}

            {result.status === "unpaid" && (
              <>
                <XCircle size={40} color="#d69e2e" />
                <p style={styles.resultTitle}>Payment not confirmed</p>
                <p style={styles.resultText}>
                  {result.registration?.full_name} — this ticket hasn't been paid for.
                </p>
              </>
            )}

            {result.status === "already_checked_in" && (
              <>
                <CheckCircle size={40} color="#3182ce" />
                <p style={styles.resultTitle}>Already checked in</p>
                <p style={styles.resultText}>
                  {result.registration?.full_name}
                  {result.registration?.startup_name ? ` · ${result.registration.startup_name}` : ""}
                </p>
                {result.registration?.checked_in_at && (
                  <p style={styles.resultSub}>
                    Checked in at {new Date(result.registration.checked_in_at).toLocaleTimeString()}
                  </p>
                )}
              </>
            )}

            {result.status === "valid" && (
              <>
                <CheckCircle size={40} color="#38a169" />
                <p style={styles.resultTitle}>Valid ticket</p>
                <p style={styles.resultText}>
                  {result.registration?.full_name}
                  {result.registration?.startup_name ? ` · ${result.registration.startup_name}` : ""}
                </p>
                <p style={styles.resultSub}>{result.registration?.email}</p>
                <button style={styles.confirmBtn} onClick={handleConfirmCheckin} disabled={confirming}>
                  {confirming ? "Checking in..." : "Confirm Check-In"}
                </button>
              </>
            )}

            <button style={styles.resetBtn} onClick={handleReset}>
              <RotateCcw size={13} />Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  card: { position: "relative", backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", maxWidth: "420px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  closeBtn: { position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer" },
  title: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 24px 0", textAlign: "center" },
  inputRow: { display: "flex", gap: "8px" },
  input: { flex: 1, padding: "14px 16px", fontSize: "16px", fontWeight: "600", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none", backgroundColor: "#fafafa", color: "#111111", textTransform: "uppercase", letterSpacing: "0.03em" },
  lookupBtn: { width: "48px", height: "48px", borderRadius: "10px", backgroundColor: "#111111", border: "none", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  loadingWrap: { display: "flex", justifyContent: "center", padding: "40px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  resultCard: { marginTop: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px" },
  resultTitle: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "10px 0 0 0" },
  resultText: { fontSize: "14px", color: "#555555", margin: "0" },
  resultSub: { fontSize: "12px", color: "#aaaaaa", margin: "0" },
  confirmBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "700", color: "#ffffff", backgroundColor: "#38a169", border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "16px" },
  resetBtn: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "500", color: "#888888", background: "none", border: "none", cursor: "pointer", marginTop: "16px" },
};