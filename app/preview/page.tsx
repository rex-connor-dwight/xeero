"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Globe, MapPin, Users, Calendar, FolderLock, ArrowLeft } from "lucide-react";
import { getDeckSignedUrl, getInitials, type Profile } from "@/lib/data/slugPage";
import CoverPattern from "@/components/slug/CoverPattern";
import { ValidationScoreCard } from "@/components/slug/InfoCard";
import OverviewTab from "@/components/slug/OverviewTab";
import TeamTab from "@/components/slug/TeamTab";
import DeckTab from "@/components/slug/DeckTab";
import LinksTab from "@/components/slug/LinksTab";
import { getVisibleTabs, ALL_TABS, type Tab } from "@/lib/data/slugPage";


export default function PreviewPage() {
  const router = useRouter();
  const { profile, profileLoading, isTeamMember, founderProfile } = useXeero();
  const activeProfile = (isTeamMember ? founderProfile : profile) as Profile | null;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [deckSignedUrl, setDeckSignedUrl] = useState<string | null>(null);
  const [showValidationCard, setShowValidationCard] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;
    const visible = getVisibleTabs(activeProfile);
    if (visible.length > 0 && !visible.includes(activeTab)) {
      setActiveTab(visible[0]);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (!activeProfile?.deck_url) return;
    getDeckSignedUrl(activeProfile.deck_url).then(setDeckSignedUrl);
  }, [activeProfile]);

  if (profileLoading) {
    return <div style={styles.centeredPage}><div style={styles.loadingDot} /></div>;
  }

  if (!activeProfile) return null;

  const visibleKeys = getVisibleTabs(activeProfile);
  const tabs = ALL_TABS.filter((t) => visibleKeys.includes(t.key));

  const validationBg = activeProfile.validation_score
    ? activeProfile.validation_score >= 70 ? "#f0fff4" : activeProfile.validation_score >= 40 ? "#fffbeb" : "#fff5f5"
    : "#f0fff4";
  const validationBorder = activeProfile.validation_score
    ? activeProfile.validation_score >= 70 ? "#c6f6d5" : activeProfile.validation_score >= 40 ? "#fef08a" : "#fed7d7"
    : "#c6f6d5";
  const validationColor = activeProfile.validation_score
    ? activeProfile.validation_score >= 70 ? "#38a169" : activeProfile.validation_score >= 40 ? "#d69e2e" : "#e53e3e"
    : "#38a169";

  return (
    <div style={styles.page}>

      {/* Preview stripe */}
      <div style={styles.previewStripe}>
        <button style={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={14} />
          Back to Edit
        </button>
        <span style={styles.previewLabel}>Preview Mode — Only you can see this</span>
      </div>

      <div style={styles.coverWrapper}>
        <div style={styles.cover}><CoverPattern /></div>
        <div style={styles.profileHeader}>
          <div style={styles.logoCircle}>
            {activeProfile.logo_url
              ? <img src={activeProfile.logo_url} alt="logo" style={styles.logoImg} />
              : <span style={styles.logoInitials}>{getInitials(activeProfile.startup_name)}</span>
            }
          </div>
          <div style={styles.headerBody}>
            <h1 style={styles.startupName}>{activeProfile.startup_name}</h1>
            <p style={styles.tagline}>{activeProfile.tagline}</p>
            <p style={styles.slugText}>xeero.me/{activeProfile.slug}</p>

            <div style={styles.pills}>
              {activeProfile.stage && <span style={styles.pill}>{activeProfile.stage}</span>}
              {activeProfile.industry && <span style={styles.pill}>{activeProfile.industry}</span>}
              {activeProfile.location && (
                <span style={styles.pill}>
                  <MapPin size={11} style={{ marginRight: 4 }} />{activeProfile.location}
                </span>
              )}
              {activeProfile.year_founded && (
                <span style={styles.pill}>
                  <Calendar size={11} style={{ marginRight: 4 }} />Est. {activeProfile.year_founded}
                </span>
              )}
              {activeProfile.team_size && (
                <span style={styles.pill}>
                  <Users size={11} style={{ marginRight: 4 }} />{activeProfile.team_size} people
                </span>
              )}
              {activeProfile.website && (
                <span style={styles.pill}>
                  <Globe size={11} style={{ marginRight: 4 }} />Website
                </span>
              )}
              {activeProfile.validation_score && (
                <button
                  style={{
                    ...styles.validationPill,
                    backgroundColor: validationBg,
                    border: `1px solid ${validationBorder}`,
                    color: validationColor,
                  }}
                  onClick={() => setShowValidationCard(!showValidationCard)}
                >
                  Validated {activeProfile.validation_score}/100
                </button>
              )}
            </div>

            {showValidationCard && activeProfile.validation_score && (
              <ValidationScoreCard score={activeProfile.validation_score} band={activeProfile.validation_band} />
            )}
          </div>
        </div>
      </div>

      <div style={styles.tabsWrapper}>
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tabContent} key={`${activeTab}-${(activeProfile.visible_tabs || []).join(",")}`}>
        {activeTab === "overview" && <OverviewTab profile={activeProfile} />}
        {activeTab === "team" && <TeamTab profile={activeProfile} />}

        {activeTab === "deck" && (
          <DeckTab
            deckSignedUrl={deckSignedUrl}
            emptyCta={{ label: "Set Up Deck", onClick: () => router.push("/dashboard/edit") }}
          />
        )}

        {activeTab === "links" && <LinksTab profile={activeProfile} />}

        {activeTab === "dataroom" && (
          <div style={styles.dataRoomEmptyCard}>
            <div style={styles.dataRoomEmptyIcon}>
              <FolderLock size={28} color="#cccccc" />
            </div>
            <h3 style={styles.dataRoomEmptyTitle}>Data Room not set up</h3>
            <p style={styles.dataRoomEmptyText}>
              Upload key documents so investors can request access once you're live.
            </p>
            <button style={styles.dataRoomEmptyCtaBtn} onClick={() => router.push("/dashboard/dataroom")}>
              Set Up Data Room
            </button>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Powered by <span style={styles.footerLink}>Xeero</span>
        </p>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  centeredPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  previewStripe: { backgroundColor: "#38a169", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 300, flexWrap: "wrap", gap: "8px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "rgba(255,255,255,0.15)", border: "none", borderRadius: "6px", cursor: "pointer" },
  previewLabel: { fontSize: "12px", fontWeight: "600", color: "#ffffff" },
  coverWrapper: { position: "relative" },
  cover: { width: "100%", height: "200px", background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", position: "relative", overflow: "hidden", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" },
  profileHeader: { backgroundColor: "#f5f5f5", padding: "0 32px 24px 32px", maxWidth: "800px", margin: "0 auto" },
  logoCircle: { width: "80px", height: "80px", borderRadius: "20px", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "-40px", marginBottom: "16px", border: "3px solid #f5f5f5", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 10 },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoInitials: { fontSize: "24px", fontWeight: "700", color: "#ffffff" },
  headerBody: { display: "flex", flexDirection: "column", gap: "14px" },
  startupName: { fontSize: "24px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  tagline: { fontSize: "14px", color: "#666666", margin: "0 0 4px 0", lineHeight: "1.5" },
  slugText: { fontSize: "12px", color: "#bbbbbb", margin: "0" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
  pill: { padding: "5px 12px", backgroundColor: "#ffffff", borderRadius: "99px", fontSize: "12px", color: "#555555", fontWeight: "500", border: "1px solid #eeeeee", display: "flex", alignItems: "center" },
  validationPill: { padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", cursor: "pointer" },
  tabsWrapper: { backgroundColor: "#f5f5f5", position: "sticky", top: "38px", zIndex: 90, overflowX: "auto" },
  tabs: { display: "flex", gap: "6px", maxWidth: "800px", margin: "0 auto", padding: "12px 24px" },
  tab: { padding: "7px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", transition: "all 0.15s ease" },
  tabActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111", fontWeight: "600" },
  tabContent: { maxWidth: "800px", margin: "0 auto", padding: "8px 24px 40px 24px" },
  dataRoomEmptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  dataRoomEmptyIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  dataRoomEmptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  dataRoomEmptyText: { fontSize: "13px", color: "#999999", margin: "0 0 20px 0", lineHeight: "1.6", maxWidth: "280px" },
  dataRoomEmptyCtaBtn: { padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  footer: { textAlign: "center", padding: "32px 24px", borderTop: "1px solid #f0f0f0", marginTop: "16px" },
  footerText: { fontSize: "12px", color: "#cccccc", margin: "0" },
  footerLink: { color: "#111111", fontWeight: "600" },
};