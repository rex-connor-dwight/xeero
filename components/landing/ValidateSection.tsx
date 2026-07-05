"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import RevealOnScroll from "@/components/landing/RevealOnScroll";

const points = [
  "Have you done this manually for 10 customers?",
  "Did 50% of them pay you?",
  "Have you talked to 50 potential users?",
];

export default function ValidateSection() {
  const router = useRouter();

  return (
    <section style={styles.section}>
      <div style={styles.svgWrapper}>
        <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" style={styles.svg}>
          <line x1="400" y1="500" x2="-100" y2="-50" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="400" y1="500" x2="200" y2="-80" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="400" y1="500" x2="400" y2="-100" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="400" y1="500" x2="600" y2="-80" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
          <line x1="400" y1="500" x2="900" y2="-50" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
          <ellipse cx="400" cy="500" rx="350" ry="200" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
        </svg>
      </div>
      <div style={styles.content}>
        <RevealOnScroll>
          <span style={styles.tag}>Validate first</span>
          <h2 style={styles.headline}>Don't build what nobody wants.</h2>
          <p style={styles.body}>
            Most startups fail because founders build before they validate. Xeero includes a free validation tool that walks you through 5 questions, and tells you whether your idea is ready to build.
          </p>
        </RevealOnScroll>

        <div style={styles.pointsList}>
          {points.map((point, i) => (
            <motion.div
              key={point}
              style={styles.point}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div style={styles.pointDot} />
              <span style={styles.pointText}>{point}</span>
            </motion.div>
          ))}
        </div>

        <RevealOnScroll delay={0.3}>
          <button style={styles.btn} onClick={() => router.push("/auth")}>
            Validate my idea →
          </button>
        </RevealOnScroll>
      </div>
    </section>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)", padding: "80px 24px", position: "relative", overflow: "hidden" },
  svgWrapper: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
  svg: { width: "100%", height: "100%", position: "absolute", top: 0, left: 0, pointerEvents: "none" },
  content: { maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1, pointerEvents: "auto" },
  tag: { display: "block", fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" },
  headline: { fontSize: "36px", fontWeight: "800", color: "#ffffff", margin: "0 0 16px 0", letterSpacing: "-0.01em", lineHeight: "1.2" },
  body: { fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: "0 0 28px 0" },
  pointsList: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" },
  point: { display: "flex", alignItems: "center", gap: "12px" },
  pointDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff", flexShrink: 0 },
  pointText: { fontSize: "14px", color: "rgba(255,255,255,0.7)" },
  btn: { padding: "13px 24px", fontSize: "14px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "10px", cursor: "pointer" },
};