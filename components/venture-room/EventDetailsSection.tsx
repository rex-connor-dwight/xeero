"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";
import { CURRENT_EDITION } from "@/lib/data/ventureRoomEdition";

export default function EventDetailsSection() {
  const rows = [
    { label: "Date", value: CURRENT_EDITION.dateLabel },
    { label: "Time", value: CURRENT_EDITION.timeLabel },
    { label: "Venue", value: CURRENT_EDITION.fullVenue },
    { label: "Ticket", value: `₦${CURRENT_EDITION.priceNgn.toLocaleString()}` },
  ];

  return (
    <section id="event-details" style={styles.section}>
      <div style={styles.wrap}>
        <div style={styles.imageCol}>
          <img src="/venture-room/past-edition.jpg" alt="The Venture Room" style={styles.image} />
        </div>

        <div style={styles.textCol}>
          <span style={styles.eyebrow}>We've been here before</span>
          <p style={styles.lead}>
            The Venture Room started as a virtual pilot, then filled a room in Lagos with
            founders, partners and investors.
          </p>

          <p style={styles.transition}>Now, it's {CURRENT_EDITION.city}'s turn.</p>

          <hr style={styles.rule} />

          <h2 style={styles.title}>THE VENTURE ROOM {CURRENT_EDITION.city.toUpperCase()}</h2>

          <div style={styles.detailsList}>
            {rows.map((r) => (
              <div key={r.label} style={styles.detailRow}>
                <span style={styles.detailLabel}>{r.label}</span>
                <span style={styles.detailValue}>{r.value}</span>
              </div>
            ))}
          </div>

          <a href={CURRENT_EDITION.mapsUrl} target="_blank" rel="noopener noreferrer" style={styles.mapLink}>
            View location on map →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          #event-details > div {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          #event-details img {
            height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: { padding: "110px 24px", backgroundColor: VR_COLORS.background },
  wrap: { maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "start" },
  imageCol: { borderRadius: "18px", overflow: "hidden", border: `1px solid ${VR_COLORS.primary}15`, boxShadow: "0 16px 40px rgba(0,0,0,0.12)", aspectRatio: "1 / 1" },
  image: { width: "100%", height: "100%", display: "block", objectFit: "cover" },
  textCol: { display: "flex", flexDirection: "column" },
  eyebrow: { fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 700, color: VR_COLORS.primary, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.5, display: "block", marginBottom: "16px" },
  lead: { fontFamily: VR_FONTS.body, fontSize: "16px", fontWeight: 500, color: VR_COLORS.primary, opacity: 0.8, lineHeight: "1.75", margin: "0 0 20px 0" },
  transition: { fontFamily: VR_FONTS.display, fontSize: "clamp(20px, 2.6vw, 26px)", color: VR_COLORS.primary, lineHeight: "1.3", margin: "0 0 32px 0" },
  rule: { border: "none", borderTop: `1px solid ${VR_COLORS.primary}20`, margin: "0 0 32px 0" },
  title: { fontFamily: VR_FONTS.display, fontSize: "clamp(22px, 3vw, 28px)", color: VR_COLORS.primary, margin: "0 0 24px 0" },
  detailsList: { display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" },
  detailRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px", borderBottom: `1px solid ${VR_COLORS.primary}12`, paddingBottom: "12px" },
  detailLabel: { fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 700, color: VR_COLORS.accent, textTransform: "uppercase", letterSpacing: "0.06em" },
  detailValue: { fontFamily: VR_FONTS.body, fontSize: "15px", fontWeight: 700, color: VR_COLORS.primary, textAlign: "right" },
  mapLink: { fontFamily: VR_FONTS.body, fontSize: "13px", fontWeight: 700, color: VR_COLORS.primary, textDecoration: "underline", alignSelf: "flex-start" },
};