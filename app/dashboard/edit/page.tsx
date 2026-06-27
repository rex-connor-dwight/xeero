"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  Info,
  Upload,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Eye,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type EditTab = "startup" | "founder";

type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  year_start: string;
  year_end: string;
};

type EducationEntry = {
  id: string;
  degree: string;
  school: string;
  year: string;
};

type ProfileData = {
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
  founder_experience: ExperienceEntry[];
  founder_education: EducationEntry[];
};

type TooltipKey =
  | "tagline"
  | "problem"
  | "solution"
  | "traction"
  | "business_model"
  | "funding_goal"
  | "founder_bio"
  | "founder_skills"
  | "founder_achievements";

// ── Tooltip Content ────────────────────────────────────────────────────────

const tooltips: Record<TooltipKey, { title: string; tip: string }> = {
  tagline: {
    title: "Writing a great tagline",
    tip: "Keep it under 10 words. Focus on the outcome not the feature. E.g. 'From idea to funding, one link.' Avoid buzzwords like 'revolutionary' or 'disruptive'.",
  },
  problem: {
    title: "A strong problem statement",
    tip: "Describe the pain in one paragraph. Who experiences it? How often? What do they do today that doesn't work? Make the investor feel the problem before you pitch the solution.",
  },
  solution: {
    title: "Pitching your solution",
    tip: "Lead with what you do, not how you do it. 'We help X do Y by doing Z.' Keep it simple enough that a non-technical investor gets it in 10 seconds.",
  },
  traction: {
    title: "What counts as traction?",
    tip: "Waitlist signups, paying customers, MRR, DAUs, letters of intent, pilot partners — anything that shows people want this. Even 10 users who love you beats 1000 who don't care.",
  },
  business_model: {
    title: "Explaining your business model",
    tip: "How do you make money? E.g. 'Monthly SaaS subscription at $9/mo' or 'We take 5% of every transaction.' The simpler, the better.",
  },
  funding_goal: {
    title: "Setting your funding goal",
    tip: "How much are you raising and for how long? E.g. '$500k to reach product-market fit over 18 months.' Tie the amount to specific milestones.",
  },
  founder_bio: {
    title: "Writing your founder bio",
    tip: "Why are you the right person to solve this problem? Mention relevant experience, past startups, or domain expertise. 2-3 sentences max.",
  },
  founder_skills: {
    title: "Listing your skills",
    tip: "Be specific. Instead of 'marketing', say 'growth marketing' or 'B2B sales'. Skills that complement your co-founders are especially valuable to investors.",
  },
  founder_achievements: {
    title: "Highlighting achievements",
    tip: "Anything that signals credibility — press features, accelerator alumni, awards, successful exits, patents, or being first in your market.",
  },
};

// ── Logic ──────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

async function uploadFile(bucket: string, userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) return null;
  if (bucket === "logos") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  return path;
}

async function saveProfileToDb(data: ProfileData, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...data })
    .eq("user_id", userId);
  return error;
}

async function getDeckSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("decks")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

// ── Sub Components ─────────────────────────────────────────────────────────

function TooltipIcon({ tooltipKey }: { tooltipKey: TooltipKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const content = tooltips[tooltipKey];

  return (
    <div ref={ref} style={tipStyles.wrapper}>
      <button
        style={tipStyles.iconBtn}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <Info size={13} color={open ? "#111111" : "#bbbbbb"} />
      </button>
      {open && (
        <div style={tipStyles.card}>
          <p style={tipStyles.title}>{content.title}</p>
          <p style={tipStyles.tip}>{content.tip}</p>
        </div>
      )}
    </div>
  );
}

type TipStyles = { [key: string]: React.CSSProperties };
const tipStyles: TipStyles = {
  wrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
  },
  card: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: "0",
    backgroundColor: "#111111",
    borderRadius: "10px",
    padding: "12px 14px",
    width: "260px",
    zIndex: 200,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  title: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0 0 6px 0",
  },
  tip: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: "1.6",
    margin: "0",
  },
};

function FieldLabel({ label, tooltipKey }: { label: string; tooltipKey?: TooltipKey }) {
  return (
    <div style={styles.labelRow}>
      <label style={styles.label}>{label}</label>
      {tooltipKey && <TooltipIcon tooltipKey={tooltipKey} />}
    </div>
  );
}

