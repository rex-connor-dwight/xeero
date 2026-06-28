"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  Send,
  FolderOpen,
  CheckCircle,
  Clock,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  startup_name: string;
  tagline: string;
  problem: string;
  solution: string;
  stage: string;
  industry: string;
  business_model: string;
  traction: string;
  location: string;
  website: string;
  year_founded: string;
  team_size: string;
  funding_goal: string;
  funding_stage: string;
  logo_url: string;
  deck_url: string;
  founder_name: string;
  founder_role: string;
  founder_bio: string;
  founder_linkedin: string;
  founder_twitter: string;
  founder_photo_url: string;
  founder_achievements: string;
  founder_previous_startups: string;
  founder_skills: string;
  founder_experience: {
    id: string;
    role: string;
    company: string;
    year_start: string;
    year_end: string;
  }[];
  founder_education: {
    id: string;
    degree: string;
    school: string;
    year: string;
  }[];
  slug: string;
  is_live: boolean;
  validation_score: number | null;
  validation_band: string | null;
  validation_answers: any | null;
};

type Tab = "overview" | "founder" | "deck" | "dataroom";
type DrAccess = "none" | "loading" | "granted" | "expired";

type DataRoomDoc = {
  id: string;
  section: string;
  doc_type: string;
  title: string;
  file_url?: string;
  content_json?: any;
  status: string;
};

// ── Logic ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "X";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getSkillsArray(skills: string) {
  if (!skills) return [];
  return skills.split(",").map((s) => s.trim()).filter(Boolean);
}

async function fetchProfileBySlug(slug: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  if (data && data.is_live) {
    supabase.from("profile_views").insert({ profile_id: data.id });
  }
  return data as Profile;
}

async function getDeckSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("decks")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

async function submitWaitlist(profileId: string, email: string, name: string) {
  const { error } = await supabase
    .from("waitlist")
    .insert({ profile_id: profileId, email, name });
  return error;
}

async function submitDataRoomRequest(profileId: string, name: string, email: string, note: string) {
  const { error } = await supabase
    .from("data_room_requests")
    .insert({ profile_id: profileId, investor_name: name, investor_email: email, note });
  return error;
}

async function verifyToken(token: string, profileId: string): Promise<DrAccess> {
  const { data, error } = await supabase
    .from("data_room_requests")
    .select("status, token_expires_at")
    .eq("access_token", token)
    .eq("profile_id", profileId)
    .eq("status", "approved")
    .single();
  if (error || !data) return "none";
  if (new Date(data.token_expires_at) < new Date()) return "expired";
  return "granted";
}

async function fetchDataRoomDocs(profileId: string): Promise<DataRoomDoc[]> {
  const { data } = await supabase
    .from("data_room_documents")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "complete");
  return data || [];
}

// ── Sub Components ─────────────────────────────────────────────────────────

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
      <p style={{ ...styles.infoCardValue, ...(isEmpty ? styles.infoCardValueEmpty : {}) }}>
        {isEmpty ? (placeholder || "Not added yet") : value}
      </p>
    </div>
  );
}

