"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";
import { VENTURE_ROOM_SPONSORS } from "@/lib/data/ventureRoomSponsors";

export default function SponsorsSection() {
  if (VENTURE_ROOM_SPONSORS.length === 0) return null;

  const sorted = [...VENTURE_ROOM_SPONSORS].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section id="sponsors" style={styles.section}>
      <div style={styles.content}>
        <span style={styles.eyebrow}>Powered By Our Partners</span>

        <div style={styles.grid}>
          {sorted.map((sponsor) => (
            
              <a
              key={sponsor.name}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.sponsorCard}
            >
              <img src={sponsor.logoUrl} alt={sponsor.name} style={styles.logo} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    padding: "80px 24px",
    backgroundColor: VR_COLORS.background,
  },
  content: {
    maxWidth: "760px",
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
    marginBottom: "36px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    alignItems: "center",
  },
  sponsorCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px 28px",
    backgroundColor: VR_COLORS.white,
    border: `1px solid ${VR_COLORS.primary}12`,
    borderRadius: "12px",
    cursor: "pointer",
  },
  logo: {
    height: "32px",
    maxWidth: "140px",
    objectFit: "contain",
  },
};