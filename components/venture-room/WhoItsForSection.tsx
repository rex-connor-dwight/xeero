"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

const AUDIENCE = [
  "Building a new venture",
  "Validating an idea",
  "Building or refining an MVP",
  "Looking for strategic clarity",
  "Looking for partnerships",
  "Exploring investment opportunities",
  "Trying to understand their next stage of growth",
  "Looking to connect with other serious founders",
];

export default function WhoItsForSection() {
  return (
    <section id="who-its-for" style={styles.section}>
      <div style={styles.content}>
        <h2 style={styles.title}>Who is The Venture Room for?</h2>
        <p style={styles.subtitle}>Founders. Specifically, founders who are:</p>

        <div style={styles.grid}>
          {AUDIENCE.map((item) => (
            <div key={item} style={styles.item}>
              <span style={styles.dot} />
              <span style={styles.itemText}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    padding: "100px 24px",
    backgroundColor: VR_COLORS.primary,
  },
  content: {
    maxWidth: "760px",
    margin: "0 auto",
    textAlign: "center",
  },
  title: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(28px, 4vw, 40px)",
    color: VR_COLORS.white,
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontFamily: VR_FONTS.body,
    fontSize: "15px",
    fontWeight: 500,
    color: VR_COLORS.accent,
    margin: "0 0 44px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    textAlign: "left",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 16px",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: VR_COLORS.accent,
    marginTop: "7px",
    flexShrink: 0,
  },
  itemText: {
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 500,
    color: VR_COLORS.white,
    lineHeight: "1.5",
  },
};