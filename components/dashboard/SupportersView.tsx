"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { useRouter } from "next/navigation";
import { Heart, Download, Users, Lock } from "lucide-react";

type Supporter = {
  id: string;
  supporter_name: string;
  supporter_email: string;
  amount: number;
  tier: string;
  is_public: boolean;
  created_at: string;
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function exportCSV(supporters: Supporter[], includeEmail: boolean) {
  const headers = includeEmail
    ? ["Name", "Email", "Amount (USD)", "Tier", "Public", "Date"]
    : ["Name", "Amount (USD)", "Tier", "Public", "Date"];
  const rows = supporters.map((s) =>
    includeEmail
      ? [s.supporter_name, s.supporter_email, `$${s.amount}`, s.tier, s.is_public ? "Yes" : "No", new Date(s.created_at).toLocaleDateString()]
      : [s.supporter_name, `$${s.amount}`, s.tier, s.is_public ? "Yes" : "No", new Date(s.created_at).toLocaleDateString()]
  );
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "supporters.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function SupportersView() {
  const { profile, profileLoading, isTeamMember, founderProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;
  const router = useRouter();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    if (!activeProfile) return;

    supabase
      .from("support_applications")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .single()
      .then(({ data }) => setApplication(data));

    supabase
      .from("supporters")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSupporters(data || []);
        setLoading(false);
      });
  }, [activeProfile]);

  if (profileLoading || loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  if (!application || application.status !== "approved") {
    return (
      <div style={styles.page}>
        <div style={styles.guardCard}>
          <div style={styles.guardIcon}>
            <Lock size={24} color="#aaaaaa" />
          </div>
          <h2 style={styles.guardTitle}>Community Support not active</h2>
          <p style={styles.guardText}>
            {!application
              ? "No application for Community Support yet."
              : application.status === "pending"
              ? "The Community Support application is under review."
              : "The Community Support application was not approved at this time."}
          </p>
          {!isTeamMember && (
            <button style={styles.guardBtn} onClick={() => router.push("/dashboard/funding")}>
              {!application ? "Apply Now →" : "View Application →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalRaised = supporters.reduce((sum, s) => sum + Number(s.amount), 0);
  const supporterCount = supporters.length;

  return (
    <div style={styles.page}>

      <div style={styles.heroCard}>
        <div style={styles.heroTop}>
          <div>
            <p style={styles.heroLabel}>Total raised</p>
            <p style={styles.heroAmount}>
              ${totalRaised % 1 === 0 ? totalRaised.toFixed(0) : totalRaised.toFixed(2)}
            </p>
            <p style={styles.heroSub}>from community support</p>
          </div>
          <div style={styles.settleBadge}>
            <span style={styles.settleDot} />
            <span style={styles.settleBadgeText}>Auto-settles T+1</span>
          </div>
        </div>
        <div style={styles.heroDivider} />
        <div style={styles.heroBottom}>
          <div style={styles.heroStat}>
            <Users size={14} color="rgba(255,255,255,0.4)" />
            <span style={styles.heroStatText}>
              {supporterCount} {supporterCount === 1 ? "supporter" : "supporters"}
            </span>
          </div>
          <div style={styles.heroStat}>
            <Heart size={14} color="rgba(255,255,255,0.4)" />
            <span style={styles.heroStatText}>{activeProfile?.startup_name}</span>
          </div>
        </div>
      </div>

      <div style={styles.listSection}>
        <div style={styles.listHeader}>
          <p style={styles.sectionLabel}>
            {supporterCount > 0 ? `${supporterCount} supporter${supporterCount === 1 ? "" : "s"}` : "No supporters yet"}
          </p>
          {supporters.length > 0 && (
            <button style={styles.exportBtn} onClick={() => exportCSV(supporters, !isTeamMember)}>
              <Download size={12} />Export
            </button>
          )}
        </div>

        {supporters.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>
              <Heart size={24} color="#cccccc" />
            </div>
            <h3 style={styles.emptyTitle}>No supporters yet</h3>
            <p style={styles.emptyText}>
              Share the profile link and let people know they can support what's being built.
            </p>
            {!isTeamMember && (
              <button
                style={styles.emptyBtn}
                onClick={() => navigator.clipboard.writeText(`https://xeero.me/${activeProfile?.slug}`)}
              >
                Copy Profile Link
              </button>
            )}
          </div>
        ) : (
          <div style={styles.list}>
            {supporters.map((s) => (
              <div key={s.id} style={styles.supporterRow}>
                <div style={styles.supporterLeft}>
                  <div style={styles.avatar}>
                    <span style={styles.avatarText}>{s.supporter_name[0].toUpperCase()}</span>
                  </div>
                  <div style={styles.supporterInfo}>
                    <div style={styles.supporterNameRow}>
                      <p style={styles.supporterName}>{s.supporter_name}</p>
                      {!s.is_public && <span style={styles.privateBadge}>Private</span>}
                    </div>
                    {!isTeamMember && (
                      <p style={styles.supporterEmail}>{s.supporter_email}</p>
                    )}
                    <p style={styles.supporterMeta}>{s.tier} · {timeAgo(s.created_at)}</p>
                  </div>
                </div>
                <div style={styles.supporterRight}>
                  <p style={styles.supporterAmount}>
                    ${Number(s.amount) % 1 === 0 ? Number(s.amount).toFixed(0) : Number(s.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.settleNote}>
        <p style={styles.settleNoteText}>
          Payments settle automatically to the linked bank account the next business day via Paystack. Xeero retains 8% per transaction.
        </p>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  heroCard: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", borderRadius: "20px", padding: "28px", marginBottom: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  heroTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" },
  heroLabel: { fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.4)", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.08em" },
  heroAmount: { fontSize: "40px", fontWeight: "700", color: "#ffffff", margin: "0 0 4px 0", letterSpacing: "-1px" },
  heroSub: { fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0" },
  settleBadge: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 },
  settleDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#38a169", flexShrink: 0 },
  settleBadgeText: { fontSize: "11px", fontWeight: "500", color: "rgba(255,255,255,0.5)" },
  heroDivider: { height: "1px", backgroundColor: "rgba(255,255,255,0.08)", marginBottom: "16px" },
  heroBottom: { display: "flex", alignItems: "center", gap: "20px" },
  heroStat: { display: "flex", alignItems: "center", gap: "6px" },
  heroStatText: { fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  listSection: { display: "flex", flexDirection: "column", gap: "12px" },
  listHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0" },
  exportBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "11px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "6px", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  supporterRow: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "16px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" },
  supporterLeft: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: "15px", fontWeight: "600", color: "#666666" },
  supporterInfo: { flex: 1 },
  supporterNameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" },
  supporterName: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0" },
  privateBadge: { fontSize: "10px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", padding: "2px 8px", borderRadius: "99px", border: "1px solid #eeeeee" },
  supporterEmail: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  supporterMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  supporterRight: { flexShrink: 0 },
  supporterAmount: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "48px 32px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  emptyText: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 20px 0", maxWidth: "280px" },
  emptyBtn: { padding: "9px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  settleNote: { marginTop: "20px", padding: "14px 16px", backgroundColor: "#f9f9f9", borderRadius: "10px", border: "1px solid #f0f0f0" },
  settleNoteText: { fontSize: "12px", color: "#aaaaaa", margin: "0", lineHeight: "1.6" },
  guardCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: "40px" },
  guardIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  guardTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  guardText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0", maxWidth: "320px", marginLeft: "auto", marginRight: "auto" },
  guardBtn: { padding: "11px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};