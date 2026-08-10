"use client";

import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Rocket, ArrowLeft, Lock } from "lucide-react";
import InvestorNetworkCard from "@/components/dashboard/funding/InvestorNetworkCard";
import CommunitySupportCard from "@/components/dashboard/funding/CommunitySupportCard";
import PordwareFundCard from "@/components/dashboard/funding/PordwareFundCard";

export default function FundingView() {
  const router = useRouter();
  const { profile, profileLoading, isTeamMember, founderProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  if (profileLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  if (!activeProfile?.is_live) {
    return (
      <div style={styles.page}>
        <div style={styles.guardCard}>
          <div style={styles.guardIcon}><Lock size={24} color="#aaaaaa" /></div>
          <h2 style={styles.guardTitle}>Publish your profile first</h2>
          <p style={styles.guardText}>Your profile needs to be live before you can apply for funding.</p>
          {!isTeamMember && (
            <button style={styles.guardBtn} onClick={() => router.push("/payment")}>
              Publish Profile →
            </button>
          )}
          <button style={styles.backLink} onClick={() => router.push(isTeamMember ? "/team-dashboard" : "/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => router.push(isTeamMember ? "/team-dashboard" : "/dashboard")}>
        <ArrowLeft size={14} />Dashboard
      </button>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Rocket size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Funding</h1>
          <p style={styles.headerSub}>xeero.me/{activeProfile.slug}</p>
        </div>
      </div>

      <div style={styles.stack}>
        <InvestorNetworkCard />
        <PordwareFundCard />
        {!isTeamMember && <CommunitySupportCard activeProfile={activeProfile} />}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "600px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", padding: "0" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  stack: { display: "flex", flexDirection: "column", gap: "14px" },
  guardCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: "40px" },
  guardIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  guardTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  guardText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0" },
  guardBtn: { padding: "11px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "12px", display: "block", width: "100%" },
  backLink: { fontSize: "13px", color: "#aaaaaa", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" },
};