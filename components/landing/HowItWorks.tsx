"use client";

import { UserPlus, Link2, TrendingUp } from "lucide-react";
import RevealOnScroll from "@/components/landing/RevealOnScroll";

const steps = [
  {
    number: "01",
    icon: <UserPlus size={18} color="#111111" />,
    title: "Build your profile",
    body: "Startup details, founder CV, pitch deck, and a validation score that tells you if your idea is ready to build. Takes less than 10 minutes.",
  },
  {
    number: "02",
    icon: <Link2 size={18} color="#111111" />,
    title: "Share your link",
    body: "Get xeero.me/yourstartup. Investors see your deck and request data room access. Early users join your waitlist. Everyone sees the same live page.",
  },
  {
    number: "03",
    icon: <TrendingUp size={18} color="#111111" />,
    title: "Grow with your team",
    body: "Invite your co-founders and team, email your waitlist directly, and track every investor request from one dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <RevealOnScroll>
          <span style={styles.sectionTag}>How it works</span>
          <h2 style={styles.sectionHeadline}>From signup to funded in 3 steps.</h2>
          <p style={styles.sectionSubheadline}>
            No bloated tools. No complicated setup. Just your startup, presented beautifully.
          </p>
        </RevealOnScroll>

        <div style={styles.stepsGrid} className="steps-grid-mobile">
          {steps.map((step, i) => (
            <RevealOnScroll key={step.number} delay={i * 0.12}>
              <div style={styles.stepCard}>
                <div style={styles.stepIconRow}>
                  <div style={styles.stepIconBox}>{step.icon}</div>
                  <span style={styles.stepNumber}>{step.number}</span>
                </div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepBody}>{step.body}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
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
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
  stepCard: { padding: "28px", backgroundColor: "#f9f9f9", borderRadius: "16px", border: "1px solid #f0f0f0" },
  stepIconRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  stepIconBox: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ffffff", border: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: "center" },
  stepNumber: { fontSize: "11px", fontWeight: "700", color: "#cccccc", letterSpacing: "0.08em" },
  stepTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  stepBody: { fontSize: "14px", color: "#666666", lineHeight: "1.7", margin: "0" },
};