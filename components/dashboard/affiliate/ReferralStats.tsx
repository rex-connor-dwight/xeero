"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Users, DollarSign, Send } from "lucide-react";
import PayoutRequestModal from "@/components/dashboard/affiliate/PayoutRequestModal";

type Referral = {
  id: string;
  status: string;
  go_live_reward_usd: number | null;
  teams_reward_usd: number | null;
  created_at: string;
};

export default function ReferralStats() {
  const { profile } = useXeero();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [paidOutUsd, setPaidOutUsd] = useState(0);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("affiliate_referrals")
      .select("id, status, go_live_reward_usd, teams_reward_usd, created_at")
      .eq("referrer_profile_id", profile.id)
      .then(({ data }) => {
        setReferrals(data || []);
        setLoading(false);
      });

    supabase
      .from("affiliate_payouts")
      .select("id, status, amount_usd")
      .eq("profile_id", profile.id)
      .then(({ data }) => {
        const pending = (data || []).find((p) => p.status === "pending");
        if (pending) setPayoutRequested(true);

        // Sum everything already paid or currently pending review —
        // both count as "already accounted for", not available to request again.
        const accountedFor = (data || [])
          .filter((p) => p.status === "paid" || p.status === "pending")
          .reduce((sum, p) => sum + Number(p.amount_usd), 0);
        setPaidOutUsd(accountedFor);
      });
  }, [profile]);

  if (loading) return null;

  const totalReferred = referrals.length;
  const rewarded = referrals.filter((r) => r.status !== "pending");
  const lifetimeEarnedUsd = rewarded.reduce(
    (sum, r) => sum + (r.go_live_reward_usd || 0) + (r.teams_reward_usd || 0),
    0
  );
  const availableToRequestUsd = Math.max(0, lifetimeEarnedUsd - paidOutUsd);
  const pendingCount = referrals.filter((r) => r.status === "pending").length;

  return (
    <div style={styles.card}>
      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          <div style={styles.statIcon}><Users size={14} color="#3182ce" /></div>
          <div>
            <p style={styles.statValue}>{totalReferred}</p>
            <p style={styles.statLabel}>Referred</p>
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statIcon}><DollarSign size={14} color="#38a169" /></div>
          <div>
            <p style={styles.statValue}>${lifetimeEarnedUsd.toFixed(2)}</p>
            <p style={styles.statLabel}>Earned</p>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <p style={styles.pendingNote}>
          {pendingCount} referral{pendingCount !== 1 ? "s" : ""} still waiting to go live.
        </p>
      )}

      {payoutRequested ? (
        <div style={styles.payoutPending}>
          <p style={styles.payoutPendingText}>Payout request submitted. We'll be in touch.</p>
        </div>
      ) : availableToRequestUsd > 0 ? (
        <button style={styles.payoutBtn} onClick={() => setShowPayoutModal(true)}>
          <Send size={13} />Request Payout — ${availableToRequestUsd.toFixed(2)}
        </button>
      ) : lifetimeEarnedUsd > 0 ? (
        <div style={styles.allPaidNote}>
          <p style={styles.allPaidText}>You're all caught up. New earnings show up here as soon as your next referral goes live.</p>
        </div>
      ) : null}

      {showPayoutModal && profile && (
        <PayoutRequestModal
          profileId={profile.id}
          amountUsd={availableToRequestUsd}
          onClose={() => setShowPayoutModal(false)}
          onSubmitted={() => { setPayoutRequested(true); setShowPayoutModal(false); }}
        />
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "16px" },
  statsRow: { display: "flex", gap: "24px", marginBottom: "12px" },
  statItem: { display: "flex", alignItems: "center", gap: "10px" },
  statIcon: { width: "30px", height: "30px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValue: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  pendingNote: { fontSize: "12px", color: "#999999", margin: "0 0 12px 0" },
  payoutBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "10px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  payoutPending: { padding: "10px 14px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px" },
  payoutPendingText: { fontSize: "12px", color: "#92610a", margin: "0" },
  allPaidNote: { padding: "10px 14px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "8px" },
  allPaidText: { fontSize: "12px", color: "#38a169", margin: "0", lineHeight: "1.5" },
};