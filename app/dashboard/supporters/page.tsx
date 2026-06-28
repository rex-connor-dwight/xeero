"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { useRouter } from "next/navigation";
import {
  Heart,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  Lock,
} from "lucide-react";

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

function exportCSV(supporters: Supporter[]) {
  const headers = ["Name", "Email", "Amount (USD)", "Tier", "Public", "Date"];
  const rows = supporters.map((s) => [
    s.supporter_name,
    s.supporter_email,
    `$${s.amount}`,
    s.tier,
    s.is_public ? "Yes" : "No",
    new Date(s.created_at).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "supporters.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function SupportersPage() {
  const { profile, profileLoading } = useXeero();
  const router = useRouter();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;

    // Fetch support application status
    supabase
      .from("support_applications")
      .select("*")
      .eq("profile_id", profile.id)
      .single()
      .then(({ data }) => setApplication(data));

    // Fetch supporters
    supabase
      .from("supporters")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSupporters(data || []);
        setLoading(false);
      });
  }, [profile]);

  if (profileLoading || loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  // Not approved yet
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
              ? "You haven't applied for Community Support yet. Apply from the Funding page to start receiving support from your visitors."
              : application.status === "pending"
              ? "Your Community Support application is under review. We will get back to you within 2 to 3 business days."
              : "Your Community Support application was not approved at this time."}
          </p>
          <button
            style={styles.guardBtn}
            onClick={() => router.push("/dashboard/funding")}
          >
            {!application ? "Apply Now →" : "View Application →"}
          </button>
        </div>
      </div>
    );
  }

  const totalRaised = supporters.reduce((sum, s) => sum + s.amount, 0);
  const uniqueSupporters = supporters.length;
  const avgAmount = uniqueSupporters > 0 ? (totalRaised / uniqueSupporters).toFixed(0) : 0;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Heart size={18} color="#111111" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Supporters</h1>
            <p style={styles.headerSub}>
              People who believe in what you're building
            </p>
          </div>
        </div>
        {supporters.length > 0 && (
          <button
            style={styles.exportBtn}
            onClick={() => exportCSV(supporters)}
          >
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <DollarSign size={16} color="#111111" />
          </div>
          <p style={styles.statValue}>${totalRaised}</p>
          <p style={styles.statLabel}>Total raised</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <Users size={16} color="#111111" />
          </div>
          <p style={styles.statValue}>{uniqueSupporters}</p>
          <p style={styles.statLabel}>Supporters</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <TrendingUp size={16} color="#111111" />
          </div>
          <p style={styles.statValue}>${avgAmount}</p>
          <p style={styles.statLabel}>Avg. support</p>
        </div>
      </div>

      {/* Supporters list */}
      {supporters.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>
            <Heart size={24} color="#cccccc" />
          </div>
          <h3 style={styles.emptyTitle}>No supporters yet</h3>
          <p style={styles.emptyText}>
            Share your profile link and let people know they can support what you're building.
          </p>
          <button
            style={styles.emptyBtn}
            onClick={() => {
              navigator.clipboard.writeText(`https://xeero.me/${profile?.slug}`);
            }}
          >
            Copy Profile Link
          </button>
        </div>
      ) : (
        <div style={styles.listWrapper}>
          <p style={styles.sectionLabel}>All Supporters</p>
          <div style={styles.list}>
            {supporters.map((s) => (
              <div key={s.id} style={styles.supporterRow}>
                <div style={styles.supporterLeft}>
                  <div style={styles.avatar}>
                    <span style={styles.avatarText}>
                      {s.supporter_name[0].toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.supporterInfo}>
                    <div style={styles.supporterNameRow}>
                      <p style={styles.supporterName}>{s.supporter_name}</p>
                      {!s.is_public && (
                        <span style={styles.privateBadge}>Anonymous</span>
                      )}
                    </div>
                    <p style={styles.supporterEmail}>{s.supporter_email}</p>
                    <p style={styles.supporterMeta}>
                      {s.tier} · {timeAgo(s.created_at)}
                    </p>
                  </div>
                </div>
                <div style={styles.supporterRight}>
                  <p style={styles.supporterAmount}>${s.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  exportBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px" },
  statIcon: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: "24px", fontWeight: "700", color: "#111111", margin: "0" },
  statLabel: { fontSize: "12px", color: "#aaaaaa", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  listWrapper: { display: "flex", flexDirection: "column" },
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
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  emptyText: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 20px 0", maxWidth: "280px" },
  emptyBtn: { padding: "9px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  guardCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: "40px" },
  guardIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  guardTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  guardText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0", maxWidth: "320px", marginLeft: "auto", marginRight: "auto" },
  guardBtn: { padding: "11px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};