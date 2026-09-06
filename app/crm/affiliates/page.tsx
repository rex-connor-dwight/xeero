"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Gift, Users, DollarSign, CheckCircle, X } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Payout = {
  id: string;
  profile_id: string;
  amount_usd: number;
  payout_method: string;
  payout_details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profiles: { startup_name: string; founder_name: string; slug: string };
};

type Referral = {
  id: string;
  status: string;
  go_live_reward_usd: number | null;
  teams_reward_usd: number | null;
  created_at: string;
  referrer: { startup_name: string } | null;
  referred: { startup_name: string } | null;
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  paypal: "PayPal",
  account_credit: "Account Credit",
  other: "Other",
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CrmAffiliatesPage() {
  const { user, loading } = useXeero();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const fetchData = async () => {
    const { data: payoutData } = await supabase
      .from("affiliate_payouts")
      .select("*, profiles(startup_name, founder_name, slug)")
      .order("created_at", { ascending: false });
    setPayouts(payoutData || []);

    const { data: referralData } = await supabase
      .from("affiliate_referrals")
      .select("*, referrer:profiles!affiliate_referrals_referrer_profile_id_fkey(startup_name), referred:profiles!affiliate_referrals_referred_profile_id_fkey(startup_name)")
      .order("created_at", { ascending: false });
    setReferrals(referralData || []);

    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handlePayoutAction = async (id: string, status: "paid" | "rejected") => {
    setProcessingId(id);
    await supabase
      .from("affiliate_payouts")
      .update({
        status,
        admin_notes: notesDraft[id] || null,
        paid_at: status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (status === "paid") {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-affiliate-payout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ payout_id: id }),
          }
        );
      } catch (err) {
        console.error("Failed to send payout receipt email:", err);
      }
    }

    await fetchData();
    setProcessingId(null);
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const pendingPayouts = payouts.filter((p) => p.status === "pending");
  const resolvedPayouts = payouts.filter((p) => p.status !== "pending");

  const totalReferrals = referrals.length;
  const rewardedReferrals = referrals.filter((r) => r.status !== "pending");
  const totalRewardedUsd = rewardedReferrals.reduce(
    (sum, r) => sum + (r.go_live_reward_usd || 0) + (r.teams_reward_usd || 0),
    0
  );

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Gift size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Affiliate Program</h1>
          <p style={styles.headerSub}>{pendingPayouts.length} pending payout{pendingPayouts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <Users size={14} color="#3182ce" />
          <span style={styles.statValue}>{totalReferrals}</span>
          <span style={styles.statLabel}>Total Referrals</span>
        </div>
        <div style={styles.statCard}>
          <DollarSign size={14} color="#38a169" />
          <span style={styles.statValue}>${totalRewardedUsd.toFixed(2)}</span>
          <span style={styles.statLabel}>Total Rewarded</span>
        </div>
        <div style={styles.statCard}>
          <Gift size={14} color="#d69e2e" />
          <span style={styles.statValue}>{pendingPayouts.length}</span>
          <span style={styles.statLabel}>Awaiting Payout</span>
        </div>
      </div>

      <p style={styles.sectionLabel}>Pending Payouts</p>
      {pendingPayouts.length === 0 ? (
        <p style={styles.emptyText}>No pending payout requests.</p>
      ) : (
        <div style={styles.list}>
          {pendingPayouts.map((p) => (
            <div key={p.id} style={styles.payoutCard}>
              <div style={styles.payoutTop}>
                <div>
                  <p style={styles.payoutTitle}>{p.profiles?.startup_name || "Unknown"}</p>
                  <p style={styles.payoutSub}>{p.profiles?.founder_name} · xeero.me/{p.profiles?.slug}</p>
                  <p style={styles.payoutMeta}>{timeAgo(p.created_at)}</p>
                </div>
                <span style={styles.amountBadge}>${p.amount_usd.toFixed(2)}</span>
              </div>

              <div style={styles.payoutDetails}>
                <p style={styles.detailLabel}>Method</p>
                <p style={styles.detailValue}>{METHOD_LABELS[p.payout_method] || p.payout_method}</p>
                {p.payout_details && (
                  <>
                    <p style={styles.detailLabel}>Details</p>
                    <p style={styles.detailValue}>{p.payout_details}</p>
                  </>
                )}
              </div>

              <textarea
                style={styles.notesInput}
                placeholder="Optional note (e.g. transaction reference)"
                onChange={(e) => setNotesDraft((prev) => ({ ...prev, [p.id]: e.target.value }))}
              />

              <div style={styles.actionRow}>
                <button
                  style={styles.rejectBtn}
                  onClick={() => handlePayoutAction(p.id, "rejected")}
                  disabled={processingId === p.id}
                >
                  <X size={13} />Reject
                </button>
                <button
                  style={styles.paidBtn}
                  onClick={() => handlePayoutAction(p.id, "paid")}
                  disabled={processingId === p.id}
                >
                  <CheckCircle size={13} />
                  {processingId === p.id ? "Processing..." : "Mark Paid"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedPayouts.length > 0 && (
        <>
          <p style={styles.sectionLabel}>Payout History</p>
          <div style={styles.list}>
            {resolvedPayouts.map((p) => (
              <div key={p.id} style={{ ...styles.payoutCard, opacity: 0.6 }}>
                <div style={styles.payoutTop}>
                  <div>
                    <p style={styles.payoutTitle}>{p.profiles?.startup_name || "Unknown"}</p>
                    <p style={styles.payoutSub}>${p.amount_usd.toFixed(2)} · {METHOD_LABELS[p.payout_method]}</p>
                  </div>
                  <span style={p.status === "paid" ? styles.paidBadge : styles.rejectedBadge}>
                    {p.status === "paid" ? "Paid" : "Rejected"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={styles.sectionLabel}>Recent Referrals</p>
      <div style={styles.list}>
        {referrals.slice(0, 15).map((r) => (
          <div key={r.id} style={styles.referralRow}>
            <div>
              <p style={styles.referralText}>
                <strong>{r.referrer?.startup_name || "Unknown"}</strong> referred <strong>{r.referred?.startup_name || "Unknown"}</strong>
              </p>
              <p style={styles.payoutMeta}>{timeAgo(r.created_at)}</p>
            </div>
            <span style={styles.referralStatus}>{r.status.replace(/_/g, " ")}</span>
          </div>
        ))}
        {referrals.length === 0 && <p style={styles.emptyText}>No referrals yet.</p>}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "760px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "6px" },
  statValue: { fontSize: "20px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", marginTop: "20px" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  payoutCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: "16px 20px" },
  payoutTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" },
  payoutTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  payoutSub: { fontSize: "12px", color: "#888888", margin: "0" },
  payoutMeta: { fontSize: "11px", color: "#bbbbbb", margin: "2px 0 0 0" },
  amountBadge: { fontSize: "15px", fontWeight: "700", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "4px 12px", borderRadius: "99px", flexShrink: 0 },
  payoutDetails: { backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" },
  detailLabel: { fontSize: "10px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px 0" },
  detailValue: { fontSize: "12px", color: "#333333", margin: "0 0 8px 0" },
  notesInput: { width: "100%", padding: "9px 12px", fontSize: "12px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "50px", resize: "vertical", fontFamily: "inherit", marginBottom: "10px" },
  actionRow: { display: "flex", gap: "8px" },
  rejectBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", flex: 1, padding: "9px", fontSize: "12px", fontWeight: "600", color: "#e53e3e", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer" },
  paidBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", flex: 2, padding: "9px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  paidBadge: { fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "3px 10px", borderRadius: "99px" },
  rejectedBadge: { fontSize: "11px", fontWeight: "600", color: "#e53e3e", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", padding: "3px 10px", borderRadius: "99px" },
  referralRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #f0f0f0", padding: "12px 16px" },
  referralText: { fontSize: "13px", color: "#333333", margin: "0" },
  referralStatus: { fontSize: "11px", fontWeight: "600", color: "#888888", backgroundColor: "#f5f5f5", padding: "3px 10px", borderRadius: "99px", textTransform: "capitalize" },
};