function DeckPreview({ deckUrl }: { deckUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!deckUrl) return;
    let cancelled = false;

    const renderPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const signedUrl = await getDeckSignedUrl(deckUrl);
        if (!signedUrl || cancelled) return;
        const pdf = await pdfjsLib.getDocument({ url: signedUrl }).promise;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvas: canvas, viewport }).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        if (!cancelled) setError(true);
      }
    };

    renderPdf();
    return () => { cancelled = true; };
  }, [deckUrl]);

  if (error) return null;

  return (
    <div style={deckPreviewStyles.wrapper}>
      <canvas
        ref={canvasRef}
        style={{ ...deckPreviewStyles.canvas, opacity: loaded ? 1 : 0 }}
      />
      {!loaded && (
        <div style={deckPreviewStyles.placeholder}>
          <FileText size={20} color="#cccccc" />
          <span style={deckPreviewStyles.placeholderText}>Loading preview...</span>
        </div>
      )}
    </div>
  );
}

type DeckPreviewStyles = { [key: string]: React.CSSProperties };
const deckPreviewStyles: DeckPreviewStyles = {
  wrapper: {
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #f0f0f0",
    backgroundColor: "#fafafa",
    marginTop: "12px",
    position: "relative",
    minHeight: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: "100%",
    height: "auto",
    display: "block",
    transition: "opacity 0.3s ease",
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "24px",
  },
  placeholderText: {
    fontSize: "12px",
    color: "#cccccc",
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function EditPage() {
  const router = useRouter();
  const { user, profile: contextProfile, profileLoading, updateProfileCache } = useXeero();
  const [activeTab, setActiveTab] = useState<EditTab>("startup");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const deckRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ProfileData>({
    startup_name: "",
    tagline: "",
    problem: "",
    solution: "",
    stage: "",
    industry: "",
    business_model: "",
    traction: "",
    location: "",
    website: "",
    year_founded: "",
    team_size: "",
    funding_goal: "",
    funding_stage: "",
    logo_url: "",
    deck_url: "",
    founder_name: "",
    founder_role: "",
    founder_bio: "",
    founder_linkedin: "",
    founder_twitter: "",
    founder_photo_url: "",
    founder_achievements: "",
    founder_previous_startups: "",
    founder_skills: "",
    founder_experience: [],
    founder_education: [],
  });

  // ── Populate from context when profile loads ──
  useEffect(() => {
    if (!contextProfile) return;
    setData({
      startup_name: contextProfile.startup_name || "",
      tagline: contextProfile.tagline || "",
      problem: contextProfile.problem || "",
      solution: contextProfile.solution || "",
      stage: contextProfile.stage
        ? contextProfile.stage.charAt(0).toUpperCase() + contextProfile.stage.slice(1)
        : "",
      industry: contextProfile.industry
        ? contextProfile.industry === "saas"
          ? "SaaS"
          : contextProfile.industry === "ai"
          ? "AI"
          : contextProfile.industry === "ecommerce"
          ? "E-commerce"
          : contextProfile.industry.charAt(0).toUpperCase() + contextProfile.industry.slice(1)
        : "",
      business_model: contextProfile.business_model || "",
      traction: contextProfile.traction || "",
      location: contextProfile.location || "",
      website: contextProfile.website || "",
      year_founded: contextProfile.year_founded || "",
      team_size: contextProfile.team_size || "",
      funding_goal: contextProfile.funding_goal || "",
      funding_stage: contextProfile.funding_stage || "",
      logo_url: contextProfile.logo_url || "",
      deck_url: contextProfile.deck_url || "",
      founder_name: contextProfile.founder_name || "",
      founder_role: contextProfile.founder_role || "",
      founder_bio: contextProfile.founder_bio || "",
      founder_linkedin: contextProfile.founder_linkedin || "",
      founder_twitter: contextProfile.founder_twitter || "",
      founder_photo_url: contextProfile.founder_photo_url || "",
      founder_achievements: contextProfile.founder_achievements || "",
      founder_previous_startups: contextProfile.founder_previous_startups || "",
      founder_skills: contextProfile.founder_skills || "",
      founder_experience: contextProfile.founder_experience || [],
      founder_education: contextProfile.founder_education || [],
    });
  }, [contextProfile]);

  const update = useCallback((field: keyof ProfileData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    const error = await saveProfileToDb(data, user.id);
    if (!error) {
      setSaved(true);
      // Update context cache immediately — no refetch needed
      updateProfileCache(data);
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const url = await uploadFile("logos", user.id, file);
    if (url) update("logo_url", url);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const url = await uploadFile("logos", user.id, file);
    if (url) update("founder_photo_url", url);
  };

  const handleDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = await uploadFile("decks", user.id, file);
    if (path) update("deck_url", path);
  };

  const addExperience = () => {
    update("founder_experience", [
      ...data.founder_experience,
      { id: generateId(), role: "", company: "", year_start: "", year_end: "" },
    ]);
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    update("founder_experience", data.founder_experience.map((e) =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const removeExperience = (id: string) => {
    update("founder_experience", data.founder_experience.filter((e) => e.id !== id));
  };

  const addEducation = () => {
    update("founder_education", [
      ...data.founder_education,
      { id: generateId(), degree: "", school: "", year: "" },
    ]);
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    update("founder_education", data.founder_education.map((e) =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const removeEducation = (id: string) => {
    update("founder_education", data.founder_education.filter((e) => e.id !== id));
  };

  if (profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ── Sticky Action Bar ── */}
      <div style={styles.actionBar}>
        <div style={styles.actionBarLeft}>
          <span style={styles.actionBarTitle}>Edit Profile</span>
          {saved && <span style={styles.savedBadge}>✓ Saved</span>}
        </div>
        <div style={styles.actionBarRight}>
          <button style={styles.previewBtn} onClick={() => router.push("/preview")}>
            <Eye size={13} />
            Preview
          </button>
          <button
            style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={13} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabsBar}>
        {(["startup", "founder"] as EditTab[]).map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "startup" ? "Startup" : "Founder CV"}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* ── Startup Tab ── */}
        {activeTab === "startup" && (
          <div style={styles.sections}>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Identity</h2>
              <p style={styles.cardSubtitle}>Basic information about your startup.</p>

              <div style={styles.logoUploadRow}>
                <div style={styles.logoBox}>
                  {data.logo_url ? (
                    <img src={data.logo_url} alt="logo" style={styles.logoImg} />
                  ) : (
                    <span style={styles.logoInitial}>
                      {data.startup_name?.[0]?.toUpperCase() || "X"}
                    </span>
                  )}
                </div>
                <div>
                  <button style={styles.uploadBtn} onClick={() => logoRef.current?.click()}>
                    <Upload size={13} />Upload Logo
                  </button>
                  <p style={styles.hint}>PNG or JPG, max 2MB</p>
                  <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                </div>
              </div>

              <FieldLabel label="Startup Name" />
              <input style={styles.input} value={data.startup_name} onChange={(e) => update("startup_name", e.target.value)} placeholder="e.g. Xeero" />

              <FieldLabel label="Tagline" tooltipKey="tagline" />
              <input style={styles.input} value={data.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="e.g. From idea to funding, one link." />

              <FieldLabel label="Website" />
              <input style={styles.input} value={data.website} onChange={(e) => update("website", e.target.value)} placeholder="https://yourstartup.com" />

              <div style={styles.twoCol}>
                <div style={styles.colItem}>
                  <FieldLabel label="Year Founded" />
                  <input style={styles.input} value={data.year_founded} onChange={(e) => update("year_founded", e.target.value)} placeholder="e.g. 2024" />
                </div>
                <div style={styles.colItem}>
                  <FieldLabel label="Team Size" />
                  <input style={styles.input} value={data.team_size} onChange={(e) => update("team_size", e.target.value)} placeholder="e.g. 3" />
                </div>
              </div>

              <FieldLabel label="Location" />
              <input style={styles.input} value={data.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Lagos, Nigeria" />
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Problem & Solution</h2>
              <p style={styles.cardSubtitle}>Help investors understand what you're solving.</p>

              <FieldLabel label="The Problem" tooltipKey="problem" />
              <textarea style={styles.textarea} value={data.problem} onChange={(e) => update("problem", e.target.value)} placeholder="What pain point does your startup address?" />

              <FieldLabel label="Your Solution" tooltipKey="solution" />
              <textarea style={styles.textarea} value={data.solution} onChange={(e) => update("solution", e.target.value)} placeholder="How does your startup solve it?" />
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Traction & Market</h2>
              <p style={styles.cardSubtitle}>Numbers build credibility.</p>

              <FieldLabel label="Traction" tooltipKey="traction" />
              <textarea style={styles.textarea} value={data.traction} onChange={(e) => update("traction", e.target.value)} placeholder="e.g. 500 waitlist signups, $10k MRR" />

              <FieldLabel label="Business Model" tooltipKey="business_model" />
              <input style={styles.input} value={data.business_model} onChange={(e) => update("business_model", e.target.value)} placeholder="e.g. SaaS subscription at $9/mo" />

              <div style={styles.twoCol}>
                <div style={styles.colItem}>
                  <FieldLabel label="Stage" />
                  <select style={styles.select} value={data.stage} onChange={(e) => update("stage", e.target.value)}>
                    <option value="">Select stage</option>
                    <option value="Idea">Idea</option>
                    <option value="Building">Building</option>
                    <option value="Launched">Launched</option>
                    <option value="Scaling">Scaling</option>
                  </select>
                </div>
                <div style={styles.colItem}>
                  <FieldLabel label="Industry" />
                  <select style={styles.select} value={data.industry} onChange={(e) => update("industry", e.target.value)}>
                    <option value="">Select industry</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Healthtech">Healthtech</option>
                    <option value="Edtech">Edtech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="SaaS">SaaS</option>
                    <option value="AI">AI</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Fundraising</h2>
              <p style={styles.cardSubtitle}>Let investors know what you're looking for.</p>

              <div style={styles.twoCol}>
                <div style={styles.colItem}>
                  <FieldLabel label="Funding Stage" />
                  <select style={styles.select} value={data.funding_stage} onChange={(e) => update("funding_stage", e.target.value)}>
                    <option value="">Select stage</option>
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Bootstrapped">Bootstrapped</option>
                  </select>
                </div>
                <div style={styles.colItem}>
                  <FieldLabel label="Funding Goal" tooltipKey="funding_goal" />
                  <input style={styles.input} value={data.funding_goal} onChange={(e) => update("funding_goal", e.target.value)} placeholder="e.g. $500,000" />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Pitch Deck</h2>
              <p style={styles.cardSubtitle}>Upload your deck or build one with Xeero.</p>

              <div style={styles.deckGrid}>
                <div style={styles.deckOption}>
                  <div style={styles.deckOptionIcon}>
                    <FileText size={20} color="#111111" />
                  </div>
                  <h3 style={styles.deckOptionTitle}>Upload your deck</h3>
                  <p style={styles.deckOptionText}>Upload your existing pitch deck as a PDF.</p>
                  {data.deck_url ? (
                    <div style={styles.deckUploadedRow}>
                      <span style={styles.deckUploadedText}>✓ Deck uploaded</span>
                      <button style={styles.deckReplaceBtn} onClick={() => deckRef.current?.click()}>Replace</button>
                    </div>
                  ) : (
                    <button style={styles.uploadBtn} onClick={() => deckRef.current?.click()}>
                      <Upload size={13} />Upload PDF
                    </button>
                  )}
                  <input ref={deckRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleDeckUpload} />
                  {data.deck_url && <DeckPreview deckUrl={data.deck_url} />}
                </div>

                <div style={styles.deckDivider} />

                <div style={{ ...styles.deckOption, opacity: 0.5 }}>
                  <div style={{ ...styles.deckOptionIcon, backgroundColor: "#f5f5f5" }}>
                    <Sparkles size={20} color="#aaaaaa" />
                  </div>
                  <h3 style={{ ...styles.deckOptionTitle, color: "#aaaaaa" }}>Build with Xeero</h3>
                  <p style={styles.deckOptionText}>We'll guide you slide by slide on what a great pitch deck looks like.</p>
                  <button style={styles.comingSoonBtn} disabled>Coming Soon</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Founder CV Tab ── */}
        {activeTab === "founder" && (
          <div style={styles.sections}>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Basic Info</h2>
              <p style={styles.cardSubtitle}>Who are you?</p>

              <div style={styles.logoUploadRow}>
                <div style={styles.photoCircle}>
                  {data.founder_photo_url ? (
                    <img src={data.founder_photo_url} alt="photo" style={styles.logoImg} />
                  ) : (
                    <span style={styles.logoInitial}>
                      {data.founder_name?.[0]?.toUpperCase() || "F"}
                    </span>
                  )}
                </div>
                <div>
                  <button style={styles.uploadBtn} onClick={() => photoRef.current?.click()}>
                    <Upload size={13} />Upload Photo
                  </button>
                  <p style={styles.hint}>PNG or JPG, max 2MB</p>
                  <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                </div>
              </div>

              <FieldLabel label="Full Name" />
              <input style={styles.input} value={data.founder_name} onChange={(e) => update("founder_name", e.target.value)} placeholder="e.g. John Doe" />

              <FieldLabel label="Role" />
              <input style={styles.input} value={data.founder_role} onChange={(e) => update("founder_role", e.target.value)} placeholder="e.g. CEO & Co-founder" />

              <FieldLabel label="Bio" tooltipKey="founder_bio" />
              <textarea style={styles.textarea} value={data.founder_bio} onChange={(e) => update("founder_bio", e.target.value)} placeholder="2-3 sentences about yourself" />

              <div style={styles.twoCol}>
                <div style={styles.colItem}>
                  <FieldLabel label="LinkedIn" />
                  <input style={styles.input} value={data.founder_linkedin} onChange={(e) => update("founder_linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div style={styles.colItem}>
                  <FieldLabel label="Twitter / X" />
                  <input style={styles.input} value={data.founder_twitter} onChange={(e) => update("founder_twitter", e.target.value)} placeholder="https://x.com/..." />
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <div>
                  <h2 style={styles.cardTitle}>Experience</h2>
                  <p style={styles.cardSubtitle}>Previous roles and companies.</p>
                </div>
                <button style={styles.addBtn} onClick={addExperience}>
                  <Plus size={13} />Add
                </button>
              </div>
              {data.founder_experience.length === 0 && (
                <p style={styles.emptyText}>No experience added yet.</p>
              )}
              {data.founder_experience.map((exp) => (
                <div key={exp.id} style={styles.entryCard}>
                  <div style={styles.twoCol}>
                    <div style={styles.colItem}>
                      <label style={styles.label}>Role</label>
                      <input style={styles.input} value={exp.role} onChange={(e) => updateExperience(exp.id, "role", e.target.value)} placeholder="e.g. CTO" />
                    </div>
                    <div style={styles.colItem}>
                      <label style={styles.label}>Company</label>
                      <input style={styles.input} value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="e.g. Google" />
                    </div>
                  </div>
                  <div style={styles.twoCol}>
                    <div style={styles.colItem}>
                      <label style={styles.label}>From</label>
                      <input style={styles.input} value={exp.year_start} onChange={(e) => updateExperience(exp.id, "year_start", e.target.value)} placeholder="2020" />
                    </div>
                    <div style={styles.colItem}>
                      <label style={styles.label}>To</label>
                      <input style={styles.input} value={exp.year_end} onChange={(e) => updateExperience(exp.id, "year_end", e.target.value)} placeholder="Present" />
                    </div>
                  </div>
                  <button style={styles.removeBtn} onClick={() => removeExperience(exp.id)}>
                    <Trash2 size={12} />Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeaderRow}>
                <div>
                  <h2 style={styles.cardTitle}>Education</h2>
                  <p style={styles.cardSubtitle}>Degrees and institutions.</p>
                </div>
                <button style={styles.addBtn} onClick={addEducation}>
                  <Plus size={13} />Add
                </button>
              </div>
              {data.founder_education.length === 0 && (
                <p style={styles.emptyText}>No education added yet.</p>
              )}
              {data.founder_education.map((edu) => (
                <div key={edu.id} style={styles.entryCard}>
                  <label style={styles.label}>Degree</label>
                  <input style={styles.input} value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} placeholder="e.g. BSc Computer Science" />
                  <div style={styles.twoCol}>
                    <div style={styles.colItem}>
                      <label style={styles.label}>School</label>
                      <input style={styles.input} value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} placeholder="e.g. University of Lagos" />
                    </div>
                    <div style={styles.colItem}>
                      <label style={styles.label}>Year</label>
                      <input style={styles.input} value={edu.year} onChange={(e) => updateEducation(edu.id, "year", e.target.value)} placeholder="e.g. 2019" />
                    </div>
                  </div>
                  <button style={styles.removeBtn} onClick={() => removeEducation(edu.id)}>
                    <Trash2 size={12} />Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Achievements & Skills</h2>
              <p style={styles.cardSubtitle}>What makes you stand out?</p>

              <FieldLabel label="Achievements" tooltipKey="founder_achievements" />
              <textarea style={styles.textarea} value={data.founder_achievements} onChange={(e) => update("founder_achievements", e.target.value)} placeholder="e.g. Forbes 30 under 30, YC Alumni, TechCrunch featured" />

              <FieldLabel label="Previous Startups" />
              <textarea style={styles.textarea} value={data.founder_previous_startups} onChange={(e) => update("founder_previous_startups", e.target.value)} placeholder="e.g. Founded PayApp (acquired 2022)" />

              <FieldLabel label="Skills" tooltipKey="founder_skills" />
              <input style={styles.input} value={data.founder_skills} onChange={(e) => update("founder_skills", e.target.value)} placeholder="e.g. Product, Engineering, Fundraising, Sales" />
              <p style={styles.hint}>Separate skills with commas</p>
            </div>

          </div>
        )}

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
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#cccccc",
  },
  actionBar: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #f0f0f0",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: "50px",
    zIndex: 100,
  },
  actionBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  actionBarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111111",
  },
  savedBadge: {
    fontSize: "12px",
    color: "#38a169",
    fontWeight: "500",
    backgroundColor: "#f0fff4",
    padding: "2px 8px",
    borderRadius: "99px",
    border: "1px solid #c6f6d5",
  },
  actionBarRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  previewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#111111",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    cursor: "pointer",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#111111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tabsBar: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    padding: "0 24px",
    position: "sticky",
    top: "98px",
    zIndex: 90,
  },
  tab: {
    padding: "13px 20px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#aaaaaa",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
  },
  tabActive: {
    color: "#111111",
    borderBottom: "2px solid #111111",
    fontWeight: "600",
  },
  content: {
    maxWidth: "680px",
    margin: "0 auto",
    padding: "24px",
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111111",
    margin: "0 0 4px 0",
  },
  cardSubtitle: {
    fontSize: "12px",
    color: "#aaaaaa",
    margin: "0 0 20px 0",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "4px",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#111111",
  },
  input: {
    width: "100%",
    padding: "10px 13px",
    fontSize: "13px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "14px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    color: "#111111",
  },
  textarea: {
    width: "100%",
    padding: "10px 13px",
    fontSize: "13px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "14px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    minHeight: "96px",
    resize: "vertical",
    fontFamily: "inherit",
    color: "#111111",
    lineHeight: "1.6",
  },
  select: {
    width: "100%",
    padding: "10px 13px",
    fontSize: "13px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "14px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    appearance: "none",
    color: "#111111",
  },
  twoCol: {
    display: "flex",
    gap: "14px",
  },
  colItem: {
    flex: 1,
  },
  hint: {
    fontSize: "11px",
    color: "#bbbbbb",
    margin: "0",
  },
  logoUploadRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  logoBox: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    backgroundColor: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  photoCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoInitial: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#111111",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "4px",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#111111",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  removeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#e53e3e",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
    padding: "0",
  },
  entryCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "10px",
    border: "1px solid #f0f0f0",
  },
  emptyText: {
    fontSize: "13px",
    color: "#cccccc",
    textAlign: "center",
    padding: "20px 0",
    margin: "0",
  },
  deckGrid: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  deckOption: {
    flex: 1,
    minWidth: "180px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  deckOptionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deckOptionTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111111",
    margin: "0",
  },
  deckOptionText: {
    fontSize: "12px",
    color: "#888888",
    lineHeight: "1.6",
    margin: "0",
  },
  deckDivider: {
    width: "1px",
    backgroundColor: "#f0f0f0",
    alignSelf: "stretch",
  },
  deckUploadedRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  deckUploadedText: {
    fontSize: "12px",
    color: "#38a169",
    fontWeight: "500",
  },
  deckReplaceBtn: {
    fontSize: "12px",
    color: "#888888",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  comingSoonBtn: {
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#aaaaaa",
    backgroundColor: "#f5f5f5",
    border: "1px solid #eeeeee",
    borderRadius: "8px",
    cursor: "not-allowed",
    alignSelf: "flex-start",
  },
};