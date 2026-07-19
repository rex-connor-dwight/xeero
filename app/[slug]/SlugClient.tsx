"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Users,
  Calendar,
  Lock,
  FileText,
  Send,
  CheckCircle,
  Clock,
  Heart,
} from "lucide-react";
import {
  fetchProfileBySlug,
  getDeckSignedUrl,
  submitWaitlist,
  verifyToken,
  submitDataRoomRequest,
  getInitials,
  getVisibleTabs,
  ALL_TABS,
  type Profile,
  type Tab,
  type DrAccess,
} from "@/lib/data/slugPage";
import CoverPattern from "@/components/slug/CoverPattern";
import { ValidationScoreCard } from "@/components/slug/InfoCard";
import OverviewTab from "@/components/slug/OverviewTab";
import TeamTab from "@/components/slug/TeamTab";
import DeckTab from "@/components/slug/DeckTab";
import DataRoomViewer from "@/components/slug/DataRoomViewer";
import LinksTab from "@/components/slug/LinksTab";
import { hasAnyLinks } from "@/lib/data/slugPage";
import SupportModal from "@/components/slug/SupportModal";


export default function SlugClient({
  slug,
  drToken,
}: {
  slug: string;
  drToken: string | null;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notLive, setNotLive] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [deckSignedUrl, setDeckSignedUrl] = useState<string | null>(null);
  const [drAccess, setDrAccess] = useState<DrAccess>("none");
  const [showValidationCard, setShowValidationCard] = useState(false);

  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  const [drName, setDrName] = useState("");
  const [drEmail, setDrEmail] = useState("");
  const [drNote, setDrNote] = useState("");
  const [drLoading, setDrLoading] = useState(false);
  const [drDone, setDrDone] = useState(false);
  const [drError, setDrError] = useState("");

  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    fetchProfileBySlug(slug).then(async (data) => {
      if (!data) { setNotFound(true); setLoading(false); return; }
      if (!data.is_live) { setNotLive(true); setLoading(false); return; }
      setProfile(data);
      const visible = getVisibleTabs(data);
      if (visible.length > 0) setActiveTab(visible[0]);
      if (data.deck_url) {
        const url = await getDeckSignedUrl(data.deck_url);
        setDeckSignedUrl(url);
      }
      setLoading(false);
      if (drToken) {
        setDrAccess("loading");
        const access = await verifyToken(drToken, data.id);
        setDrAccess(access);
        if (access === "granted" || access === "expired") setActiveTab("dataroom");
      }
    });
  }, [slug, drToken]);

  const handleWaitlistSubmit = async () => {
    if (!waitlistEmail || !profile) return;
    setWaitlistLoading(true);
    setWaitlistError("");
    const error = await submitWaitlist(profile.id, waitlistEmail, waitlistName);
    if (error) setWaitlistError("Something went wrong. Please try again.");
    else setWaitlistDone(true);
    setWaitlistLoading(false);
  };

  const handleDataRoomSubmit = async () => {
    if (!drName || !drEmail || !profile) return;
    setDrLoading(true);
    setDrError("");
    const error = await submitDataRoomRequest(profile.id, drName, drEmail, drNote);
    if (error) { setDrError("Something went wrong. Please try again."); setDrLoading(false); return; }
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-founder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          profile_id: profile.id,
          investor_name: drName,
          investor_email: drEmail,
          note: drNote,
        }),
      }
    ).catch(() => {});
    setDrDone(true);
    setDrLoading(false);
  };

  if (loading) return <div style={styles.centeredPage}><div style={styles.loadingDot} /></div>;

  if (notFound) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.notFoundCard}>
          <div style={styles.notFoundIcon}><FileText size={28} color="#cccccc" /></div>
          <h1 style={styles.notFoundTitle}>Page not found</h1>
          <p style={styles.notFoundText}>This startup profile doesn't exist or the link may be incorrect.</p>
          <a href="https://xeero.me" style={styles.notFoundLink}>Build your own profile on Xeero →</a>
        </div>
      </div>
    );
  }

  if (notLive) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.notFoundCard}>
          <div style={styles.notFoundIcon}><Lock size={28} color="#cccccc" /></div>
          <h1 style={styles.notFoundTitle}>This page isn't live yet</h1>
          <p style={styles.notFoundText}>The founder is still setting up their profile. Check back soon.</p>
          <a href="https://xeero.me" style={styles.notFoundLink}>Build your own profile on Xeero →</a>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const visibleKeys = getVisibleTabs(profile);
  const tabs = ALL_TABS.filter((t) => visibleKeys.includes(t.key));

  const validationBg = profile.validation_score
    ? profile.validation_score >= 70 ? "#f0fff4" : profile.validation_score >= 40 ? "#fffbeb" : "#fff5f5"
    : "#f0fff4";
  const validationBorder = profile.validation_score
    ? profile.validation_score >= 70 ? "#c6f6d5" : profile.validation_score >= 40 ? "#fef08a" : "#fed7d7"
    : "#c6f6d5";
  const validationColor = profile.validation_score
    ? profile.validation_score >= 70 ? "#38a169" : profile.validation_score >= 40 ? "#d69e2e" : "#e53e3e"
    : "#38a169";

  return (
    <div style={styles.page}>

      <div style={styles.coverWrapper}>
        <div style={styles.cover}><CoverPattern /></div>
        <div style={styles.profileHeader}>
          <div style={styles.logoCircle}>
            {profile.logo_url
              ? <img src={profile.logo_url} alt="logo" style={styles.logoImg} />
              : <span style={styles.logoInitials}>{getInitials(profile.startup_name)}</span>
            }
          </div>
          <div style={styles.headerBody}>
            <div style={styles.headerTop}>
              <div style={styles.headerLeft}>
                <h1 style={styles.startupName}>{profile.startup_name}</h1>
                <p style={styles.tagline}>{profile.tagline}</p>
                <p style={styles.slugText}>xeero.me/{profile.slug}</p>
              </div>
              <div style={styles.headerRight}>
                <button style={styles.waitlistBtn} onClick={() => setShowWaitlist(!showWaitlist)}>
                  Join Waitlist
                </button>
              </div>
            </div>

            {showWaitlist && (
              <div style={styles.waitlistBox}>
                {waitlistDone ? (
                  <div style={styles.waitlistSuccess}>
                    <p style={styles.waitlistSuccessText}>You're on the waitlist! We'll be in touch.</p>
                  </div>
                ) : (
                  <>
                    <div style={styles.waitlistRow}>
                      <input style={styles.waitlistInput} type="text" placeholder="Your name" value={waitlistName} onChange={(e) => setWaitlistName(e.target.value)} />
                      <input style={styles.waitlistInput} type="email" placeholder="Your email" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} />
                      <button style={styles.waitlistSubmitBtn} onClick={handleWaitlistSubmit} disabled={waitlistLoading}>
                        <Send size={13} />{waitlistLoading ? "..." : "Join"}
                      </button>
                    </div>
                    {waitlistError && <p style={styles.errorText}>{waitlistError}</p>}
                  </>
                )}
              </div>
            )}

            <div style={styles.pills}>
              {profile.stage && <span style={styles.pill}>{profile.stage}</span>}
              {profile.industry && <span style={styles.pill}>{profile.industry}</span>}
              {profile.location && (
                <span style={styles.pill}>
                  <MapPin size={11} style={{ marginRight: 4 }} />{profile.location}
                </span>
              )}
              {profile.year_founded && (
                <span style={styles.pill}>
                  <Calendar size={11} style={{ marginRight: 4 }} />Est. {profile.year_founded}
                </span>
              )}
              {profile.team_size && (
                <span style={styles.pill}>
                  <Users size={11} style={{ marginRight: 4 }} />{profile.team_size} people
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" style={styles.pillLink}>
                  <Globe size={11} style={{ marginRight: 4 }} />Website
                </a>
              )}
              {profile.validation_score && (
                <button
                  style={{
                    ...styles.validationPill,
                    backgroundColor: validationBg,
                    border: `1px solid ${validationBorder}`,
                    color: validationColor,
                  }}
                  onClick={() => setShowValidationCard(!showValidationCard)}
                >
                  Validated {profile.validation_score}/100
                </button>
              )}
            </div>

            {showValidationCard && profile.validation_score && (
              <ValidationScoreCard score={profile.validation_score} band={profile.validation_band} />
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
              {tab.key === "dataroom" && <Lock size={11} style={{ marginRight: 5 }} />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tabContent}>

        {activeTab === "overview" && <OverviewTab profile={profile} />}

        {activeTab === "team" && <TeamTab profile={profile} />}

        {activeTab === "deck" && <DeckTab deckSignedUrl={deckSignedUrl} />}

        {activeTab === "links" && <LinksTab profile={profile} />}

        {activeTab === "dataroom" && (
          <>
            {drAccess === "loading" && (
              <div style={styles.drStateCard}>
                <div style={styles.loadingDot} />
                <p style={styles.drStateText}>Verifying access...</p>
              </div>
            )}
            {drAccess === "expired" && (
              <div style={styles.drStateCard}>
                <div style={styles.drStateIcon}><Clock size={24} color="#e53e3e" /></div>
                <h3 style={styles.drStateTitle}>This link has expired</h3>
                <p style={styles.drStateText}>Your 24-hour access link has expired. Contact the founder to request a new one.</p>
              </div>
            )}
            {drAccess === "granted" && (
              <DataRoomViewer profileId={profile.id} startupName={profile.startup_name} />
            )}
            {drAccess === "none" && (
              <div style={styles.dataRoomCard}>
                <div style={styles.lockIconWrapper}><Lock size={24} color="#aaaaaa" /></div>
                <h3 style={styles.dataRoomTitle}>Data Room</h3>
                <p style={styles.dataRoomText}>
                  This startup's data room is private. Request access below and the founder will review your request.
                </p>
                {drDone ? (
                  <div style={styles.drSuccessBox}>
                    <p style={styles.drSuccessText}>Request sent. The founder will review and get back to you via email.</p>
                  </div>
                ) : (
                  <div style={styles.drForm}>
                    <input style={styles.drInput} type="text" placeholder="Your name" value={drName} onChange={(e) => setDrName(e.target.value)} />
                    <input style={styles.drInput} type="email" placeholder="Your email" value={drEmail} onChange={(e) => setDrEmail(e.target.value)} />
                    <textarea style={styles.drTextarea} placeholder="A brief note — who are you and why are you interested? (optional)" value={drNote} onChange={(e) => setDrNote(e.target.value)} />
                    {drError && <p style={styles.errorText}>{drError}</p>}
                    <button
                      style={{ ...styles.drSubmitBtn, opacity: drName && drEmail ? 1 : 0.5 }}
                      onClick={handleDataRoomSubmit}
                      disabled={drLoading || !drName || !drEmail}
                    >
                      <Send size={13} />
                      {drLoading ? "Sending..." : "Request Access"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Powered by{" "}
          <a href="https://xeero.me" style={styles.footerLink}>Xeero</a>
          {" "}· Build your startup profile for free
        </p>
      </div>

      {profile.subaccount_code && (
        <>
          <button style={styles.fab} onClick={() => setShowSupport(true)}>
            <Heart size={16} color="#ffffff" />
            <span style={styles.fabText}>Support this founder</span>
          </button>

          {showSupport && (
            <SupportModal
              startupName={profile.startup_name}
              profileId={profile.id}
              onClose={() => setShowSupport(false)}
            />
          )}
        </>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  centeredPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", padding: "24px" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  notFoundCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", maxWidth: "400px", width: "100%", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  notFoundIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  notFoundTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  notFoundText: { fontSize: "14px", color: "#888888", lineHeight: "1.6", margin: "0 0 24px 0" },
  notFoundLink: { fontSize: "13px", color: "#111111", fontWeight: "600", textDecoration: "underline" },
  coverWrapper: { position: "relative" },
  cover: { width: "100%", height: "200px", background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", position: "relative", overflow: "hidden", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" },
  profileHeader: { backgroundColor: "#f5f5f5", padding: "0 32px 24px 32px", maxWidth: "800px", margin: "0 auto" },
  logoCircle: { width: "80px", height: "80px", borderRadius: "20px", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "-40px", marginBottom: "16px", border: "3px solid #f5f5f5", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", overflow: "hidden", flexShrink: 0, position: "relative", zIndex: 10 },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoInitials: { fontSize: "24px", fontWeight: "700", color: "#ffffff" },
  headerBody: { display: "flex", flexDirection: "column", gap: "14px" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" },
  headerLeft: { flex: 1 },
  headerRight: { flexShrink: 0 },
  startupName: { fontSize: "24px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  tagline: { fontSize: "14px", color: "#666666", margin: "0 0 4px 0", lineHeight: "1.5" },
  slugText: { fontSize: "12px", color: "#bbbbbb", margin: "0" },
  waitlistBtn: { padding: "8px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  waitlistBox: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #f0f0f0" },
  waitlistRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  waitlistInput: { flex: 1, minWidth: "140px", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa" },
  waitlistSubmitBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "10px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  waitlistSuccess: { textAlign: "center", padding: "8px" },
  waitlistSuccessText: { fontSize: "13px", color: "#38a169", fontWeight: "500", margin: "0" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "6px 0 0 0" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
  pill: { padding: "5px 12px", backgroundColor: "#ffffff", borderRadius: "99px", fontSize: "12px", color: "#555555", fontWeight: "500", border: "1px solid #eeeeee", display: "flex", alignItems: "center" },
  pillLink: { padding: "5px 12px", backgroundColor: "#ffffff", borderRadius: "99px", fontSize: "12px", color: "#555555", fontWeight: "500", border: "1px solid #eeeeee", textDecoration: "none", display: "flex", alignItems: "center" },
  validationPill: { padding: "5px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", cursor: "pointer" },
  tabsWrapper: { backgroundColor: "#f5f5f5", position: "sticky", top: 0, zIndex: 90, overflowX: "auto" },
  tabs: { display: "flex", gap: "6px", maxWidth: "800px", margin: "0 auto", padding: "12px 24px" },
  tab: { padding: "7px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", transition: "all 0.15s ease" },
  tabActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111", fontWeight: "600" },
  tabContent: { maxWidth: "800px", margin: "0 auto", padding: "8px 24px 40px 24px" },
  drStateCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "48px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", maxWidth: "480px", margin: "0 auto" },
  drStateIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  drStateTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0" },
  drStateText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0" },
  dataRoomCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "36px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "480px", margin: "0 auto" },
  lockIconWrapper: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  dataRoomTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0", textAlign: "center" },
  dataRoomText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", textAlign: "center", margin: "0 0 24px 0", maxWidth: "320px" },
  drForm: { width: "100%", display: "flex", flexDirection: "column", gap: "10px" },
  drInput: { width: "100%", padding: "11px 14px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box" },
  drTextarea: { width: "100%", padding: "11px 14px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "80px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  drSubmitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", transition: "opacity 0.2s ease" },
  drSuccessBox: { backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "10px", padding: "16px", width: "100%", textAlign: "center" },
  drSuccessText: { fontSize: "13px", color: "#38a169", fontWeight: "500", margin: "0" },
  footer: { textAlign: "center", padding: "32px 24px", borderTop: "1px solid #f0f0f0", marginTop: "16px" },
  footerText: { fontSize: "12px", color: "#cccccc", margin: "0" },
  footerLink: { color: "#111111", fontWeight: "600", textDecoration: "none" },
  fab: { position: "fixed", bottom: "80px", right: "24px", zIndex: 200, display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: "#38a169", border: "none", borderRadius: "99px", cursor: "pointer", boxShadow: "0 4px 20px rgba(56,161,105,0.4)" },
  fabText: { fontSize: "13px", fontWeight: "600", color: "#ffffff" },
};