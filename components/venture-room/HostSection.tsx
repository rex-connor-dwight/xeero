"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

export default function HostSection() {
  return (
    <section id="host" style={styles.section} className="vr-host-section">
      <img src="/venture-room/architect-bg.png" alt="Connor" style={styles.bgImage} className="vr-host-bg" />
      <div style={styles.overlay} />

      <div style={styles.content} className="vr-host-content">
        <span style={styles.eyebrow}>Meet The Venture Architect</span>
        <h2 style={styles.name}>Connor</h2>
        <p style={styles.role}>Venture Architect</p>

        <p style={styles.bio}>
          Connor is a Venture Architect, software and blockchain engineer, startup advisor,
          and Venture Partner at Pordware. He works with founders to turn ideas into ventures,
          identify blind spots, validate opportunities, and build the systems required to grow.
        </p>

        <a href="https://instagram.com/that.venture.architect" style={styles.connectBtn}>
          Connect with Connor
        </a>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .vr-host-section {
            min-height: 100vh !important;
          }
          .vr-host-bg {
            object-position: left center !important;
          }
          .vr-host-content {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 24px 60px 24px !important;
            justify-content: flex-end !important;
          }
        }
      `}</style>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    position: "relative",
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#0a0a0f",
  },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "20% center",
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 2,
    width: "50%",
    marginLeft: "auto",
    padding: "0 60px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
  },
  eyebrow: {
    fontFamily: VR_FONTS.body,
    fontSize: "13px",
    fontWeight: 700,
    color: VR_COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    display: "block",
    marginBottom: "16px",
  },
  name: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(38px, 6vw, 56px)",
    color: VR_COLORS.white,
    margin: "0 0 4px 0",
  },
  role: {
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 800,
    color: VR_COLORS.white,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 24px 0",
  },
  bio: {
    fontFamily: VR_FONTS.body,
    fontSize: "17px",
    fontWeight: 500,
    color: VR_COLORS.white,
    opacity: 0.9,
    lineHeight: "1.7",
    margin: "0 0 28px 0",
  },
  connectBtn: {
    display: "inline-block",
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 800,
    color: VR_COLORS.primary,
    backgroundColor: VR_COLORS.white,
    padding: "14px 30px",
    borderRadius: "10px",
    textDecoration: "none",
    alignSelf: "flex-start",
  },
};