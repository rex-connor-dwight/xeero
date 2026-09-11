"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

const PILLARS = [
  {
    title: "CLARITY",
    body: "Get a clearer perspective on your business, challenges, opportunities, and next steps.",
  },
  {
    title: "CONNECTION",
    body: "Meet founders, investors, operators, and people who can become meaningful parts of your journey.",
  },
  {
    title: "PARTNERSHIP",
    body: "Discover potential strategic partnerships, collaborations, and opportunities.",
  },
  {
    title: "INVESTMENT",
    body: "Create opportunities for founders and investors to connect around ventures with potential.",
  },
  {
    title: "CONVERSATION",
    body: "Participate in practical conversations about what it actually takes to build and grow a venture.",
  },
];

export default function ExperienceSection() {
  return (
    <section id="experience" style={styles.section}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>What happens inside</span>
        <h2 style={styles.title}>The value is in the room, not the attendance.</h2>
      </div>

      <div style={styles.stack}>
        {PILLARS.map((pillar, i) => (
          <div
            key={pillar.title}
            style={{ ...styles.card, top: `${100 + i * 16}px` }}
          >
            <span style={styles.watermark}>{String(i + 1).padStart(2, "0")}</span>
            <h3 style={styles.cardTitle}>{pillar.title}</h3>
            <p style={styles.cardBody}>{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    padding: "110px 24px",
    backgroundColor: VR_COLORS.background,
  },
  header: {
    maxWidth: "600px",
    margin: "0 auto 56px auto",
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
    marginBottom: "16px",
  },
  title: {
    fontFamily: VR_FONTS.body,
    fontSize: "clamp(22px, 3vw, 28px)",
    fontWeight: 700,
    color: VR_COLORS.primary,
    margin: "0",
    lineHeight: "1.4",
  },
  stack: {
    maxWidth: "560px",
    margin: "0 auto",
  },
  card: {
    position: "sticky",
    backgroundColor: VR_COLORS.white,
    border: `1px solid ${VR_COLORS.primary}12`,
    borderRadius: "18px",
    padding: "36px 32px",
    overflow: "hidden",
    minHeight: "220px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  watermark: {
    position: "absolute",
    top: "-14px",
    right: "8px",
    fontFamily: VR_FONTS.display,
    fontSize: "88px",
    color: VR_COLORS.accent,
    opacity: 0.25,
    lineHeight: "1",
    pointerEvents: "none",
  },
  cardTitle: {
    position: "relative",
    fontFamily: VR_FONTS.body,
    fontSize: "17px",
    fontWeight: 900,
    color: VR_COLORS.primary,
    letterSpacing: "0.06em",
    margin: "0 0 12px 0",
  },
  cardBody: {
    position: "relative",
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 400,
    color: VR_COLORS.primary,
    opacity: 0.75,
    lineHeight: "1.7",
    margin: "0",
  },
};