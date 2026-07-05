"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Edit3, Link2, Copy, CheckCheck, ExternalLink, Lock } from "lucide-react";
import HeroBanner from "@/components/dashboard/HeroBanner";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActionsList from "@/components/dashboard/QuickActionsList";
import WaitlistPreview from "@/components/dashboard/WaitlistPreview";

function getInitials(name: string) {
  if (!name) return "X";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function DashboardHomeView() {
  const router = useRouter();
  const { profile, profileLoading, isTeamMember, founderProfile, teamProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;
  const permissions: string[] = teamProfile?.permissions || [];

  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [profileViews, setProfileViews] = useState(0);
  const [dataRoomRequests, setDataRoomRequests] = useState(0);

  useEffect(() => {
    if (!activeProfile) return;

    supabase
      .from("waitlist")
      .select("*", { count: "exact" })
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data, count }) => {
        setWaitlist(data || []);
        setWaitlistCount(count || 0);
      });

    supabase
      .from("profile_views")
      .select("*", { count: "exact" })
      .eq("profile_id", activeProfile.id)
      .then(({ count }) => setProfileViews(count || 0));

    supabase
      .from("data_room_requests")
      .select("*", { count: "exact" })
      .eq("profile_id", activeProfile.id)
      .then(({ count }) => setDataRoomRequests(count || 0));
  }, [activeProfile]);

  const handleCopyLink = () => {
    if (!activeProfile?.slug || !activeProfile.is_live) return;
    navigator.clipboard.writeText(`https://xeero.me/${activeProfile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (profileLoading || !activeProfile) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <HeroBanner startupName={activeProfile.startup_name} />

      <RoadmapCard />

      {/* ── Profile Card ── */}
      <div style={styles.profileCard}>
        <div style={styles.profileCardLeft}>
          <div style={styles.profileAvatar}>
            {activeProfile.logo_url ? (
              <img src={activeProfile.logo_url} alt="logo" style={styles.profileAvatarImg} />
            ) : (
              <span style={styles.profileAvatarText}>{getInitials(activeProfile.startup_name)}</span>
            )}
          </div>
          <div>
            <div style={styles.profileNameRow}>
              <h2 style={styles.profileName}>{activeProfile.startup_name}</h2>
              <span style={{ ...styles.statusBadge, ...(activeProfile.is_live ? styles.statusLive : styles.statusDraft) }}>
                <span style={{ ...styles.statusDot, backgroundColor: activeProfile.is_live ? "#38a169" : "#aaaaaa" }} />
                {activeProfile.is_live ? "Live" : "Draft"}
              </span>
            </div>
            <p style={styles.profileTagline}>{activeProfile.tagline || "No tagline yet"}</p>
          </div>
        </div>
        {!isTeamMember && (
          <button style={styles.editProfileBtn} onClick={() => router.push("/dashboard/edit")}>
            <Edit3 size={13} />Edit
          </button>
        )}
      </div>

      {/* ── Link Row ── */}
      <div style={styles.linkRow}>
        <div style={styles.linkLeft}>
          <Link2 size={13} color={activeProfile.is_live ? "#111111" : "#aaaaaa"} />
          <span style={{ ...styles.linkText, color: activeProfile.is_live ? "#111111" : "#aaaaaa" }}>
            xeero.me/{activeProfile.slug}
          </span>
        </div>
        <div style={styles.linkRight}>
          {activeProfile.is_live ? (
            <>
              <button style={styles.copyBtn} onClick={handleCopyLink}>
                {copied
                  ? <><CheckCheck size={12} color="#38a169" /><span style={{ color: "#38a169" }}>Copied</span></>
                  : <><Copy size={12} />Copy</>
                }
              </button>
              <a href={`https://xeero.me/${activeProfile.slug}`} target="_blank" rel="noopener noreferrer" style={styles.visitBtn}>
                <ExternalLink size={12} />Visit
              </a>
            </>
          ) : !isTeamMember ? (
            <button style={styles.goLiveBtn} onClick={() => router.push("/payment")}>
              <Lock size={12} />Unlock — Go Live
            </button>
          ) : (
            <span style={styles.draftNote}>Not published yet</span>
          )}
        </div>
      </div>

      <DashboardStats
        waitlistCount={waitlistCount}
        profileViews={profileViews}
        dataRoomRequests={dataRoomRequests}
      />

      <QuickActionsList
        isLive={activeProfile.is_live}
        isTeamMember={isTeamMember}
        permissions={permissions}
      />

      <WaitlistPreview
        waitlist={waitlist}
        waitlistCount={waitlistCount}
        isTeamMember={isTeamMember}
      />

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "760px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  profileCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "10px", gap: "12px", flexWrap: "wrap" },
  profileCardLeft: { display: "flex", alignItems: "center", gap: "14px" },
  profileAvatar: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  profileAvatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  profileAvatarText: { fontSize: "16px", fontWeight: "700", color: "#ffffff" },
  profileNameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" },
  profileName: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0" },
  statusBadge: { display: "flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "99px", fontSize: "11px", fontWeight: "600" },
  statusLive: { backgroundColor: "#f0fff4", color: "#38a169", border: "1px solid #c6f6d5" },
  statusDraft: { backgroundColor: "#f5f5f5", color: "#aaaaaa", border: "1px solid #eeeeee" },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%" },
  profileTagline: { fontSize: "12px", color: "#999999", margin: "0" },
  editProfileBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  linkRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff", borderRadius: "10px", padding: "12px 16px", border: "1px solid #f0f0f0", marginBottom: "20px", flexWrap: "wrap", gap: "10px" },
  linkLeft: { display: "flex", alignItems: "center", gap: "8px" },
  linkText: { fontSize: "13px", fontWeight: "500" },
  linkRight: { display: "flex", gap: "8px", alignItems: "center" },
  copyBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "7px", cursor: "pointer" },
  visitBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "7px", textDecoration: "none" },
  goLiveBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "7px", cursor: "pointer" },
  draftNote: { fontSize: "12px", color: "#aaaaaa", fontStyle: "italic" },
};