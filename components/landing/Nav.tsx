"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";

export default function Nav() {
  const router = useRouter();
  const { user, profile, loading } = useXeero();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav style={{
      ...styles.nav,
      backgroundColor: scrolled ? "rgba(17,17,17,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
    }}>
      <div style={styles.navInner}>
        <div style={styles.navLogo}>
          <div style={styles.navLogoMark}>
            <div style={styles.navLogoMarkInner} />
          </div>
          <span style={styles.navBrand}>Xeero</span>
        </div>
        <div style={styles.navActions}>
          {!loading && user ? (
            <button style={styles.navAvatarBtn} onClick={() => router.push("/dashboard")}>
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="logo" style={styles.navAvatarImg} />
              ) : (
                <span style={styles.navAvatarText}>
                  {profile?.startup_name?.[0]?.toUpperCase() ||
                    profile?.founder_name?.[0]?.toUpperCase() || "X"}
                </span>
              )}
              <span style={styles.navAvatarLabel}>
                {profile?.startup_name || "Dashboard"} →
              </span>
            </button>
          ) : (
            <>
              <button style={styles.navLoginBtn} onClick={() => router.push("/auth")}>Login</button>
              <button style={styles.navGetStartedBtn} onClick={() => router.push("/auth")}>Get Started →</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "0 24px", transition: "all 0.3s ease", pointerEvents: "none" },
  navInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", pointerEvents: "auto" },
  navLogo: { display: "flex", alignItems: "center", gap: "10px" },
  navLogoMark: { width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" },
  navLogoMarkInner: { width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#ffffff" },
  navBrand: { fontSize: "18px", fontWeight: "700", color: "#ffffff" },
  navActions: { display: "flex", gap: "10px", alignItems: "center" },
  navLoginBtn: { padding: "8px 16px", fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.7)", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer" },
  navGetStartedBtn: { padding: "8px 16px", fontSize: "13px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer" },
  navAvatarBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px 6px 6px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "99px", cursor: "pointer" },
  navAvatarImg: { width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" },
  navAvatarText: { width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#ffffff" },
  navAvatarLabel: { fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.8)" },
};