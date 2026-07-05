"use client";

import { useRouter } from "next/navigation";
import RevealOnScroll from "@/components/landing/RevealOnScroll";

export default function CtaFooter() {
  const router = useRouter();

  return (
    <>
      <section style={styles.ctaSection}>
        <div style={styles.ctaInner}>
          <RevealOnScroll>
            <h2 style={styles.ctaHeadline}>Your startup deserves a real home.</h2>
            <p style={styles.ctaBody}>
              Join founders building in public, validating fast, and raising on Xeero.
            </p>
            <button style={styles.ctaBtn} onClick={() => router.push("/auth")}>
              Build your profile, it's free →
            </button>
          </RevealOnScroll>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLeft}>
            <div style={styles.footerLogo}>
              <div style={styles.footerLogoMark}>
                <div style={styles.footerLogoMarkInner} />
              </div>
              <span style={styles.footerBrand}>Xeero</span>
            </div>
            <p style={styles.footerTagline}>Everything your startup needs in one link.</p>
          </div>
          <div style={styles.footerRight}>
            <button style={styles.footerLink} onClick={() => router.push("/auth")}>Get Started</button>
            <button style={styles.footerLink} onClick={() => router.push("/auth")}>Login</button>
            <button style={styles.footerLink} onClick={() => router.push("/terms")}>Terms</button>
            <button style={styles.footerLink} onClick={() => router.push("/privacy")}>Privacy</button>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>© 2026 Xeero. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  ctaSection: { backgroundColor: "#111111", padding: "80px 24px", textAlign: "center" },
  ctaInner: { maxWidth: "560px", margin: "0 auto" },
  ctaHeadline: { fontSize: "36px", fontWeight: "800", color: "#ffffff", margin: "0 0 12px 0", letterSpacing: "-0.01em", lineHeight: "1.2" },
  ctaBody: { fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: "1.6", margin: "0 0 32px 0" },
  ctaBtn: { padding: "14px 28px", fontSize: "15px", fontWeight: "700", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer" },
  footer: { backgroundColor: "#111111", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px 24px 24px" },
  footerInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "32px" },
  footerLeft: { display: "flex", flexDirection: "column", gap: "8px" },
  footerLogo: { display: "flex", alignItems: "center", gap: "8px" },
  footerLogoMark: { width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  footerLogoMarkInner: { width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#ffffff" },
  footerBrand: { fontSize: "16px", fontWeight: "700", color: "#ffffff" },
  footerTagline: { fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0" },
  footerRight: { display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" },
  footerLink: { fontSize: "13px", color: "rgba(255,255,255,0.4)", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "400" },
  footerBottom: { maxWidth: "1100px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" },
  footerCopy: { fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: "0" },
};