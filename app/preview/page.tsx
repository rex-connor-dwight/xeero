"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Rocket,
  Globe,
  MapPin,
  Users,
  Calendar,
  Lock,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = "overview" | "founder" | "deck" | "dataroom";

// ── Logic ──────────────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function getInitials(name: string) {
  if (!name) return "X";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getSkillsArray(skills: string) {
  if (!skills) return [];
  return skills.split(",").map((s) => s.trim()).filter(Boolean);
}

async function getDeckSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("decks")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

// ── Sub Components ─────────────────────────────────────────────────────────

function CoverPattern() {
  return (
    <svg
      style={styles.coverSvg}
      viewBox="0 0 800 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <line x1="400" y1="300" x2="-100" y2="-50" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="0" y2="-80" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="100" y2="-100" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="200" y2="-110" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="300" y2="-115" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="400" y2="-120" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="500" y2="-115" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="600" y2="-110" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="700" y2="-100" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="800" y2="-80" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <line x1="400" y1="300" x2="900" y2="-50" stroke="white" strokeWidth="0.5" strokeOpacity="0.08" />
      <ellipse cx="400" cy="320" rx="380" ry="200" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.06" />
      <ellipse cx="400" cy="320" rx="300" ry="160" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />
      <ellipse cx="400" cy="320" rx="200" ry="110" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
    </svg>
  );
}

type InfoCardProps = {
  label: string;
  icon: React.ReactNode;
  value?: string;
  placeholder?: string;
  fullWidth?: boolean;
};

