"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

export default function FinalCTA({ onRegister }: { onRegister: () => void }) {
  return (
    <section style={styles.section}>
      <div style={styles.content}>
        <h2 style={styles.title}>Get Into The Room.</h2>
        <p style={styles.subtitle}>26 September 2026 · Bridge by Obsidian, Yaba, Lagos</p>
        <button style={styles.ctaBtn} onClick={onRegister}>
          Register Now — ₦25,000
        </button>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: {
    padding: "110px 24px",
    backgroundColor: VR_COLORS.background,
    textAlign: "center",
  },
  content: { maxWidth: "500px", margin: "0 auto" },
  title: {
    fontFamily: VR_FONTS.display,
    fontSize: "clamp(30px, 5vw, 44px)",
    color: VR_COLORS.primary,
    margin: "0 0 12px 0",
  },
  subtitle: {
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 500,
    color: VR_COLORS.primary,
    opacity: 0.7,
    margin: "0 0 32px 0",
  },
  ctaBtn: {
    fontFamily: VR_FONTS.body,
    padding: "16px 36px",
    fontSize: "15px",
    fontWeight: 700,
    color: VR_COLORS.white,
    backgroundColor: VR_COLORS.primary,
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};