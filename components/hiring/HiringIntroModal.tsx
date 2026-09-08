"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

const SCREENS = [
  {
    title: "Welcome to Hiring Room",
    body: "A place to post open roles, screen applicants, and hire directly through Xeero. Roles are open to anyone browsing the public Hiring Room, and can also be shared as a direct link.",
  },
  {
    title: "Screening isn't a rejection",
    body: "Founders can set a cutoff score using yes/no questions, but candidates below the cutoff are never automatically rejected. They stay visible on your board, just sorted lower, so the final call is always yours.",
  },
  {
    title: "Set your own timeline",
    body: "Every role has an open date and a close date you control. Once a role closes, the application link stops accepting new submissions automatically, no need to take it down manually.",
  },
];

export default function HiringIntroModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === SCREENS.length - 1;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose}><X size={16} color="#888888" /></button>

        <div style={styles.progressRow}>
          {SCREENS.map((_, i) => (
            <div key={i} style={{ ...styles.progressDot, ...(i === step ? styles.progressDotActive : {}) }} />
          ))}
        </div>

        <h2 style={styles.title}>{SCREENS[step].title}</h2>
        <p style={styles.body}>{SCREENS[step].body}</p>

        <button
          style={styles.nextBtn}
          onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
        >
          {isLast ? "Get Started" : "Next"}
          {!isLast && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px 28px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", position: "relative" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", display: "flex" },
  progressRow: { display: "flex", gap: "6px", marginBottom: "20px" },
  progressDot: { height: "4px", flex: 1, borderRadius: "99px", backgroundColor: "#f0f0f0" },
  progressDotActive: { backgroundColor: "#111111" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 10px 0" },
  body: { fontSize: "14px", color: "#666666", lineHeight: "1.7", margin: "0 0 28px 0" },
  nextBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};