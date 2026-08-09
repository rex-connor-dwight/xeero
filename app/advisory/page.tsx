"use client";

import { useState } from "react";
import { ADVISORY_PACKAGES, type AdvisoryPackage } from "@/lib/data/advisoryPackages";
import PackageCard from "@/components/advisory/PackageCard";
import ClarityCallFlow from "@/components/advisory/ClarityCallFlow";
import PaidPackageFlow from "@/components/advisory/PaidPackageFlow";

export default function AdvisoryPage() {
  const [selectedPackage, setSelectedPackage] = useState<AdvisoryPackage | null>(null);

  return (
    <div style={styles.page}>

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.eyebrow}>Venture Advisory</span>
          <h1 style={styles.headline}>Structured advisory for founders building something real.</h1>
          <p style={styles.subhead}>
            From a quick gut check to a full week working side by side, pick the level of support that matches where you are.
          </p>
        </div>
      </div>

      <div style={styles.body}>
        {selectedPackage ? (
          selectedPackage.isFree ? (
            <ClarityCallFlow onBack={() => setSelectedPackage(null)} />
          ) : (
            <PaidPackageFlow pkg={selectedPackage} onBack={() => setSelectedPackage(null)} />
          )
        ) : (
          <div style={styles.grid}>
            {ADVISORY_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.key} pkg={pkg} onSelect={setSelectedPackage} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  hero: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", padding: "80px 24px 56px 24px" },
  heroContent: { maxWidth: "620px", margin: "0 auto", textAlign: "center" },
  eyebrow: { display: "inline-block", fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" },
  headline: { fontSize: "32px", fontWeight: "800", color: "#ffffff", lineHeight: "1.25", margin: "0 0 14px 0", letterSpacing: "-0.01em" },
  subhead: { fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: "0" },
  body: { maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" },
};