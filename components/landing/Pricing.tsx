"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import RevealOnScroll from "@/components/landing/RevealOnScroll";

const features = [
  "Public startup profile",
  "Founder CV",
  "Built-in waitlist with email tool",
  "Pitch deck viewer",
  "Data room access requests",
  "Idea validation tool",
  "xeero.me/yourname link",
  "Dashboard and analytics",
];

export default function Pricing() {
  const router = useRouter();

  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <RevealOnScroll>
          <span style={styles.sectionTag}>Pricing</span>
          <h2 style={styles.sectionHeadline}>Simple. One time. Fair.</h2>
          <p style={styles.sectionSubheadline}>Build for free. Pay once to go live.</p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
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
              <p style={styles.teamsNote}>
                Building with a team? Upgrade to Xeero for Teams — $29.99/year for team seats and the Services marketplace.
              </p>
            </div>
            <div style={styles.pricingRight}>
              {features.map((feature) => (
                <div key={feature} style={styles.pricingFeature}>
                  <Check size={14} color="#38a169" style={{ flexShrink: 0 }} />
                  <span style={styles.pricingFeatureText}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: { padding: "80px 24px", backgroundColor: "#ffffff" },
  sectionInner: { maxWidth: "1100px", margin: "0 auto" },
  sectionTag: { display: "block", fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" },
  sectionHeadline: { fontSize: "36px", fontWeight: "800", color: "#111111", margin: "0 0 12px 0", letterSpacing: "-0.01em", lineHeight: "1.2" },
  sectionSubheadline: { fontSize: "16px", color: "#666666", lineHeight: "1.6", margin: "0 0 48px 0", maxWidth: "520px" },
  pricingCard: { display: "flex", gap: "48px", backgroundColor: "#f9f9f9", borderRadius: "20px", padding: "40px", border: "1px solid #f0f0f0", flexWrap: "wrap" },
  pricingLeft: { flex: 1, minWidth: "240px" },
  pricingLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" },
  pricingPriceRow: { display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" },
  pricingPrice: { fontSize: "56px", fontWeight: "800", color: "#111111", lineHeight: "1" },
  pricingPriceSub: { fontSize: "16px", color: "#aaaaaa", fontWeight: "400" },
  pricingNote: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0" },
  pricingBtn: { padding: "12px 22px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer", marginBottom: "16px" },
  teamsNote: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "0", paddingTop: "16px", borderTop: "1px solid #eeeeee" },
  pricingRight: { flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" },
  pricingFeature: { display: "flex", alignItems: "center", gap: "10px" },
  pricingFeatureText: { fontSize: "14px", color: "#444444" },
};