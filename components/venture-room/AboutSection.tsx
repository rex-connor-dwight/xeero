"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

export default function AboutSection() {
  return (
    <section id="about" style={styles.section}>
      <div style={styles.linesBg} />

      <div style={styles.content}>
        <span style={styles.eyebrow}>What is The Venture Room</span>

        <p style={styles.lead}>
          The Venture Room is a founder-focused space hosted by Connor, created to help founders
          gain clarity, make better decisions, and move their ventures forward.
        </p>

        <p style={styles.body}>
          It brings founders into one room for practical conversations around building,
          partnerships, investment, growth, and the realities of entrepreneurship.
        </p>

        <p style={styles.emphasis}>This is an experience, not just another conference.</p>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    position: "relative",
    padding: "110px 24px",
    backgroundColor: VR_COLORS.background,
    overflow: "hidden",
  },
  linesBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `repeating-linear-gradient(115deg, ${VR_COLORS.accent}40 0px, ${VR_COLORS.accent}40 1.5px, transparent 1.5px, transparent 56px)`,
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    maxWidth: "640px",
    margin: "0 auto",
    textAlign: "center",
  },
  eyebrow: {
    fontFamily: VR_FONTS.body,
    fontSize: "12px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    opacity: 0.5,
    display: "block",
    marginBottom: "28px",
  },
  lead: {
    fontFamily: VR_FONTS.body,
    fontSize: "clamp(20px, 3vw, 26px)",
    fontWeight: 700,
    color: VR_COLORS.primary,
    lineHeight: "1.5",
    margin: "0 0 20px 0",
  },
  body: {
    fontFamily: VR_FONTS.body,
    fontSize: "15px",
    fontWeight: 400,
    color: VR_COLORS.primary,
    opacity: 0.75,
    lineHeight: "1.8",
    margin: "0 0 24px 0",
  },
  emphasis: {
    fontFamily: VR_FONTS.body,
    fontSize: "16px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    margin: "0",
  },
};