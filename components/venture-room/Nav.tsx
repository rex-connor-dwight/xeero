"use client";

import { useState } from "react";
import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";

const NAV_ITEMS = [
  { label: "About", id: "about" },
  { label: "Who It's For", id: "who-its-for" },
  { label: "The Experience", id: "experience" },
  { label: "Past Edition", id: "past-edition" },
  { label: "The Host", id: "host" },
  { label: "Partners", id: "sponsors" },
];

export default function Nav({ onRegister }: { onRegister: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navInner}>
        <button style={styles.logo} onClick={() => scrollTo("hero")}>
          THE VENTURE ROOM
        </button>

        <div style={styles.desktopLinks} className="vr-desktop-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} style={styles.navLink} onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        <button style={styles.registerBtn} className="vr-desktop-register" onClick={onRegister}>
          Register
        </button>

        <button style={styles.mobileToggle} className="vr-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => (
            <button key={item.id} style={styles.mobileLink} onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
          <button style={styles.mobileRegisterBtn} onClick={() => { onRegister(); setMobileOpen(false); }}>
            Register
          </button>
        </div>
      )}

      <style>{`
        .vr-mobile-toggle { display: none; }
        @media (max-width: 820px) {
          .vr-desktop-links { display: none !important; }
          .vr-desktop-register { display: none !important; }
          .vr-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  nav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    backgroundColor: "transparent",
  },
  navInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  logo: {
    fontFamily: VR_FONTS.display,
    fontSize: "14px",
    color: VR_COLORS.white,
    background: "none",
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  desktopLinks: {
    display: "flex",
    gap: "22px",
    flex: 1,
    justifyContent: "center",
  },
  navLink: {
    fontFamily: VR_FONTS.body,
    fontSize: "13px",
    fontWeight: 500,
    color: VR_COLORS.white,
    background: "none",
    border: "none",
    cursor: "pointer",
    opacity: 0.85,
    whiteSpace: "nowrap",
  },
  registerBtn: {
    fontFamily: VR_FONTS.body,
    padding: "9px 20px",
    fontSize: "13px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    backgroundColor: VR_COLORS.white,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  mobileToggle: {
    fontSize: "18px",
    color: VR_COLORS.white,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 24px 20px 24px",
    gap: "4px",
    backgroundColor: VR_COLORS.primary,
    borderRadius: "0 0 16px 16px",
  },
  mobileLink: {
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 500,
    color: VR_COLORS.white,
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    padding: "10px 0",
  },
  mobileRegisterBtn: {
    fontFamily: VR_FONTS.body,
    padding: "12px",
    fontSize: "13px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    backgroundColor: VR_COLORS.white,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "8px",
  },
};