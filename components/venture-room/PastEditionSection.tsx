"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

const MAPS_URL = "https://maps.google.com/?q=Bridge+by+Obsidian+Yaba+Lagos";

export default function PastEditionSection() {
  return (
    <section id="past-edition" style={styles.section}>
      <div style={styles.wrap}>
        <div style={styles.imageCol}>
          <img src="/venture-room/past-edition.jpg" alt="The Venture Room, virtual pilot" style={styles.image} />
        </div>

        <div style={styles.textCol}>
          <span style={styles.eyebrow}>We've been here before</span>
          <p style={styles.lead}>
            The first Venture Room was a virtual pilot that brought founders together for
            practical conversations, connections, and opportunities.
          </p>

          <p style={styles.transition}>Now, we're bringing the room into the room.</p>

          <hr style={styles.rule} />

          <h2 style={styles.title}>THE VENTURE ROOM 2026</h2>

          <div style={styles.detailsList}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Date</span>
              <span style={styles.detailValue}>26 September 2026</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Time</span>
              <span style={styles.detailValue}>11:00am WAT</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Venue</span>
              <span style={styles.detailValue}>Bridge by Obsidian, Yaba, Lagos</span>
            </div>
          </div>

          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={styles.mapLink}>
            View location on map →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          #past-edition > div {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          #past-edition img {
            height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    padding: "110px 24px",
    backgroundColor: VR_COLORS.background,
  },
  wrap: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "56px",
    alignItems: "start",
  },
  imageCol: {
    borderRadius: "18px",
    overflow: "hidden",
    border: `1px solid ${VR_COLORS.primary}15`,
    boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
    aspectRatio: "1 / 1",
  },
  image: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
  },
  textCol: {
    display: "flex",
    flexDirection: "column",
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
  lead: {
    fontFamily: VR_FONTS.body,
    fontSize: "16px",
    fontWeight: 500,
    color: VR_COLORS.primary,
    opacity: 0.8,
    lineHeight: "1.75",
    margin: "0 0 20px 0",
  },
  transition: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(20px, 2.6vw, 26px)",
    color: VR_COLORS.primary,
    lineHeight: "1.3",
    margin: "0 0 32px 0",
  },
  rule: {
    border: "none",
    borderTop: `1px solid ${VR_COLORS.primary}20`,
    margin: "0 0 32px 0",
  },
  title: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(22px, 3vw, 28px)",
    color: VR_COLORS.primary,
    margin: "0 0 24px 0",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "24px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottom: `1px solid ${VR_COLORS.primary}12`,
    paddingBottom: "12px",
  },
  detailLabel: {
    fontFamily: VR_FONTS.body,
    fontSize: "12px",
    fontWeight: 700,
    color: VR_COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  detailValue: {
    fontFamily: VR_FONTS.body,
    fontSize: "15px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    textAlign: "right",
  },
  mapLink: {
    fontFamily: VR_FONTS.body,
    fontSize: "13px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    textDecoration: "underline",
    alignSelf: "flex-start",
  },
};