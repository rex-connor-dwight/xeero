"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  Users,
  Eye,
  Link2,
  Edit3,
  FileText,
  Lock,
  Copy,
  CheckCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Lightbulb,
} from "lucide-react";

type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

function getInitials(name: string) {
  if (!name) return "X";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const bannerMessages = [
  "Founders who complete their Xeero profile get 3x more investor reach.",
  "Your waitlist is your first proof of demand. Keep sharing.",
  "40% of funded startups started with a validated idea. Have you validated yours?",
  "Investors decide in 60 seconds. Make your profile count.",
];

function HeroBanner({ startupName }: { startupName: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % bannerMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={bannerStyles.banner}>
      <svg style={bannerStyles.svg} viewBox="0 0 800 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="160" x2="800" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
        <line x1="0" y1="120" x2="800" y2="40" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
        <line x1="0" y1="80" x2="800" y2="80" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
        <line x1="200" y1="0" x2="600" y2="160" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
        <line x1="400" y1="0" x2="400" y2="160" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
        <circle cx="700" cy="80" r="60" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
        <circle cx="700" cy="80" r="100" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
        <circle cx="100" cy="140" r="80" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
      </svg>
      <div style={bannerStyles.content}>
        <div style={bannerStyles.greeting}>
          Welcome back — <strong>{startupName}</strong>
        </div>
        <p style={bannerStyles.message}>{bannerMessages[msgIndex]}</p>
        <div style={bannerStyles.dots}>
          {bannerMessages.map((_, i) => (
            <div key={i} style={{
              ...bannerStyles.dot,
              backgroundColor: i === msgIndex ? "#ffffff" : "rgba(255,255,255,0.25)",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

type BannerStyles = { [key: string]: React.CSSProperties };
const bannerStyles: BannerStyles = {
  banner: {
    background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)",
    borderRadius: "16px",
    padding: "28px 32px",
    position: "relative",
    overflow: "hidden",
    marginBottom: "20px",
  },
  svg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
  content: { position: "relative", zIndex: 1 },
  greeting: { fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  message: { fontSize: "18px", fontWeight: "600", color: "#ffffff", lineHeight: "1.5", maxWidth: "480px", margin: "0 0 16px 0" },
  dots: { display: "flex", gap: "6px" },
  dot: { width: "5px", height: "5px", borderRadius: "50%", transition: "background-color 0.3s ease" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { profile, profileLoading } = useXeero();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [profileViews, setProfileViews] = useState(0);
  const [dataRoomRequests, setDataRoomRequests] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!profile) return;

    supabase
      .from("waitlist")
      .select("*", { count: "exact" })
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data, count }) => {
        setWaitlist(data || []);
        setWaitlistCount(count || 0);
      });

    supabase
      .from("profile_views")
      .select("*", { count: "exact" })
      .eq("profile_id", profile.id)
      .then(({ count }) => setProfileViews(count || 0));

    supabase
      .from("data_room_requests")
      .select("*", { count: "exact" })
      .eq("profile_id", profile.id)
      .then(({ count }) => setDataRoomRequests(count || 0));
  }, [profile]);

  const handleCopyLink = () => {
    if (!profile?.slug || !profile.is_live) return;
    navigator.clipboard.writeText(`https://xeero.me/${profile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (profileLoading && !profile) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={styles.page}>

      <HeroBanner startupName={profile.startup_name} />

      {/* ── Profile Card ── */}
      <div style={styles.profileCard}>
        <div style={styles.profileCardLeft}>
          <div style={styles.profileAvatar}>
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="logo" style={styles.profileAvatarImg} />
            ) : (
              <span style={styles.profileAvatarText}>{getInitials(profile.startup_name)}</span>
            )}
          </div>
          <div>
            <div style={styles.profileNameRow}>
              <h2 style={styles.profileName}>{profile.startup_name}</h2>
              <span style={{ ...styles.statusBadge, ...(profile.is_live ? styles.statusLive : styles.statusDraft) }}>
                <span style={{ ...styles.statusDot, backgroundColor: profile.is_live ? "#38a169" : "#aaaaaa" }} />
                {profile.is_live ? "Live" : "Draft"}
              </span>
            </div>
            <p style={styles.profileTagline}>{profile.tagline || "No tagline yet"}</p>
          </div>
        </div>
        <button style={styles.editProfileBtn} onClick={() => router.push("/dashboard/edit")}>
          <Edit3 size={13} />Edit
        </button>
      </div>

      {/* ── Link Row ── */}
      <div style={styles.linkRow}>
        <div style={styles.linkLeft}>
          <Link2 size={13} color={profile.is_live ? "#111111" : "#aaaaaa"} />
          <span style={{ ...styles.linkText, color: profile.is_live ? "#111111" : "#aaaaaa" }}>
            xeero.me/{profile.slug}
          </span>
        </div>
        <div style={styles.linkRight}>
          {profile.is_live ? (
            <>
              <button style={styles.copyBtn} onClick={handleCopyLink}>
                {copied
                  ? <><CheckCheck size={12} color="#38a169" /><span style={{ color: "#38a169" }}>Copied</span></>
                  : <><Copy size={12} />Copy</>
                }
              </button>
              <a href={`https://xeero.me/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={styles.visitBtn}>
                <ExternalLink size={12} />Visit
              </a>
            </>
          ) : (
            <button style={styles.goLiveBtn} onClick={() => router.push("/payment")}>
              <Lock size={12} />Unlock — Go Live
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{
        ...styles.statsRow,
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      }}>
        {[
          { icon: <Users size={15} color="#111111" />, label: "Waitlist", value: waitlistCount, sub: "Total signups" },
          { icon: <Eye size={15} color="#111111" />, label: "Views", value: profileViews, sub: "Profile views" },
          { icon: <TrendingUp size={15} color="#111111" />, label: "Data Room", value: dataRoomRequests, sub: "Requests received" },
        ].map((stat) => (
          <div key={stat.label} style={isMobile ? styles.statCardMobile : styles.statCard}>
            {isMobile ? (
              // Mobile — inline horizontal layout
              <div style={styles.statCardMobileInner}>
                <div style={styles.statIconBox}>{stat.icon}</div>
                <div style={styles.statMobileInfo}>
                  <span style={styles.statLabel}>{stat.label}</span>
                  <span style={styles.statSub}>{stat.sub}</span>
                </div>
                <span style={styles.statValueMobile}>{stat.value}</span>
              </div>
            ) : (
              // Desktop — vertical layout
              <>
                <div style={styles.statTop}>
                  <div style={styles.statIconBox}>{stat.icon}</div>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statSub}>{stat.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <p style={styles.sectionLabel}>Quick Actions</p>
      <div style={styles.actionsCard}>
        <button style={styles.actionRow} onClick={() => router.push("/preview")}>
          <div style={styles.actionLeft}>
            <div style={styles.actionIcon}><Eye size={16} color="#111111" /></div>
            <div>
              <p style={styles.actionTitle}>View Preview</p>
              <p style={styles.actionSub}>See your public profile</p>
            </div>
          </div>
          <ArrowRight size={14} color="#cccccc" />
        </button>
        <div style={styles.actionDivider} />
        <button style={styles.actionRow} onClick={() => router.push("/dashboard/edit")}>
          <div style={styles.actionLeft}>
            <div style={styles.actionIcon}><FileText size={16} color="#111111" /></div>
            <div>
              <p style={styles.actionTitle}>Pitch Deck</p>
              <p style={styles.actionSub}>Upload or manage your deck</p>
            </div>
          </div>
          <ArrowRight size={14} color="#cccccc" />
        </button>
        <div style={styles.actionDivider} />
        <button style={styles.actionRow} onClick={() => router.push("/dashboard/validate")}>
          <div style={styles.actionLeft}>
            <div style={styles.actionIcon}><Lightbulb size={16} color="#111111" /></div>
            <div>
              <p style={styles.actionTitle}>Validate My Idea</p>
              <p style={styles.actionSub}>Run a quick validation check</p>
            </div>
          </div>
          <ArrowRight size={14} color="#cccccc" />
        </button>
        <div style={styles.actionDivider} />
        <button
          style={styles.actionRow}
          onClick={() => {
            if (!profile.is_live) { alert("Publish your profile first to apply for funding."); return; }
            router.push("/dashboard/funding");
          }}
        >
          <div style={styles.actionLeft}>
            <div style={styles.actionIcon}><Lightbulb size={16} color="#111111" /></div>
            <div>
              <p style={styles.actionTitle}>Apply for Funding</p>
              <p style={styles.actionSub}>{profile.is_live ? "Submit your startup for review" : "Publish your profile first"}</p>
            </div>
          </div>
          <ArrowRight size={14} color="#cccccc" />
        </button>
      </div>

      {/* ── Waitlist ── */}
      <p style={styles.sectionLabel}>Waitlist</p>
      <div style={styles.waitlistCard}>
        {waitlist.length === 0 ? (
          <div style={styles.waitlistEmpty}>
            <AlertCircle size={32} color="#e5e5e5" />
            <p style={styles.waitlistEmptyTitle}>No one here yet</p>
            <p style={styles.waitlistEmptyText}>Share your profile link and watch your waitlist grow.</p>
          </div>
        ) : (
          <>
            <div style={styles.waitlistHeader}>
              <p style={styles.waitlistHeaderTitle}>
                {waitlistCount} {waitlistCount === 1 ? "person" : "people"} waiting
              </p>
              <div style={styles.waitlistBar}>
                <div style={{ ...styles.waitlistBarFill, width: `${Math.min(waitlistCount * 3, 100)}%` }} />
              </div>
            </div>
            {waitlist.map((entry) => (
              <div key={entry.id} style={styles.waitlistEntry}>
                <div style={styles.waitlistAvatar}>
                  <span style={styles.waitlistAvatarText}>{entry.email[0].toUpperCase()}</span>
                </div>
                <div style={styles.waitlistEntryInfo}>
                  <p style={styles.waitlistEntryEmail}>{entry.email}</p>
                  {entry.name && <p style={styles.waitlistEntryName}>{entry.name}</p>}
                </div>
                <span style={styles.waitlistEntryTime}>{timeAgo(entry.created_at)}</span>
              </div>
            ))}
            {waitlistCount > 5 && (
              <button style={styles.viewAllBtn} onClick={() => router.push("/dashboard/waitlist")}>
                View all {waitlistCount} →
              </button>
            )}
          </>
        )}
      </div>

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
  statsRow: { display: "grid", gap: "12px", marginBottom: "24px" },
  statCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statCardMobile: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "14px 16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statCardMobileInner: { display: "flex", alignItems: "center", gap: "12px" },
  statMobileInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  statValueMobile: { fontSize: "22px", fontWeight: "700", color: "#111111", flexShrink: 0 },
  statTop: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  statIconBox: { width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statLabel: { fontSize: "11px", fontWeight: "500", color: "#999999" },
  statValue: { fontSize: "26px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  statSub: { fontSize: "11px", color: "#cccccc", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  actionsCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "24px" },
  actionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", backgroundColor: "#ffffff", border: "none", cursor: "pointer", width: "100%", textAlign: "left" },
  actionLeft: { display: "flex", alignItems: "center", gap: "12px" },
  actionIcon: { width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actionTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  actionSub: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  actionDivider: { height: "1px", backgroundColor: "#f5f5f5", margin: "0 18px" },
  waitlistCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "40px" },
  waitlistEmpty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", textAlign: "center", gap: "8px" },
  waitlistEmptyTitle: { fontSize: "14px", fontWeight: "600", color: "#cccccc", margin: "4px 0 0 0" },
  waitlistEmptyText: { fontSize: "12px", color: "#dddddd", margin: "0", lineHeight: "1.6", maxWidth: "220px" },
  waitlistHeader: { padding: "16px 18px 12px 18px", borderBottom: "1px solid #f5f5f5" },
  waitlistHeaderTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 10px 0" },
  waitlistBar: { width: "100%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  waitlistBarFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.6s ease" },
  waitlistEntry: { display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px", borderBottom: "1px solid #f9f9f9" },
  waitlistAvatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  waitlistAvatarText: { fontSize: "13px", fontWeight: "600", color: "#888888" },
  waitlistEntryInfo: { flex: 1 },
  waitlistEntryEmail: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0" },
  waitlistEntryName: { fontSize: "11px", color: "#aaaaaa", margin: "2px 0 0 0" },
  waitlistEntryTime: { fontSize: "11px", color: "#cccccc", flexShrink: 0 },
  viewAllBtn: { width: "100%", padding: "14px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#fafafa", border: "none", borderTop: "1px solid #f5f5f5", cursor: "pointer", textAlign: "center" },
};