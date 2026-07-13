"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Flame,
  Users,
  DollarSign,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Link2,
  AlertCircle,
} from "lucide-react";

type Track = "interest" | "funding";

export default function FiresidePage() {
  const [track, setTrack] = useState<Track>("interest");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [notLiveWarning, setNotLiveWarning] = useState("");
  const [signupCount, setSignupCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("fireside_signups")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setSignupCount(count || 0));
  }, []);

  const handleSubmit = async () => {
    if (!name || !email) return;
    setSubmitting(true);
    setError("");
    setNotLiveWarning("");

    if (track === "interest") {
      const { error: dbError } = await supabase.from("fireside_signups").insert({
        name, email, track: "interest",
      });
      if (dbError) {
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
      setSubmitting(false);
      return;
    }

    if (!slug) {
      setError("Please enter your Xeero profile link.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-fireside-slug`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, name, email }),
        }
      );
      const data = await res.json();

      if (data.error === "not_found") {
        setError(data.message);
        setSubmitting(false);
        return;
      }

      if (data.error === "not_live") {
        setNotLiveWarning(data.message);
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <CheckCircle size={28} color="#38a169" />
          </div>
          <h1 style={styles.successTitle}>You're on the list.</h1>
          <p style={styles.successText}>
            {track === "funding"
              ? "You're registered for the funding track. We'll be in touch as soon as a date and venue are locked in."
              : "We'll email you as soon as a date and venue are locked in."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Hero — same gradient treatment used across dashboard/preview */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Flame size={13} color="#ffffff" />
            Lagos · Founder Fireside
          </div>
          <h1 style={styles.heroTitle}>
            A room of founders.<br />
            A few investors listening.<br />
            One real conversation.
          </h1>
          <p style={styles.heroSub}>
            No date. No venue yet. This is a validation page — if enough founders
            want this, it happens. Register your interest below.
          </p>
          {signupCount !== null && (
            <div style={styles.progressRow}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${Math.min((signupCount / 500) * 100, 100)}%` }} />
              </div>
              <span style={styles.progressText}>{signupCount} / 500 signed up</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.body}>

        <div style={styles.section}>
          <p style={styles.sectionLabel}>What this is</p>
          <p style={styles.sectionText}>
            A founder-led fireside chat, not a pitch competition, not a demo day.
            Founders talking to founders, with a small group of investors in the
            room to genuinely engage, not judge from a stage.
          </p>
        </div>

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}><Users size={18} color="#111111" /></div>
            <p style={styles.cardTitle}>Real founders in the room</p>
            <p style={styles.cardText}>A small, curated group. Not a crowd, a conversation.</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}><MessageCircle size={18} color="#111111" /></div>
            <p style={styles.cardTitle}>Investors who listen</p>
            <p style={styles.cardText}>A handful of investors present to engage directly, not evaluate from a distance.</p>
          </div>
          <div style={{ ...styles.card, ...styles.cardHighlight }}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#f0fff4" }}>
              <DollarSign size={18} color="#38a169" />
            </div>
            <p style={styles.cardTitle}>$200,000 in the room</p>
            <p style={styles.cardText}>Capital ready to back the right founder in that conversation.</p>
          </div>
        </div>

        <div style={styles.formSection}>
          <p style={styles.sectionLabel}>Register your interest</p>

          <div style={styles.trackToggle}>
            <button
              style={{ ...styles.trackBtn, ...(track === "interest" ? styles.trackBtnActive : {}) }}
              onClick={() => { setTrack("interest"); setError(""); setNotLiveWarning(""); }}
            >
              Just interested
            </button>
            <button
              style={{ ...styles.trackBtn, ...(track === "funding" ? styles.trackBtnActive : {}) }}
              onClick={() => { setTrack("funding"); setError(""); setNotLiveWarning(""); }}
            >
              I want to be considered for funding
            </button>
          </div>

          {track === "funding" && (
            <div style={styles.trackNote}>
              <AlertCircle size={13} color="#d69e2e" />
              <span>Requires a live Xeero profile. If yours isn't live yet, you'll be prompted to publish it first.</span>
            </div>
          )}

          <input
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {track === "funding" && (
            <div style={styles.slugInputWrapper}>
              <Link2 size={13} color="#aaaaaa" style={styles.slugIcon} />
              <input
                style={styles.slugInput}
                placeholder="xeero.me/yourstartup"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          )}

          {notLiveWarning && (
            <div style={styles.warningBox}>
              <AlertCircle size={13} color="#d69e2e" />
              <span style={styles.warningText}>{notLiveWarning}</span>
            </div>
          )}

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            style={{ ...styles.submitBtn, opacity: name && email && !submitting ? 1 : 0.5 }}
            onClick={handleSubmit}
            disabled={!name || !email || submitting}
          >
            {submitting ? "Submitting..." : "Register"}
            {!submitting && <ArrowRight size={14} />}
          </button>
        </div>

      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  hero: {
    background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)",
    padding: "80px 24px 56px 24px",
  },
  heroContent: { maxWidth: "560px", margin: "0 auto", textAlign: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "99px", fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: "500", marginBottom: "20px" },
  heroTitle: { fontSize: "32px", fontWeight: "800", color: "#ffffff", lineHeight: "1.25", margin: "0 0 16px 0", letterSpacing: "-0.01em" },
  heroSub: { fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: "1.7", margin: "0 0 24px 0" },
  progressRow: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" },
  progressBar: { width: "100%", maxWidth: "320px", height: "5px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "99px", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#38a169", borderRadius: "99px", transition: "width 0.6s ease" },
  progressText: { fontSize: "11px", color: "rgba(255,255,255,0.4)" },
  body: { maxWidth: "760px", margin: "0 auto", padding: "40px 24px 80px 24px" },
  section: { maxWidth: "560px", margin: "0 auto 32px auto" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  sectionText: { fontSize: "14px", color: "#666666", lineHeight: "1.8", margin: "0" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "40px" },
  card: { backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  cardHighlight: { backgroundColor: "#f9fefb", border: "1px solid #c6f6d5" },
  cardIcon: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" },
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  cardText: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0" },
  formSection: { maxWidth: "440px", margin: "0 auto", backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  trackToggle: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" },
  trackBtn: { padding: "12px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "10px", cursor: "pointer", textAlign: "left" },
  trackBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  trackNote: { display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "11px", color: "#d69e2e", marginBottom: "14px", lineHeight: "1.5" },
  input: { width: "100%", padding: "12px 14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", marginBottom: "10px" },
  slugInputWrapper: { position: "relative", marginBottom: "10px" },
  slugIcon: { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" },
  slugInput: { width: "100%", padding: "12px 14px 12px 34px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  warningBox: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 14px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "10px", marginBottom: "12px" },
  warningText: { fontSize: "12px", color: "#92610a", lineHeight: "1.6" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0 0 12px 0" },
  submitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", fontSize: "14px", fontWeight: "700", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  successCard: { maxWidth: "440px", margin: "80px auto 0 auto", backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "40px 28px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  successTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  successText: { fontSize: "14px", color: "#666666", lineHeight: "1.7", margin: "0" },
};