function ValidationScoreCard({ score, band }: { score: number; band: string | null }) {
  const color = score >= 70 ? "#38a169" : score >= 40 ? "#d69e2e" : "#e53e3e";
  const bgColor = score >= 70 ? "#f0fff4" : score >= 40 ? "#fffbeb" : "#fff5f5";
  const borderColor = score >= 70 ? "#c6f6d5" : score >= 40 ? "#fef08a" : "#fed7d7";
  return (
    <div style={{ ...styles.validationCard, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
      <div style={styles.validationCardTop}>
        <div>
          <p style={{ ...styles.validationBand, color }}>{band || "Validated"}</p>
          <p style={{ ...styles.validationSubtext, color }}>{score}/100 — Xeero Validation Score</p>
        </div>
      </div>
      <div style={styles.validationBar}>
        <div style={{ ...styles.validationBarFill, width: `${score}%`, backgroundColor: color }} />
      </div>
      <p style={styles.validationNote}>
        This score reflects how thoroughly the founder validated their idea before building.
      </p>
    </div>
  );
}

// ── Doc Modal ──────────────────────────────────────────────────────────────

function DocModal({ doc, onClose }: { doc: DataRoomDoc; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const renderContent = () => {
    if (doc.file_url) {
      return (
        <iframe
          src={doc.file_url}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={doc.title}
        />
      );
    }

    if (doc.content_json) {
      const content = doc.content_json;

      if (doc.doc_type === "cap_table" && content.rows) {
        return (
          <div style={modalStyles.builtContent}>
            <h3 style={modalStyles.builtTitle}>{doc.title}</h3>
            <div style={modalStyles.tableWrapper}>
              <div style={modalStyles.tableHeader}>
                <span style={modalStyles.tableCell}>Name</span>
                <span style={modalStyles.tableCell}>Role</span>
                <span style={modalStyles.tableCell}>Shares</span>
                <span style={modalStyles.tableCell}>%</span>
              </div>
              {content.rows.map((row: any, i: number) => (
                <div key={i} style={modalStyles.tableRow}>
                  <span style={modalStyles.tableCell}>{row.name || "—"}</span>
                  <span style={modalStyles.tableCell}>{row.role || "—"}</span>
                  <span style={modalStyles.tableCell}>{row.shares || "—"}</span>
                  <span style={modalStyles.tableCell}>{row.percent ? `${row.percent}%` : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (doc.doc_type === "metrics") {
        const fields = [
          { key: "dau", label: "Daily Active Users" },
          { key: "mau", label: "Monthly Active Users" },
          { key: "retention", label: "Retention Rate" },
          { key: "churn", label: "Churn Rate" },
          { key: "nps", label: "NPS Score" },
          { key: "other", label: "Other Metric" },
        ];
        return (
          <div style={modalStyles.builtContent}>
            <h3 style={modalStyles.builtTitle}>{doc.title}</h3>
            <div style={modalStyles.metricsGrid}>
              {fields.filter((f) => content[f.key]).map((f) => (
                <div key={f.key} style={modalStyles.metricCard}>
                  <p style={modalStyles.metricLabel}>{f.label}</p>
                  <p style={modalStyles.metricValue}>{content[f.key]}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div style={modalStyles.builtContent}>
          <h3 style={modalStyles.builtTitle}>{doc.title}</h3>
          {Object.entries(content).map(([key, value]) => {
            if (!value || typeof value !== "string") return null;
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            return (
              <div key={key} style={modalStyles.fieldRow}>
                <p style={modalStyles.fieldLabel}>{label}</p>
                <p style={modalStyles.fieldValue}>{value as string}</p>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          <span style={modalStyles.modalTitle}>{doc.title}</span>
          <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={modalStyles.modalBody}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

type ModalStyles = { [key: string]: React.CSSProperties };
const modalStyles: ModalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "720px", height: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", overflow: "hidden" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  modalTitle: { fontSize: "14px", fontWeight: "600", color: "#111111" },
  closeBtn: { fontSize: "14px", color: "#888888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" },
  modalBody: { flex: 1, overflow: "auto", minHeight: 0, height: "100%" },
  builtContent: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },
  builtTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0" },
  fieldRow: { borderBottom: "1px solid #f5f5f5", paddingBottom: "16px" },
  fieldLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px 0" },
  fieldValue: { fontSize: "14px", color: "#333333", lineHeight: "1.7", margin: "0", whiteSpace: "pre-wrap" },
  tableWrapper: { border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: "8px", padding: "10px 14px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0" },
  tableRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: "8px", padding: "10px 14px", borderBottom: "1px solid #f9f9f9" },
  tableCell: { fontSize: "13px", color: "#333333" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  metricCard: { backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "16px", border: "1px solid #f0f0f0" },
  metricLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px 0" },
  metricValue: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0" },
};

// ── Data Room Viewer ───────────────────────────────────────────────────────

function DataRoomViewer({ profileId, startupName }: { profileId: string; startupName: string }) {
  const [docs, setDocs] = useState<DataRoomDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<DataRoomDoc | null>(null);

  useEffect(() => {
    fetchDataRoomDocs(profileId).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [profileId]);

  const sections = [
    { key: "company_overview", label: "Company Overview" },
    { key: "legal", label: "Legal & Corporate" },
    { key: "financials", label: "Financials" },
    { key: "traction", label: "Product & Traction" },
    { key: "team", label: "Team" },
  ];

  if (loading) return <div style={styles.drLoading}><div style={styles.loadingDot} /></div>;

  return (
    <>
      {activeDoc && (
        <DocModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
      )}

      <div style={styles.drViewerWrapper}>
        <div style={styles.drViewerHeader}>
          <div style={styles.drViewerIconBox}>
            <FolderOpen size={20} color="#38a169" />
          </div>
          <div>
            <h3 style={styles.drViewerTitle}>Data Room Access Granted</h3>
            <p style={styles.drViewerSub}>
              You have approved access to {startupName}'s data room. This link expires in 24 hours.
            </p>
          </div>
        </div>

        {sections.map((section) => {
          const sectionDocs = docs.filter((d) => d.section === section.key);
          if (sectionDocs.length === 0) return null;
          return (
            <div key={section.key} style={styles.drSection}>
              <p style={styles.drSectionLabel}>{section.label}</p>
              {sectionDocs.map((doc) => (
                <div key={doc.id} style={styles.drDocRow}>
                  <div style={styles.drDocLeft}>
                    <CheckCircle size={14} color="#38a169" />
                    <span style={styles.drDocTitle}>{doc.title}</span>
                  </div>
                  <button
                    style={styles.drDocViewBtn}
                    onClick={() => setActiveDoc(doc)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          );
        })}

        {docs.length === 0 && (
          <div style={styles.drEmptyDocs}>
            <p style={styles.drEmptyDocsText}>
              The founder hasn't uploaded any documents yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

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

  useEffect(() => {
    fetchProfileBySlug(slug).then(async (data) => {
      if (!data) { setNotFound(true); setLoading(false); return; }
      if (!data.is_live) { setNotLive(true); setLoading(false); return; }
      setProfile(data);
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
    if (error) { setWaitlistError("Something went wrong. Please try again."); }
    else { setWaitlistDone(true); }
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "founder", label: "Founder" },
    { key: "deck", label: "Deck" },
    { key: "dataroom", label: "Data Room" },
  ];

  const validationColor = profile.validation_score
    ? profile.validation_score >= 70 ? "#38a169" : profile.validation_score >= 40 ? "#d69e2e" : "#e53e3e"
    : "#38a169";
  const validationBg = profile.validation_score
    ? profile.validation_score >= 70 ? "#f0fff4" : profile.validation_score >= 40 ? "#fffbeb" : "#fff5f5"
    : "#f0fff4";
  const validationBorder = profile.validation_score
    ? profile.validation_score >= 70 ? "#c6f6d5" : profile.validation_score >= 40 ? "#fef08a" : "#fed7d7"
    : "#c6f6d5";

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

        {activeTab === "overview" && (
          <div style={styles.grid}>
            <InfoCard label="Problem" icon={<Target size={16} color="#999999" />} value={profile.problem} fullWidth />
            <InfoCard label="Solution" icon={<Lightbulb size={16} color="#999999" />} value={profile.solution} fullWidth />
            <InfoCard label="Traction" icon={<TrendingUp size={16} color="#999999" />} value={profile.traction} />
            <InfoCard label="Business Model" icon={<DollarSign size={16} color="#999999" />} value={profile.business_model} />

            {(profile.funding_stage || profile.funding_goal) && (
              <div style={{ ...styles.infoCard, ...styles.infoCardFull }}>
                <div style={styles.infoCardTop}>
                  <div style={styles.infoCardIconWrapper}><Rocket size={16} color="#999999" /></div>
                  <span style={styles.infoCardCapsule}>Fundraising</span>
                </div>
                <div style={styles.fundraisingRow}>
                  {profile.funding_stage && (
                    <div style={styles.fundraisingItem}>
                      <p style={styles.fundraisingLabel}>Stage</p>
                      <p style={styles.fundraisingValue}>{profile.funding_stage}</p>
                    </div>
                  )}
                  {profile.funding_goal && (
                    <div style={styles.fundraisingItem}>
                      <p style={styles.fundraisingLabel}>Raising</p>
                      <p style={styles.fundraisingValue}>{profile.funding_goal}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.validation_score && (
              <div style={{ ...styles.infoCard, ...styles.infoCardFull, backgroundColor: validationBg, border: `1px solid ${validationBorder}` }}>
                <div style={styles.infoCardTop}>
                  <div style={styles.infoCardIconWrapper}>
                    <CheckCircle size={16} color={validationColor} />
                  </div>
                  <span style={{ ...styles.infoCardCapsule, backgroundColor: validationBg, color: validationColor }}>
                    Validation Score
                  </span>
                </div>
                <div style={styles.validationCardTop}>
                  <div>
                    <p style={{ ...styles.validationBand, color: validationColor }}>
                      {profile.validation_band || "Validated"}
                    </p>
                    <p style={{ ...styles.validationSubtext, color: validationColor }}>
                      {profile.validation_score}/100 — This founder validated their idea before building.
                    </p>
                  </div>
                </div>
                <div style={{ ...styles.validationBar, marginTop: "14px" }}>
                  <div style={{ ...styles.validationBarFill, width: `${profile.validation_score}%`, backgroundColor: validationColor }} />
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
                  {profile.founder_photo_url
                    ? <img src={profile.founder_photo_url} alt="founder" style={styles.founderPhoto} />
                    : <span style={styles.founderInitials}>{getInitials(profile.founder_name)}</span>
                  }
                </div>
                <div>
                  <p style={styles.founderName}>{profile.founder_name || "Founder"}</p>
                  <p style={styles.founderRole}>{profile.founder_role || ""}</p>
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
                <div style={styles.deckEmptyIconWrapper}><FileText size={28} color="#cccccc" /></div>
                <h3 style={styles.deckEmptyTitle}>No deck uploaded yet</h3>
                <p style={styles.deckEmptyText}>This startup hasn't uploaded a pitch deck yet. Check back soon.</p>
              </div>
            )}
          </div>
        )}

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
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
  coverSvg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
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
  validationCard: { borderRadius: "12px", padding: "16px" },
  validationCardTop: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" },
  validationBand: { fontSize: "14px", fontWeight: "700", margin: "0 0 2px 0" },
  validationSubtext: { fontSize: "12px", color: "#888888", margin: "0" },
  validationBar: { width: "100%", height: "6px", backgroundColor: "#e5e5e5", borderRadius: "99px", overflow: "hidden" },
  validationBarFill: { height: "100%", borderRadius: "99px", transition: "width 0.6s ease" },
  validationNote: { fontSize: "11px", color: "#888888", margin: "10px 0 0 0", lineHeight: "1.5" },
  tabsWrapper: { backgroundColor: "#f5f5f5", position: "sticky", top: 0, zIndex: 90, overflowX: "auto" },
  tabs: { display: "flex", gap: "6px", maxWidth: "800px", margin: "0 auto", padding: "12px 24px" },
  tab: { padding: "7px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", transition: "all 0.15s ease" },
  tabActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111", fontWeight: "600" },
  tabContent: { maxWidth: "800px", margin: "0 auto", padding: "8px 24px 40px 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" },
  infoCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  infoCardFull: { gridColumn: "1 / -1" },
  infoCardEmpty: { backgroundColor: "#fafafa", border: "1px dashed #e5e5e5", boxShadow: "none" },
  infoCardTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  infoCardIconWrapper: { display: "flex", alignItems: "center" },
  infoCardCapsule: { fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "0.07em", backgroundColor: "#f5f5f5", padding: "3px 10px", borderRadius: "99px" },
  infoCardValue: { fontSize: "14px", color: "#333333", lineHeight: "1.7", margin: "0" },
  infoCardValueEmpty: { color: "#cccccc", fontStyle: "italic", fontSize: "13px" },
  fundraisingRow: { display: "flex", gap: "40px" },
  fundraisingItem: { display: "flex", flexDirection: "column", gap: "4px" },
  fundraisingLabel: { fontSize: "11px", color: "#999999", fontWeight: "500", margin: "0", textTransform: "uppercase", letterSpacing: "0.06em" },
  fundraisingValue: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0" },
  founderContent: { display: "flex", flexDirection: "column", gap: "14px" },
  founderCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  founderHeaderRow: { display: "flex", alignItems: "center", gap: "16px" },
  founderAvatar: { width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  founderPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  founderInitials: { fontSize: "18px", fontWeight: "600", color: "#111111" },
  founderName: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0 0 3px 0" },
  founderRole: { fontSize: "13px", color: "#666666", margin: "0 0 8px 0" },
  founderSocials: { display: "flex", gap: "8px" },
  socialLink: { fontSize: "12px", color: "#111111", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", border: "1px solid #eeeeee", padding: "4px 10px", borderRadius: "99px", backgroundColor: "#fafafa" },
  cvDivider: { height: "1px", backgroundColor: "#f0f0f0", margin: "20px 0" },
  founderBio: { fontSize: "14px", color: "#444444", lineHeight: "1.7", margin: "0" },
  cvSectionHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" },
  cvSectionLabel: { fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillTag: { padding: "5px 14px", backgroundColor: "#f5f5f5", borderRadius: "99px", fontSize: "12px", color: "#444444", fontWeight: "500", border: "1px solid #eeeeee" },
  cvEntry: { display: "flex", gap: "14px", marginBottom: "16px" },
  cvEntryLeft: { display: "flex", flexDirection: "column", alignItems: "center", width: "10px", flexShrink: 0, marginTop: "5px" },
  cvEntryDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#111111", flexShrink: 0 },
  cvEntryLine: { width: "1px", flex: 1, backgroundColor: "#eeeeee", marginTop: "4px", minHeight: "24px" },
  cvEntryBody: { flex: 1, paddingBottom: "8px" },
  cvEntryTitle: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  cvEntrySubtitle: { fontSize: "13px", color: "#666666", margin: "0 0 2px 0" },
  cvEntryDate: { fontSize: "12px", color: "#aaaaaa", margin: "0" },
  cvText: { fontSize: "14px", color: "#444444", lineHeight: "1.7", margin: "0" },
  deckWrapper: { display: "flex", flexDirection: "column", gap: "14px" },
  deckViewerCard: { backgroundColor: "#ffffff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  deckViewerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" },
  deckViewerTitleRow: { display: "flex", alignItems: "center", gap: "8px" },
  deckViewerTitleText: { fontSize: "14px", fontWeight: "600", color: "#111111" },
  deckDownloadBtn: { padding: "6px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px", textDecoration: "none" },
  deckIframeWrapper: { width: "100%", height: "600px", backgroundColor: "#f9f9f9" },
  deckIframe: { width: "100%", height: "100%", border: "none" },
  deckEmptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  deckEmptyIconWrapper: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  deckEmptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  deckEmptyText: { fontSize: "13px", color: "#999999", margin: "0", lineHeight: "1.6", maxWidth: "280px" },
  drStateCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "48px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", maxWidth: "480px", margin: "0 auto" },
  drStateIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  drStateTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0" },
  drStateText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0" },
  drViewerWrapper: { display: "flex", flexDirection: "column", gap: "14px" },
  drViewerHeader: { backgroundColor: "#f0fff4", borderRadius: "14px", padding: "20px", border: "1px solid #c6f6d5", display: "flex", alignItems: "flex-start", gap: "14px" },
  drViewerIconBox: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #c6f6d5" },
  drViewerTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  drViewerSub: { fontSize: "13px", color: "#38a169", margin: "0", lineHeight: "1.5" },
  drSection: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  drSectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px 0" },
  drDocRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  drDocLeft: { display: "flex", alignItems: "center", gap: "8px" },
  drDocTitle: { fontSize: "13px", fontWeight: "500", color: "#111111" },
  drDocViewBtn: { fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px", padding: "4px 12px", cursor: "pointer" },
  drEmptyDocs: { backgroundColor: "#fafafa", borderRadius: "12px", padding: "32px", textAlign: "center", border: "1px dashed #e5e5e5" },
  drEmptyDocsText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  drLoading: { display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" },
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
};