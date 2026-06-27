"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useXeero } from "@/lib/context";

function ErrorHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    if (error === "access_denied" && errorCode === "otp_expired") {
      router.push("/auth?error=link_expired");
    }
  }, []);

  return null;
}

function HeroPattern() {
  return (
    <svg
      style={styles.heroSvg}
      viewBox="0 0 1200 600"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <line x1="600" y1="700" x2="-200" y2="-100" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="0" y2="-150" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="200" y2="-180" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="400" y2="-200" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="600" y2="-200" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="800" y2="-200" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="1000" y2="-180" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="1200" y2="-150" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <line x1="600" y1="700" x2="1400" y2="-100" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
      <ellipse cx="600" cy="700" rx="500" ry="300" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
      <ellipse cx="600" cy="700" rx="380" ry="220" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
      <ellipse cx="600" cy="700" rx="250" ry="140" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
      <circle cx="200" cy="100" r="150" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
      <circle cx="1000" cy="150" r="200" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading } = useXeero();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <ErrorHandler />
      </Suspense>

      <div style={styles.page}>

        {/* Navbar */}
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

        {/* Hero */}
        <section style={styles.hero}>
          <HeroPattern />
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDot} />
              Built for founders, by a founder
            </div>
            <h1 style={styles.heroHeadline}>
              Everything your startup<br />
              needs in one link.
            </h1>
            <p style={styles.heroSubheadline}>
              Build your startup profile, collect your waitlist, share your pitch deck,
              and connect with investors. All from a single beautiful link.
            </p>
            <div style={styles.heroCtas}>
              <button style={styles.heroPrimaryBtn} onClick={() => router.push("/auth")}>
                Build your profile, it's free →
              </button>
              <p style={styles.heroNote}>
                No credit card required. Go live for $9.
              </p>
            </div>

            {/* Mock card — left aligned on mobile */}
            <div style={styles.heroCard} className="hero-card-mobile">
              <div style={styles.heroCardHeader}>
                <div style={styles.heroCardCover} />
                <div style={styles.heroCardLogo}>
                  <span style={styles.heroCardLogoText}>XR</span>
                </div>
              </div>
              <div style={styles.heroCardBody}>
                <div style={styles.heroCardNameRow}>
                  <span style={styles.heroCardName}>Xeero</span>
                  <span style={styles.heroCardBadge}>● Live</span>
                </div>
                <p style={styles.heroCardTagline}>From idea to funding, one link.</p>
                <div style={styles.heroCardPills}>
                  {["SaaS", "Building", "📍 Lagos"].map((pill) => (
                    <span key={pill} style={styles.heroCardPill}>{pill}</span>
                  ))}
                </div>
                <div style={styles.heroCardTabs}>
                  {["Overview", "Founder", "Deck", "🔒 Data Room"].map((tab, i) => (
                    <span key={tab} style={{ ...styles.heroCardTab, ...(i === 0 ? styles.heroCardTabActive : {}) }}>
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={styles.section}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionTag}>How it works</span>
            <h2 style={styles.sectionHeadline}>From signup to funded in 3 steps.</h2>
            <p style={styles.sectionSubheadline}>
              No bloated tools. No complicated setup. Just your startup, presented beautifully.
            </p>
            {/* horizontal scroll on mobile */}
            <div style={styles.stepsGrid} className="steps-grid-mobile">
              {[
                {
                  number: "01",
                  title: "Build your profile",
                  body: "Fill in your startup details, founder CV, problem, solution, traction, and pitch deck. Takes less than 10 minutes.",
                },
                {
                  number: "02",
                  title: "Share your link",
                  body: "Get a clean link like xeero.me/yourstartup. Share it with investors, early users, press, anyone who needs to know your story.",
                },
                {
                  number: "03",
                  title: "Watch it work",
                  body: "Waitlist signups come in. Investors request data room access. You track everything from your dashboard.",
                },
              ].map((step) => (
                <div key={step.number} style={styles.stepCard}>
                  <span style={styles.stepNumber}>{step.number}</span>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepBody}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ ...styles.section, backgroundColor: "#f9f9f9" }}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionTag}>Features</span>
            <h2 style={styles.sectionHeadline}>Everything you need. Nothing you don't.</h2>
            {/* horizontal scroll on mobile */}
            <div style={styles.featuresGrid} className="features-grid-mobile">
              {[
                { icon: "🔗", title: "One clean link", body: "Your entire startup lives at xeero.me/yourname. Share it once, update it forever." },
                { icon: "📋", title: "Startup profile", body: "Problem, solution, traction, business model, fundraising goals. All in one minimal, beautiful page." },
                { icon: "👤", title: "Founder CV", body: "Investors bet on founders as much as ideas. Showcase your experience, education, and achievements." },
                { icon: "📧", title: "Built-in waitlist", body: "Collect early users before you build. Every signup is proof that demand exists." },
                { icon: "📄", title: "Pitch deck", body: "Upload your PDF or build a deck with Xeero. Investors can view it right from your profile." },
                { icon: "🔒", title: "Data room", body: "Share sensitive documents only with investors you approve. Full control over who sees what." },
              ].map((feature) => (
                <div key={feature.title} style={styles.featureCard}>
                  <span style={styles.featureIcon}>{feature.icon}</span>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureBody}>{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Validation */}
        <section style={styles.validateSection}>
          <div style={styles.validateSvgWrapper}>
            <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
              <line x1="400" y1="500" x2="-100" y2="-50" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
              <line x1="400" y1="500" x2="200" y2="-80" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
              <line x1="400" y1="500" x2="400" y2="-100" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
              <line x1="400" y1="500" x2="600" y2="-80" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
              <line x1="400" y1="500" x2="900" y2="-50" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
              <ellipse cx="400" cy="500" rx="350" ry="200" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
            </svg>
          </div>
          <div style={styles.validateContent}>
            <span style={styles.validateTag}>Validate first</span>
            <h2 style={styles.validateHeadline}>Don't build what nobody wants.</h2>
            <p style={styles.validateBody}>
              Most startups fail because founders build before they validate. Xeero includes a free validation tool that walks you through 5 questions, and tells you whether your idea is ready to build.
            </p>
            <div style={styles.validatePoints}>
              {[
                "Have you done this manually for 10 customers?",
                "Did 50% of them pay you?",
                "Have you talked to 50 potential users?",
              ].map((point) => (
                <div key={point} style={styles.validatePoint}>
                  <div style={styles.validatePointDot} />
                  <span style={styles.validatePointText}>{point}</span>
                </div>
              ))}
            </div>
            <button style={styles.validateBtn} onClick={() => router.push("/auth")}>
              Validate my idea →
            </button>
          </div>
        </section>

        {/* Pricing */}
        <section style={styles.section}>
          <div style={styles.sectionInner}>
            <span style={styles.sectionTag}>Pricing</span>
            <h2 style={styles.sectionHeadline}>Simple. One time. Fair.</h2>
            <p style={styles.sectionSubheadline}>Build for free. Pay once to go live.</p>
            <div style={styles.pricingCard}>
              <div style={styles.pricingLeft}>
                <p style={styles.pricingLabel}>One-time payment</p>
                <div style={styles.pricingPriceRow}>
                  <span style={styles.pricingPrice}>$9</span>
                  <span style={styles.pricingPriceSub}>forever</span>
                </div>
                <p style={styles.pricingNote}>
                  Build your profile for free. Pay $9 to publish your link and go live. No subscriptions. No hidden fees.
                </p>
                <button style={styles.pricingBtn} onClick={() => router.push("/auth")}>
                  Get started free →
                </button>
              </div>
              <div style={styles.pricingRight}>
                {[
                  "Public startup profile",
                  "Founder CV",
                  "Built-in waitlist",
                  "Pitch deck viewer",
                  "Data room access requests",
                  "Idea validation tool",
                  "xeero.me/yourname link",
                  "Dashboard and analytics",
                ].map((feature) => (
                  <div key={feature} style={styles.pricingFeature}>
                    <span style={styles.pricingCheck}>✓</span>
                    <span style={styles.pricingFeatureText}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaInner}>
            <h2 style={styles.ctaHeadline}>Your startup deserves a real home.</h2>
            <p style={styles.ctaBody}>
              Join founders building in public, validating fast, and raising on Xeero.
            </p>
            <button style={styles.ctaBtn} onClick={() => router.push("/auth")}>
              Build your profile, it's free →
            </button>
          </div>
        </section>

        {/* Footer */}
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
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p style={styles.footerCopy}>© 2026 Xeero. All rights reserved.</p>
          </div>
        </footer>

      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Xeero",
            "description": "Build a professional startup profile in minutes. One link holds your pitch deck, waitlist, data room, and founder CV.",
            "url": "https://xeero.me",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "9",
              "priceCurrency": "USD",
              "description": "One-time payment to publish your startup profile"
            },
            "creator": {
              "@type": "Organization",
              "name": "Xeero",
              "url": "https://xeero.me"
            }
          })
        }}
      />
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#ffffff", overflowX: "hidden" },
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
  hero: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px 24px" },
  heroSvg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: "680px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  heroBadge: { display: "flex", alignItems: "center", gap: "6px", padding: "5px 14px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "99px", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: "500", marginBottom: "24px" },
  heroBadgeDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#38a169", display: "inline-block" },
  heroHeadline: { fontSize: "52px", fontWeight: "800", color: "#ffffff", lineHeight: "1.1", margin: "0 0 20px 0", letterSpacing: "-0.02em" },
  heroSubheadline: { fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: "0 0 36px 0", maxWidth: "520px" },
  heroCtas: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "48px" },
  heroPrimaryBtn: { padding: "14px 28px", fontSize: "15px", fontWeight: "700", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer" },
  heroNote: { fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "0" },
  heroCard: { width: "100%", maxWidth: "480px", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" },
  heroCardHeader: { position: "relative", height: "80px" },
  heroCardCover: { width: "100%", height: "100%", background: "linear-gradient(135deg, #111111 0%, #1a1a2e 100%)" },
  heroCardLogo: { position: "absolute", bottom: "-20px", left: "20px", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#111111", border: "3px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
  heroCardLogoText: { fontSize: "14px", fontWeight: "700", color: "#ffffff" },
  heroCardBody: { padding: "28px 20px 20px 20px" },
  heroCardNameRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" },
  heroCardName: { fontSize: "18px", fontWeight: "700", color: "#111111" },
  heroCardBadge: { fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "2px 8px", borderRadius: "99px" },
  heroCardTagline: { fontSize: "13px", color: "#666666", margin: "0 0 12px 0" },
  heroCardPills: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" },
  heroCardPill: { padding: "3px 10px", backgroundColor: "#f5f5f5", borderRadius: "99px", fontSize: "11px", color: "#555555", fontWeight: "500" },
  heroCardTabs: { display: "flex", gap: "6px", borderTop: "1px solid #f5f5f5", paddingTop: "14px" },
  heroCardTab: { padding: "5px 12px", fontSize: "11px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px" },
  heroCardTabActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111", fontWeight: "600" },
  section: { padding: "80px 24px", backgroundColor: "#ffffff" },
  sectionInner: { maxWidth: "1100px", margin: "0 auto" },
  sectionTag: { display: "block", fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" },
  sectionHeadline: { fontSize: "36px", fontWeight: "800", color: "#111111", margin: "0 0 12px 0", letterSpacing: "-0.01em", lineHeight: "1.2" },
  sectionSubheadline: { fontSize: "16px", color: "#666666", lineHeight: "1.6", margin: "0 0 48px 0", maxWidth: "520px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  stepCard: { padding: "28px", backgroundColor: "#f9f9f9", borderRadius: "16px", border: "1px solid #f0f0f0" },
  stepNumber: { fontSize: "11px", fontWeight: "700", color: "#cccccc", letterSpacing: "0.08em", display: "block", marginBottom: "16px" },
  stepTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  stepBody: { fontSize: "14px", color: "#666666", lineHeight: "1.7", margin: "0" },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  featureCard: { padding: "24px", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  featureIcon: { fontSize: "24px", display: "block", marginBottom: "12px" },
  featureTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  featureBody: { fontSize: "13px", color: "#666666", lineHeight: "1.7", margin: "0" },
  validateSection: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)", padding: "80px 24px", position: "relative", overflow: "hidden" },
  validateSvgWrapper: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
  validateContent: { maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1, pointerEvents: "auto" },
  validateTag: { display: "block", fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" },
  validateHeadline: { fontSize: "36px", fontWeight: "800", color: "#ffffff", margin: "0 0 16px 0", letterSpacing: "-0.01em", lineHeight: "1.2" },
  validateBody: { fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: "0 0 28px 0" },
  validatePoints: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" },
  validatePoint: { display: "flex", alignItems: "center", gap: "12px" },
  validatePointDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff", flexShrink: 0 },
  validatePointText: { fontSize: "14px", color: "rgba(255,255,255,0.7)" },
  validateBtn: { padding: "13px 24px", fontSize: "14px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer" },
  pricingCard: { display: "flex", gap: "48px", backgroundColor: "#f9f9f9", borderRadius: "20px", padding: "40px", border: "1px solid #f0f0f0", flexWrap: "wrap" },
  pricingLeft: { flex: 1, minWidth: "240px" },
  pricingLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" },
  pricingPriceRow: { display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" },
  pricingPrice: { fontSize: "56px", fontWeight: "800", color: "#111111", lineHeight: "1" },
  pricingPriceSub: { fontSize: "16px", color: "#aaaaaa", fontWeight: "400" },
  pricingNote: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0" },
  pricingBtn: { padding: "12px 22px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  pricingRight: { flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" },
  pricingFeature: { display: "flex", alignItems: "center", gap: "10px" },
  pricingCheck: { fontSize: "14px", color: "#38a169", fontWeight: "700", flexShrink: 0 },
  pricingFeatureText: { fontSize: "14px", color: "#444444" },
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
  footerRight: { display: "flex", gap: "16px", alignItems: "center" },
  footerLink: { fontSize: "13px", color: "rgba(255,255,255,0.4)", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "400" },
  footerBottom: { maxWidth: "1100px", margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" },
  footerCopy: { fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: "0" },
};