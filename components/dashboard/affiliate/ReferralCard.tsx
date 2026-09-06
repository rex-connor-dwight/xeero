"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Gift, Copy, CheckCircle } from "lucide-react";

export default function ReferralCard() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-or-create-referral-link`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${session?.access_token}` },
        }
      );
      const data = await res.json();
      if (data.referral_code) setCode(data.referral_code);
      setLoading(false);
    };
    fetchLink();
  }, []);

  const referralUrl = code ? `https://xeero.me?ref=${code}` : "";

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.headerIcon}><Gift size={16} color="#111111" /></div>
        <div>
          <p style={styles.title}>Refer & Earn</p>
          <p style={styles.subtitle}>Share your link. Earn when someone goes live or upgrades to Teams.</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingRow}><div style={styles.loadingDot} /></div>
      ) : (
        <div style={styles.linkRow}>
          <span style={styles.linkText}>{referralUrl}</span>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? <CheckCircle size={13} color="#38a169" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "16px" },
  headerRow: { display: "flex", gap: "12px", marginBottom: "16px" },
  headerIcon: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  subtitle: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.5" },
  loadingRow: { display: "flex", justifyContent: "center", padding: "12px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  linkRow: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "10px", padding: "10px 14px" },
  linkText: { flex: 1, fontSize: "13px", color: "#444444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  copyBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", fontSize: "12px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
};