function InfoCard({ label, icon, value, placeholder, fullWidth }: InfoCardProps) {
  const isEmpty = !value;
  return (
    <div style={{
      ...styles.infoCard,
      ...(fullWidth ? styles.infoCardFull : {}),
      ...(isEmpty ? styles.infoCardEmpty : {}),
    }}>
      <div style={styles.infoCardTop}>
        <div style={styles.infoCardIconWrapper}>{icon}</div>
        <span style={styles.infoCardCapsule}>{label}</span>
      </div>
      <p style={{
        ...styles.infoCardValue,
        ...(isEmpty ? styles.infoCardValueEmpty : {}),
      }}>
        {isEmpty ? (placeholder || "Not added yet") : value}
      </p>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const { profile, profileLoading } = useXeero();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [deckSignedUrl, setDeckSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.deck_url) return;
    getDeckSignedUrl(profile.deck_url).then((url) => {
      setDeckSignedUrl(url);
    });
  }, [profile?.deck_url]);

  if (profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (!profile) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "founder", label: "Founder" },
    { key: "deck", label: "Deck" },
    { key: "dataroom", label: "Data Room" },
  ];

  return (
    <div style={styles.page}>

      {/* ── Preview Bar ── */}
      <div style={styles.previewBar}>
        <p style={styles.previewBarText}>
          👀 Preview mode — only you can see this
        </p>
        <div style={styles.previewBarActions}>
          <button
            style={styles.previewEditBtn}
            onClick={() => router.push("/dashboard/edit")}
          >
            Edit Profile
          </button>
          <button
            style={styles.previewLiveBtn}
            onClick={() => router.push("/payment")}
          >
            Pay & Go Live →
          </button>
        </div>
      </div>

      {/* ── Cover + Header ── */}
      <div style={styles.coverWrapper}>
        <div style={styles.cover}>
          <CoverPattern />
        </div>
        <div style={styles.profileHeader}>
          <div style={styles.logoCircle}>
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="logo" style={styles.logoImg} />
            ) : (
              <span style={styles.logoInitials}>
                {getInitials(profile.startup_name)}
              </span>
            )}
          </div>

          <div style={styles.headerBody}>
            <div style={styles.headerTop}>
              <div style={styles.headerLeft}>
                <h1 style={styles.startupName}>{profile.startup_name}</h1>
                <p style={styles.tagline}>{profile.tagline}</p>
                <p style={styles.slug}>xeero.me/{profile.slug}</p>
              </div>
              <div style={styles.headerRight}>
                <button style={styles.dotsBtn}>•••</button>
                <button
                  style={styles.waitlistBtn}
                  onClick={() => setShowWaitlist(!showWaitlist)}
                >
                  Join Waitlist
                </button>
              </div>
            </div>

            {showWaitlist && !waitlistSubmitted && (
              <div style={styles.waitlistForm}>
                <input
                  style={styles.waitlistInput}
                  type="email"
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                />
                <button
                  style={styles.waitlistSubmitBtn}
                  onClick={() => setWaitlistSubmitted(true)}
                >
                  Join
                </button>
              </div>
            )}

            {waitlistSubmitted && (
              <p style={styles.waitlistSuccess}>✓ You're on the waitlist!</p>
            )}

            <div style={styles.pills}>
              {profile.stage && <span style={styles.pill}>{profile.stage}</span>}
              {profile.industry && <span style={styles.pill}>{profile.industry}</span>}
              {profile.location && (
                <span style={styles.pill}>
                  <MapPin size={11} style={{ marginRight: 4 }} />
                  {profile.location}
                </span>
              )}
              {profile.year_founded && (
                <span style={styles.pill}>
                  <Calendar size={11} style={{ marginRight: 4 }} />
                  Est. {profile.year_founded}
                </span>
              )}
              {profile.team_size && (
                <span style={styles.pill}>
                  <Users size={11} style={{ marginRight: 4 }} />
                  {profile.team_size} people
                </span>
              )}
              {profile.website && (
                
                <a  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.pillLink}
                >
                  <Globe size={11} style={{ marginRight: 4 }} />
                  Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabsWrapper}>
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(activeTab === tab.key ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.key === "dataroom" && (
                <Lock size={11} style={{ marginRight: 5 }} />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={styles.tabContent}>

        {activeTab === "overview" && (
          <div style={styles.grid}>
            <InfoCard label="Problem" icon={<Target size={16} color="#999999" />} value={profile.problem} placeholder="Describe the problem you're solving" fullWidth />
            <InfoCard label="Solution" icon={<Lightbulb size={16} color="#999999" />} value={profile.solution} placeholder="How does your startup solve it?" fullWidth />
            <InfoCard label="Traction" icon={<TrendingUp size={16} color="#999999" />} value={profile.traction} placeholder="Users, revenue, signups..." />
            <InfoCard label="Business Model" icon={<DollarSign size={16} color="#999999" />} value={profile.business_model} placeholder="How do you make money?" />
            {(profile.funding_stage || profile.funding_goal) && (
              <div style={{ ...styles.infoCard, ...styles.infoCardFull }}>
                <div style={styles.infoCardTop}>
                  <div style={styles.infoCardIconWrapper}><Rocket size={16} color="#999999" /></div>
                  <span style={styles.infoCardCapsule}>Fundraising</span>
                </div>
                <div style={styles.fundraisingRow}>
                  {profile.funding_stage && (
                    <div style={styles.fundraisingItem}>
                      <p style={styles.fundraisingItemLabel}>Stage</p>
                      <p style={styles.fundraisingItemValue}>{profile.funding_stage}</p>
                    </div>
                  )}
                  {profile.funding_goal && (
                    <div style={styles.fundraisingItem}>
                      <p style={styles.fundraisingItemLabel}>Raising</p>
                      <p style={styles.fundraisingItemValue}>{profile.funding_goal}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "founder" && (
          <div style={styles.founderContent}>
            <div style={styles.founderCard}>
              <div style={styles.founderHeaderRow}>
                <div style={styles.founderAvatar}>
                  {profile.founder_photo_url ? (
                    <img src={profile.founder_photo_url} alt="founder" style={styles.founderPhoto} />
                  ) : (
                    <span style={styles.founderInitials}>{getInitials(profile.founder_name)}</span>
                  )}
                </div>
                <div>
                  <p style={styles.founderName}>{profile.founder_name || "Founder Name"}</p>
                  <p style={styles.founderRole}>{profile.founder_role || "Role"}</p>
                  <div style={styles.founderSocials}>
                    {profile.founder_linkedin && (
                      <a href={profile.founder_linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                        <LinkedInIcon />LinkedIn
                      </a>
                    )}
                    {profile.founder_twitter && (
                      <a href={profile.founder_twitter} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                        <XIcon />Twitter
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {profile.founder_bio && (
                <>
                  <div style={styles.cvDivider} />
                  <p style={styles.founderBio}>{profile.founder_bio}</p>
                </>
              )}
            </div>

            {profile.founder_skills && (
              <div style={styles.founderCard}>
                <div style={styles.cvSectionHeader}>
                  <Layers size={15} color="#999999" />
                  <p style={styles.cvSectionLabel}>Skills</p>
                </div>
                <div style={styles.skillsRow}>
                  {getSkillsArray(profile.founder_skills).map((skill, i) => (
                    <span key={i} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.founder_experience?.length > 0 && (
              <div style={styles.founderCard}>
                <div style={styles.cvSectionHeader}>
                  <Briefcase size={15} color="#999999" />
                  <p style={styles.cvSectionLabel}>Experience</p>
                </div>
                {profile.founder_experience.map((exp, i) => (
                  <div key={exp.id} style={styles.cvEntry}>
                    <div style={styles.cvEntryLeft}>
                      <div style={styles.cvEntryDot} />
                      {i < profile.founder_experience.length - 1 && <div style={styles.cvEntryLine} />}
                    </div>
                    <div style={styles.cvEntryBody}>
                      <p style={styles.cvEntryTitle}>{exp.role}</p>
                      <p style={styles.cvEntrySubtitle}>{exp.company}</p>
                      <p style={styles.cvEntryDate}>{exp.year_start} — {exp.year_end}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile.founder_education?.length > 0 && (
              <div style={styles.founderCard}>
                <div style={styles.cvSectionHeader}>
                  <GraduationCap size={15} color="#999999" />
                  <p style={styles.cvSectionLabel}>Education</p>
                </div>
                {profile.founder_education.map((edu, i) => (
                  <div key={edu.id} style={styles.cvEntry}>
                    <div style={styles.cvEntryLeft}>
                      <div style={styles.cvEntryDot} />
                      {i < profile.founder_education.length - 1 && <div style={styles.cvEntryLine} />}
                    </div>
                    <div style={styles.cvEntryBody}>
                      <p style={styles.cvEntryTitle}>{edu.degree}</p>
                      <p style={styles.cvEntrySubtitle}>{edu.school}</p>
                      <p style={styles.cvEntryDate}>{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile.founder_achievements && (
              <div style={styles.founderCard}>
                <div style={styles.cvSectionHeader}>
                  <Award size={15} color="#999999" />
                  <p style={styles.cvSectionLabel}>Achievements</p>
                </div>
                <p style={styles.cvText}>{profile.founder_achievements}</p>
              </div>
            )}

            {profile.founder_previous_startups && (
              <div style={styles.founderCard}>
                <div style={styles.cvSectionHeader}>
                  <Rocket size={15} color="#999999" />
                  <p style={styles.cvSectionLabel}>Previous Startups</p>
                </div>
                <p style={styles.cvText}>{profile.founder_previous_startups}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "deck" && (
          <div style={styles.deckWrapper}>
            {deckSignedUrl ? (
              <div style={styles.deckViewerCard}>
                <div style={styles.deckViewerHeader}>
                  <div style={styles.deckViewerTitleRow}>
                    <FileText size={16} color="#111111" />
                    <span style={styles.deckViewerTitleText}>Pitch Deck</span>
                  </div>
                  <a href={deckSignedUrl} target="_blank" rel="noopener noreferrer" style={styles.deckDownloadBtn}>
                    Download PDF
                  </a>
                </div>
                <div style={styles.deckIframeWrapper}>
                  <iframe src={deckSignedUrl} style={styles.deckIframe} title="Pitch Deck" />
                </div>
              </div>
            ) : (
              <div style={styles.deckEmptyCard}>
                <div style={styles.deckEmptyIconWrapper}>
                  <FileText size={28} color="#cccccc" />
                </div>
                <h3 style={styles.deckEmptyTitle}>No deck uploaded yet</h3>
                <p style={styles.deckEmptyText}>Upload your pitch deck so investors can review it.</p>
                <button style={styles.deckUploadBtn} onClick={() => router.push("/dashboard/edit")}>
                  Upload Deck
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "dataroom" && (
          <div style={styles.lockedCard}>
            <div style={styles.lockIconWrapper}>
              <Lock size={24} color="#aaaaaa" />
            </div>
            <h3 style={styles.lockedTitle}>Data Room</h3>
            <p style={styles.lockedText}>
              The data room is private. Share sensitive documents only with investors you trust.
            </p>
            <button style={styles.requestAccessBtn} onClick={() => router.push("/dashboard/edit")}>
              Set Up Data Room
            </button>
          </div>
        )}

      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Powered by <strong>Xeero</strong> · xeero.me
        </p>
      </div>

    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = {
  [key: string]: React.CSSProperties;
};

const styles: Styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#cccccc",
  },
  previewBar: {
    backgroundColor: "#111111",
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  previewBarText: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    margin: "0",
  },
  previewBarActions: {
    display: "flex",
    gap: "8px",
  },
  previewEditBtn: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "6px",
    cursor: "pointer",
  },
  previewLiveBtn: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#111111",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    cursor: "pointer",
  },
  coverWrapper: { position: "relative" },
  cover: {
    width: "100%",
    height: "200px",
    background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)",
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
  },
  coverSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  profileHeader: {
    backgroundColor: "#f5f5f5",
    padding: "0 32px 24px 32px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  logoCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    backgroundColor: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-40px",
    marginBottom: "16px",
    border: "3px solid #f5f5f5",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
  },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoInitials: { fontSize: "24px", fontWeight: "700", color: "#ffffff" },
  headerBody: { display: "flex", flexDirection: "column", gap: "14px" },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerLeft: { flex: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  startupName: { fontSize: "24px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  tagline: { fontSize: "14px", color: "#666666", margin: "0 0 4px 0", lineHeight: "1.5" },
  slug: { fontSize: "12px", color: "#bbbbbb", margin: "0" },
  dotsBtn: {
    padding: "7px 12px",
    fontSize: "13px",
    color: "#888888",
    backgroundColor: "#ffffff",
    border: "1px solid #eeeeee",
    borderRadius: "8px",
    cursor: "pointer",
    letterSpacing: "2px",
  },
  waitlistBtn: {
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#111111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  waitlistForm: { display: "flex", gap: "8px" },
  waitlistInput: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "13px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  waitlistSubmitBtn: {
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#111111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  waitlistSuccess: { fontSize: "13px", color: "#38a169", fontWeight: "500", margin: "0" },
  pills: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
  pill: {
    padding: "5px 12px",
    backgroundColor: "#ffffff",
    borderRadius: "99px",
    fontSize: "12px",
    color: "#555555",
    fontWeight: "500",
    border: "1px solid #eeeeee",
    display: "flex",
    alignItems: "center",
  },
  pillLink: {
    padding: "5px 12px",
    backgroundColor: "#ffffff",
    borderRadius: "99px",
    fontSize: "12px",
    color: "#555555",
    fontWeight: "500",
    border: "1px solid #eeeeee",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
  },
  tabsWrapper: {
    backgroundColor: "#f5f5f5",
    position: "sticky",
    top: "41px",
    zIndex: 90,
    overflowX: "auto",
  },
  tabs: {
    display: "flex",
    gap: "6px",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "12px 24px",
  },
  tab: {
    padding: "7px 16px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#888888",
    backgroundColor: "#ffffff",
    border: "1px solid #eeeeee",
    borderRadius: "99px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    transition: "all 0.15s ease",
  },
  tabActive: {
    color: "#ffffff",
    backgroundColor: "#111111",
    border: "1px solid #111111",
    fontWeight: "600",
  },
  tabContent: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "8px 24px 40px 24px",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  infoCardFull: { gridColumn: "1 / -1" },
  infoCardEmpty: {
    backgroundColor: "#fafafa",
    border: "1px dashed #e5e5e5",
    boxShadow: "none",
  },
  infoCardTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  infoCardIconWrapper: { display: "flex", alignItems: "center", justifyContent: "center" },
  infoCardCapsule: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    backgroundColor: "#f5f5f5",
    padding: "3px 10px",
    borderRadius: "99px",
  },
  infoCardValue: { fontSize: "14px", color: "#333333", lineHeight: "1.7", margin: "0" },
  infoCardValueEmpty: { color: "#cccccc", fontStyle: "italic", fontSize: "13px" },
  fundraisingRow: { display: "flex", gap: "40px" },
  fundraisingItem: { display: "flex", flexDirection: "column", gap: "4px" },
  fundraisingItemLabel: {
    fontSize: "11px",
    color: "#999999",
    fontWeight: "500",
    margin: "0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  fundraisingItemValue: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0" },
  founderContent: { display: "flex", flexDirection: "column", gap: "14px" },
  founderCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  founderHeaderRow: { display: "flex", alignItems: "center", gap: "16px" },
  founderAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  founderPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  founderInitials: { fontSize: "18px", fontWeight: "600", color: "#111111" },
  founderName: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0 0 3px 0" },
  founderRole: { fontSize: "13px", color: "#666666", margin: "0 0 8px 0" },
  founderSocials: { display: "flex", gap: "12px" },
  socialLink: {
    fontSize: "12px",
    color: "#111111",
    fontWeight: "500",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    border: "1px solid #eeeeee",
    padding: "4px 10px",
    borderRadius: "99px",
    backgroundColor: "#fafafa",
  },
  cvDivider: { height: "1px", backgroundColor: "#f0f0f0", margin: "20px 0" },
  founderBio: { fontSize: "14px", color: "#444444", lineHeight: "1.7", margin: "0" },
  cvSectionHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  cvSectionLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    margin: "0",
  },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillTag: {
    padding: "5px 14px",
    backgroundColor: "#f5f5f5",
    borderRadius: "99px",
    fontSize: "12px",
    color: "#444444",
    fontWeight: "500",
    border: "1px solid #eeeeee",
  },
  cvEntry: { display: "flex", gap: "14px", marginBottom: "16px" },
  cvEntryLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "10px",
    flexShrink: 0,
    marginTop: "5px",
  },
  cvEntryDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#111111", flexShrink: 0 },
  cvEntryLine: { width: "1px", flex: 1, backgroundColor: "#eeeeee", marginTop: "4px", minHeight: "24px" },
  cvEntryBody: { flex: 1, paddingBottom: "8px" },
  cvEntryTitle: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  cvEntrySubtitle: { fontSize: "13px", color: "#666666", margin: "0 0 2px 0" },
  cvEntryDate: { fontSize: "12px", color: "#aaaaaa", margin: "0" },
  cvText: { fontSize: "14px", color: "#444444", lineHeight: "1.7", margin: "0" },
  deckWrapper: { display: "flex", flexDirection: "column", gap: "14px" },
  deckViewerCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  },
  deckViewerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  deckViewerTitleRow: { display: "flex", alignItems: "center", gap: "8px" },
  deckViewerTitleText: { fontSize: "14px", fontWeight: "600", color: "#111111" },
  deckDownloadBtn: {
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#111111",
    backgroundColor: "#f5f5f5",
    border: "1px solid #eeeeee",
    borderRadius: "6px",
    textDecoration: "none",
  },
  deckIframeWrapper: { width: "100%", height: "600px", backgroundColor: "#f9f9f9" },
  deckIframe: { width: "100%", height: "100%", border: "none" },
  deckEmptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "56px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  deckEmptyIconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  deckEmptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  deckEmptyText: { fontSize: "13px", color: "#999999", margin: "0 0 24px 0", lineHeight: "1.6" },
  deckUploadBtn: {
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#111111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  lockedCard: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "56px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  lockIconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  lockedTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  lockedText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", maxWidth: "300px", margin: "0 0 24px 0" },
  requestAccessBtn: {
    padding: "11px 24px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#111111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  footer: { textAlign: "center", padding: "32px 24px" },
  footerText: { fontSize: "12px", color: "#cccccc", margin: "0" },
};