"use client";

import { Check, ArrowRight } from "lucide-react";
import type { AdvisoryPackage } from "@/lib/data/advisoryPackages";

export default function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: AdvisoryPackage;
  onSelect: (pkg: AdvisoryPackage) => void;
}) {
  return (
    <div style={{ ...styles.card, ...(pkg.featured ? styles.cardFeatured : {}) }}>
      {pkg.featured && <span style={styles.featuredTag}>Most Popular</span>}

      <div style={styles.header}>
        <p style={styles.name}>{pkg.name}</p>
        <p style={styles.duration}>{pkg.duration}</p>
      </div>

      <p style={styles.tagline}>{pkg.tagline}</p>

      {pkg.bestFor.length > 0 && (
        <div style={styles.list}>
          {pkg.bestFor.map((item) => (
            <div key={item} style={styles.listRow}>
              <Check size={13} color="#38a169" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span style={styles.listText}>{item}</span>
            </div>
          ))}
        </div>
      )}

      {pkg.includes.length > 0 && (
        <div style={styles.list}>
          <p style={styles.listLabel}>What we'll cover</p>
          {pkg.includes.map((item) => (
            <div key={item} style={styles.listRow}>
              <Check size={13} color="#38a169" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span style={styles.listText}>{item}</span>
            </div>
          ))}
        </div>
      )}

      {pkg.afterCall && pkg.afterCall.length > 0 && (
        <div style={styles.list}>
          <p style={styles.listLabel}>You'll leave with</p>
          {pkg.afterCall.map((item) => (
            <div key={item} style={styles.listRow}>
              <Check size={13} color="#3182ce" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span style={styles.listText}>{item}</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <p style={styles.price}>{pkg.priceLabel}</p>
        <button style={styles.selectBtn} onClick={() => onSelect(pkg)}>
          {pkg.isFree ? "Book Clarity Call" : "Select"}
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", position: "relative" },
  cardFeatured: { border: "1px solid #111111", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
  featuredTag: { position: "absolute", top: "-11px", left: "20px", backgroundColor: "#111111", color: "#ffffff", fontSize: "10px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.05em" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" },
  name: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0" },
  duration: { fontSize: "12px", color: "#aaaaaa", fontWeight: "500", flexShrink: 0 },
  tagline: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  listLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px 0" },
  listRow: { display: "flex", alignItems: "flex-start", gap: "8px" },
  listText: { fontSize: "13px", color: "#444444", lineHeight: "1.5" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f5f5f5", marginTop: "4px" },
  price: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0" },
  selectBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};