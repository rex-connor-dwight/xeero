"use client";

import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Link2, Users, FileText, Lock, CheckCircle } from "lucide-react";

function HeroPattern() {
  return (
    <svg
      style={styles.heroSvg}
      viewBox="0 0 1200 600"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <line x1="600" y1="700" x2="-200" y2="-100" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="0" y2="-150" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="200" y2="-180" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="400" y2="-200" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="600" y2="-200" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="800" y2="-200" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="1000" y2="-180" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="1200" y2="-150" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="1400" y2="-100" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <ellipse cx="600" cy="700" rx="500" ry="300" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
      <ellipse cx="600" cy="700" rx="380" ry="220" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
      <ellipse cx="600" cy="700" rx="250" ry="140" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
      <circle cx="200" cy="100" r="150" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
      <circle cx="1000" cy="150" r="200" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
    </svg>
  );
}

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

export default function Hero() {
  const router = useRouter();

  const tabs = ["Overview", "Team", "Deck", "Data Room"];

  return (
    <section style={styles.hero}>
      <HeroPattern />
      <div style={styles.heroContent}>

        <motion.div
          style={styles.heroBadge}
          initial="hidden" animate="show" custom={0} variants={fadeUp}
        >
          <span style={styles.heroBadgeDot} />
          Built for founders, by a founder
        </motion.div>

        <motion.h1
          style={styles.heroHeadline}
          initial="hidden" animate="show" custom={1} variants={fadeUp}
        >
          Everything your startup<br />
          needs in one link.
        </motion.h1>

        <motion.p
          style={styles.heroSubheadline}
          initial="hidden" animate="show" custom={2} variants={fadeUp}
        >
          Your profile, pitch deck, waitlist, data room, and validation score —
          live at one link, updating in real time as your startup grows.
        </motion.p>

        <motion.div
          style={styles.heroCtas}
          initial="hidden" animate="show" custom={3} variants={fadeUp}
        >
          <button style={styles.heroPrimaryBtn} onClick={() => router.push("/auth")}>
            Build your profile, it's free →
          </button>
          <p style={styles.heroNote}>No credit card required. Go live for $9.</p>
        </motion.div>

        {/* Signature moment — the live product card, booting up */}
        <motion.div
          style={styles.heroCard}
          className="hero-card-mobile"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={styles.heroCardHeader}>
            <motion.div
              style={styles.heroCardCover}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            />
            <motion.div
              style={styles.heroCardLogo}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: "backOut" }}
            >
              <span style={styles.heroCardLogoText}>XR</span>
            </motion.div>
          </div>

          <div style={styles.heroCardBody}>
            <motion.div
              style={styles.heroCardNameRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              <span style={styles.heroCardName}>Xeero</span>
              <span style={styles.heroCardBadge}>
                <span style={styles.heroCardBadgeDot} />
                Live
              </span>
            </motion.div>

            <motion.p
              style={styles.heroCardTagline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              From idea to funding, one link.
            </motion.p>

            <motion.div
              style={styles.heroCardPills}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15, duration: 0.4 }}
            >
              <span style={styles.heroCardPill}>SaaS</span>
              <span style={styles.heroCardPill}>Building</span>
              <span style={styles.heroCardValidationPill}>
                <CheckCircle size={10} />
                Validated 82/100
              </span>
            </motion.div>

            <div style={styles.heroCardTabs}>
              {tabs.map((tab, i) => (
                <motion.span
                  key={tab}
                  style={{ ...styles.heroCardTab, ...(i === 0 ? styles.heroCardTabActive : {}) }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.25 + i * 0.08, duration: 0.35 }}
                >
                  {tab === "Data Room" && <Lock size={9} style={{ marginRight: 4 }} />}
                  {tab}
                </motion.span>
              ))}
            </div>

            <motion.div
              style={styles.heroCardStatsRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.4 }}
            >
              <div style={styles.heroCardStat}>
                <Users size={11} color="#888888" />
                <span style={styles.heroCardStatText}>67 on waitlist</span>
              </div>
              <div style={styles.heroCardStat}>
                <FileText size={11} color="#888888" />
                <span style={styles.heroCardStatText}>Deck attached</span>
              </div>
              <div style={styles.heroCardStat}>
                <Link2 size={11} color="#888888" />
                <span style={styles.heroCardStatText}>xeero.me/xeero</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  hero: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px 24px" },
  heroSvg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: "680px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  heroBadge: { display: "flex", alignItems: "center", gap: "6px", padding: "5px 14px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "99px", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: "500", marginBottom: "24px" },
  heroBadgeDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#38a169", display: "inline-block" },
  heroHeadline: { fontSize: "52px", fontWeight: "800", color: "#ffffff", lineHeight: "1.1", margin: "0 0 20px 0", letterSpacing: "-0.02em" },
  heroSubheadline: { fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: "0 0 36px 0", maxWidth: "520px" },
  heroCtas: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "48px" },
  heroPrimaryBtn: { padding: "14px 28px", fontSize: "15px", fontWeight: "700", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer" },
  heroNote: { fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0" },
  heroCard: { width: "100%", maxWidth: "480px", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" },
  heroCardHeader: { position: "relative", height: "80px" },
  heroCardCover: { width: "100%", height: "100%", background: "linear-gradient(135deg, #111111 0%, #1a1a2e 100%)" },
  heroCardLogo: { position: "absolute", bottom: "-20px", left: "20px", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#111111", border: "3px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
  heroCardLogoText: { fontSize: "14px", fontWeight: "700", color: "#ffffff" },
  heroCardBody: { padding: "28px 20px 20px 20px" },
  heroCardNameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  heroCardName: { fontSize: "18px", fontWeight: "700", color: "#111111" },
  heroCardBadge: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "2px 8px", borderRadius: "99px" },
  heroCardBadgeDot: { width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#38a169" },
  heroCardTagline: { fontSize: "13px", color: "#666666", margin: "0 0 12px 0" },
  heroCardPills: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" },
  heroCardPill: { padding: "3px 10px", backgroundColor: "#f5f5f5", borderRadius: "99px", fontSize: "11px", color: "#555555", fontWeight: "500" },
  heroCardValidationPill: { display: "flex", alignItems: "center", gap: "3px", padding: "3px 10px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "99px", fontSize: "11px", color: "#38a169", fontWeight: "600" },
  heroCardTabs: { display: "flex", gap: "6px", borderTop: "1px solid #f5f5f5", paddingTop: "14px", marginBottom: "14px" },
  heroCardTab: { display: "flex", alignItems: "center", padding: "5px 12px", fontSize: "11px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px" },
  heroCardTabActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111", fontWeight: "600" },
  heroCardStatsRow: { display: "flex", gap: "14px", flexWrap: "wrap" },
  heroCardStat: { display: "flex", alignItems: "center", gap: "5px" },
  heroCardStatText: { fontSize: "11px", color: "#888888", fontWeight: "500" },
};