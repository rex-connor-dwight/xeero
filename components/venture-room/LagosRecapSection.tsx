"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

const PHOTOS_URL = "https://drive.google.com/drive/folders/1gwT0f1yfd6WmR8WpR7-ojSmM2JUCdEHs";

export default function LagosRecapSection() {
  return (
    <section id="past-edition" style={styles.section}>
      <div style={styles.content}>
        <span style={styles.eyebrow}>Edition 01 · Lagos</span>
        <h2 style={styles.title}>50+ founders. One room in Yaba.</h2>
        <p style={styles.body}>
          On 26 September 2026, founders joined us in Lagos and online for conversations on
          Clarity, Partnership and Fundraising. Abuja is next.
        </p>
        <a href={PHOTOS_URL} target="_blank" rel="noopener noreferrer" style={styles.btn}>
          See the Lagos photos →
        </a>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: { padding: "100px 24px", backgroundColor: VR_COLORS.primary, textAlign: "center" },
  content: { maxWidth: "620px", margin: "0 auto" },
  eyebrow: { fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 700, color: VR_COLORS.accent, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: "16px" },
  title: { fontFamily: VR_FONTS.display, fontSize: "clamp(28px, 4.5vw, 40px)", color: VR_COLORS.white, lineHeight: "1.15", margin: "0 0 16px 0" },
  body: { fontFamily: VR_FONTS.body, fontSize: "16px", fontWeight: 500, color: VR_COLORS.white, opacity: 0.8, lineHeight: "1.75", margin: "0 0 28px 0" },
  btn: { fontFamily: VR_FONTS.body, display: "inline-block", padding: "14px 28px", fontSize: "14px", fontWeight: 700, color: VR_COLORS.primary, backgroundColor: VR_COLORS.white, borderRadius: "10px", textDecoration: "none" },
};