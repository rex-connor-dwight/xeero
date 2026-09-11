"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

export default function Hero({ onRegister }: { onRegister: () => void }) {
  const handleLearnMore = () => {
    const el = document.getElementById("about");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" style={styles.section}>
      <img src="/venture-room/hero-bg.png" alt="" style={styles.bgImage} />
      <div style={styles.gradientOverlay} />

      <img src="/venture-room/connor-hero.png" alt="Connor" className="vr-hero-photo" style={styles.heroPhoto} />

      <img src="/venture-room/arrow-plane.svg" alt="" style={styles.arrowVector} />

      <div style={styles.withConnorWrap}>
        <p style={styles.withConnorP}>with</p> <p style={styles.withConnorP}>Connor</p>
      </div>

      <div style={styles.content}>
        <p style={styles.theLabel}>THE</p>
        <h1 style={styles.title} className="vr-hero-title">
          <span style={styles.titleAccent}>VENTURE</span>
          <br />
          <span style={styles.titleWhite}>ROOM</span>
        </h1>

        <div style={styles.eventInfo}>
          <p style={styles.eventDate}>26TH SEP</p>
          <p style={styles.eventTime}>11:00am WAT</p>
          <p style={styles.eventVenue}>LAGOS</p>
        </div>
      </div>

      <div style={styles.ctaBar}>
        <button style={styles.primaryBtn} onClick={onRegister}>
          Register for The Venture Room
        </button>
        <button style={styles.secondaryBtn} onClick={handleLearnMore}>
          Learn More
        </button>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .vr-hero-title { font-size: clamp(52px, 13vw, 76px) !important; }
        }
      `}</style>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "100px 60px 44px 60px",
    overflow: "hidden",
    backgroundColor: VR_COLORS.primary,
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent 0%, ${VR_COLORS.primary}CC 45%, ${VR_COLORS.primary}F2 70%)`,
    zIndex: 1,
    pointerEvents: "none",
  },
  heroPhoto: {
    position: "absolute",
    bottom: 0,
    left: "-2%",
    height: "88vh",
    width: "auto",
    objectFit: "contain",
    objectPosition: "left bottom",
    zIndex: 1,
  },
  arrowVector: {
    position: "absolute",
    top: "3%",
    right: "8%",
    width: "min(38%, 340px)",
    zIndex: 2,
    pointerEvents: "none",
  },
  withConnorWrap: {
    position: "absolute",
    bottom: "6%",
    left: "6%",
    zIndex: 2,
  },
  withConnorP: {
    display: "inline",
    fontFamily: VR_FONTS.body,
    fontStyle: "italic",
    fontSize: "clamp(20px, 3vw, 30px)",
    fontWeight: 700,
    color: VR_COLORS.primary,
    margin: "0",
  },
  content: {
    position: "relative",
    zIndex: 3,
    marginLeft: "auto",
    maxWidth: "560px",
    textAlign: "right",
    paddingTop: "20px",
    paddingRight: "24px",
  },
  theLabel: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(20px, 3vw, 30px)",
    color: VR_COLORS.white,
    margin: "0",
    letterSpacing: "0.02em",
  },
  title: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(44px, 9vw, 96px)",
    lineHeight: "0.95",
    margin: "8px 0 40px 0",
  },
  titleAccent: {
    color: VR_COLORS.accent,
  },
  titleWhite: {
    color: VR_COLORS.white,
  },
  eventInfo: {
    marginBottom: "0",
  },
  eventDate: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(26px, 4vw, 38px)",
    color: VR_COLORS.white,
    margin: "0 0 2px 0",
  },
  eventTime: {
    fontFamily: VR_FONTS.body,
    fontSize: "18px",
    fontWeight: 500,
    color: VR_COLORS.white,
    opacity: 0.9,
    margin: "0 0 6px 0",
  },
  eventVenue: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(26px, 4vw, 38px)",
    color: VR_COLORS.white,
    margin: "0",
  },
  ctaBar: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginLeft: "auto",
    marginRight: "24px",
    justifyContent: "flex-end",
  },
  primaryBtn: {
    fontFamily: VR_FONTS.body,
    padding: "15px 30px",
    fontSize: "14px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    backgroundColor: VR_COLORS.white,
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  secondaryBtn: {
    fontFamily: VR_FONTS.body,
    padding: "15px 30px",
    fontSize: "14px",
    fontWeight: 700,
    color: VR_COLORS.white,
    backgroundColor: "transparent",
    border: `2px solid ${VR_COLORS.white}`,
    borderRadius: "10px",
    cursor: "pointer",
  },
};