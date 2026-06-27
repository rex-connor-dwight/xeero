"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// ── Logic ──────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

async function saveProfile(data: ProfileData, userId: string) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ ...data, user_id: userId });
  return error;
}

async function checkSlugAvailable(slug: string) {
  const { data } = await supabase
    .from("profiles")
    .select("slug")
    .eq("slug", slug)
    .single();
  return !data;
}

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
  founder_name: string;
  founder_role: string;
  founder_bio: string;
  founder_linkedin: string;
  founder_twitter: string;
  slug: string;
};

// ── Component ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

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
    founder_name: "",
    founder_role: "",
    founder_bio: "",
    founder_linkedin: "",
    founder_twitter: "",
    slug: "",
  });

  const update = (field: keyof ProfileData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSlugCheck = async (slug: string) => {
    update("slug", slug);
    if (slug.length < 3) {
      setSlugAvailable(null);
      return;
    }
    const available = await checkSlugAvailable(slug);
    setSlugAvailable(available);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const err = await saveProfile(data, user.id);

    if (err) {
      setError(err.message);
    } else {
      router.push("/preview");
    }

    setLoading(false);
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoOuter}>
              <div style={styles.logoInner} />
            </div>
          </div>
          <div style={styles.stepText}>Step {step} of {TOTAL_STEPS}</div>
        </div>

        {/* ── Progress Bar ── */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        {/* ── Step 1 — Startup Identity ── */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h1 style={styles.heading}>What are you building?</h1>
            <p style={styles.subheading}>
              Start with the basics. You can always edit this later.
            </p>

            <label style={styles.label}>Startup Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Xeero"
              value={data.startup_name}
              onChange={(e) => update("startup_name", e.target.value)}
            />

            <label style={styles.label}>Tagline</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. From idea to funding, one link."
              value={data.tagline}
              onChange={(e) => update("tagline", e.target.value)}
            />
          </div>
        )}

        {/* ── Step 2 — Problem & Solution ── */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h1 style={styles.heading}>What problem are you solving?</h1>
            <p style={styles.subheading}>
              Be clear and specific. Investors fund solutions to real problems.
            </p>

            <label style={styles.label}>The Problem</label>
            <textarea
              style={styles.textarea}
              placeholder="What pain point does your startup address?"
              value={data.problem}
              onChange={(e) => update("problem", e.target.value)}
            />

            <label style={styles.label}>Your Solution</label>
            <textarea
              style={styles.textarea}
              placeholder="How does your startup solve it?"
              value={data.solution}
              onChange={(e) => update("solution", e.target.value)}
            />
          </div>
        )}

        {/* ── Step 3 — Stage & Industry ── */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h1 style={styles.heading}>Where are you right now?</h1>
            <p style={styles.subheading}>
              Help investors understand your current stage.
            </p>

            <label style={styles.label}>Stage</label>
            <select
              style={styles.select}
              value={data.stage}
              onChange={(e) => update("stage", e.target.value)}
            >
              <option value="">Select your stage</option>
              <option value="idea">Idea</option>
              <option value="building">Building</option>
              <option value="launched">Launched</option>
              <option value="scaling">Scaling</option>
            </select>

            <label style={styles.label}>Industry</label>
            <select
              style={styles.select}
              value={data.industry}
              onChange={(e) => update("industry", e.target.value)}
            >
              <option value="">Select your industry</option>
              <option value="fintech">Fintech</option>
              <option value="healthtech">Healthtech</option>
              <option value="edtech">Edtech</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="ai">AI</option>
              <option value="logistics">Logistics</option>
              <option value="other">Other</option>
            </select>

            <label style={styles.label}>Business Model</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Subscription, one-time fee, marketplace"
              value={data.business_model}
              onChange={(e) => update("business_model", e.target.value)}
            />
          </div>
        )}

        {/* ── Step 4 — Traction & Location ── */}
        {step === 4 && (
          <div style={styles.stepContent}>
            <h1 style={styles.heading}>Any early traction?</h1>
            <p style={styles.subheading}>
              Numbers build trust. Share whatever you have — even small wins count.
            </p>

            <label style={styles.label}>Traction</label>
            <textarea
              style={styles.textarea}
              placeholder="e.g. 200 waitlist signups, $5k MRR, 50 beta users"
              value={data.traction}
              onChange={(e) => update("traction", e.target.value)}
            />

            <label style={styles.label}>Location</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Lagos, Nigeria"
              value={data.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
        )}

        {/* ── Step 5 — Founder Profile ── */}
        {step === 5 && (
          <div style={styles.stepContent}>
            <h1 style={styles.heading}>Tell us about yourself.</h1>
            <p style={styles.subheading}>
              Investors bet on founders as much as ideas.
            </p>

            <label style={styles.label}>Your Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. John Doe"
              value={data.founder_name}
              onChange={(e) => update("founder_name", e.target.value)}
            />

            <label style={styles.label}>Your Role</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. CEO, CTO, Co-founder"
              value={data.founder_role}
              onChange={(e) => update("founder_role", e.target.value)}
            />

            <label style={styles.label}>Short Bio</label>
            <textarea
              style={styles.textarea}
              placeholder="2-3 sentences about your background"
              value={data.founder_bio}
              onChange={(e) => update("founder_bio", e.target.value)}
            />

            <label style={styles.label}>LinkedIn URL</label>
            <input
              style={styles.input}
              type="text"
              placeholder="https://linkedin.com/in/yourname"
              value={data.founder_linkedin}
              onChange={(e) => update("founder_linkedin", e.target.value)}
            />

            <label style={styles.label}>Twitter / X URL</label>
            <input
              style={styles.input}
              type="text"
              placeholder="https://x.com/yourhandle"
              value={data.founder_twitter}
              onChange={(e) => update("founder_twitter", e.target.value)}
            />
          </div>
        )}

        {/* ── Step 6 — Slug ── */}
        {step === 6 && (
          <div style={styles.stepContent}>
            <h1 style={styles.heading}>Claim your link.</h1>
            <p style={styles.subheading}>
              This will be your public profile URL.
            </p>

            <label style={styles.label}>Your Xeero Link</label>
            <div style={styles.slugWrapper}>
              <span style={styles.slugPrefix}>xeero.me/</span>
              <input
                style={styles.slugInput}
                type="text"
                placeholder="yourstartup"
                value={data.slug}
                onChange={(e) =>
                  handleSlugCheck(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
              />
            </div>

            {slugAvailable === true && (
              <p style={styles.slugAvailable}>✓ This link is available</p>
            )}
            {slugAvailable === false && (
              <p style={styles.slugTaken}>✗ This link is already taken</p>
            )}
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {/* ── Navigation ── */}
        <div style={styles.navigation}>
          {step > 1 && (
            <button style={styles.backButton} onClick={handleBack}>
              ← Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button style={styles.nextButton} onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button
              style={{
                ...styles.nextButton,
                opacity: slugAvailable ? 1 : 0.5,
              }}
              onClick={handleFinish}
              disabled={loading || !slugAvailable}
            >
              {loading ? "Saving..." : "Preview My Profile →"}
            </button>
          )}
        </div>

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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
  },
  logoOuter: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#111111",
  },
  stepText: {
    fontSize: "12px",
    color: "#999999",
    fontWeight: "500",
  },
  progressTrack: {
    width: "100%",
    height: "3px",
    backgroundColor: "#f0f0f0",
    borderRadius: "99px",
    marginBottom: "40px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#111111",
    borderRadius: "99px",
    transition: "width 0.3s ease",
  },
  stepContent: {
    marginBottom: "32px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111111",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "13px",
    color: "#666666",
    marginBottom: "28px",
    lineHeight: "1.6",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#111111",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    appearance: "none",
  },
  slugWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fafafa",
    marginBottom: "8px",
  },
  slugPrefix: {
    padding: "12px 14px",
    fontSize: "14px",
    color: "#999999",
    backgroundColor: "#f0f0f0",
    borderRight: "1px solid #e5e5e5",
    whiteSpace: "nowrap",
  },
  slugInput: {
    flex: 1,
    padding: "12px 14px",
    fontSize: "14px",
    border: "none",
    outline: "none",
    backgroundColor: "#fafafa",
  },
  slugAvailable: {
    fontSize: "13px",
    color: "#38a169",
    marginBottom: "8px",
  },
  slugTaken: {
    fontSize: "13px",
    color: "#e53e3e",
    marginBottom: "8px",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#666666",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
  },
  nextButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#111111",
    borderRadius: "8px",
    marginLeft: "auto",
  },
  error: {
    fontSize: "13px",
    color: "#e53e3e",
    marginBottom: "16px",
    textAlign: "center",
  },
};