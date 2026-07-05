"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";

export type TooltipKey =
  | "tagline"
  | "problem"
  | "solution"
  | "traction"
  | "business_model"
  | "funding_goal"
  | "founder_bio"
  | "founder_skills"
  | "founder_achievements";

export const tooltips: Record<TooltipKey, { title: string; tip: string }> = {
  tagline: {
    title: "Writing a great tagline",
    tip: "Keep it under 10 words. Focus on the outcome not the feature. E.g. 'From idea to funding, one link.' Avoid buzzwords like 'revolutionary' or 'disruptive'.",
  },
  problem: {
    title: "A strong problem statement",
    tip: "Describe the pain in one paragraph. Who experiences it? How often? What do they do today that doesn't work? Make the investor feel the problem before you pitch the solution.",
  },
  solution: {
    title: "Pitching your solution",
    tip: "Lead with what you do, not how you do it. 'We help X do Y by doing Z.' Keep it simple enough that a non-technical investor gets it in 10 seconds.",
  },
  traction: {
    title: "What counts as traction?",
    tip: "Waitlist signups, paying customers, MRR, DAUs, letters of intent, pilot partners — anything that shows people want this. Even 10 users who love you beats 1000 who don't care.",
  },
  business_model: {
    title: "Explaining your business model",
    tip: "How do you make money? E.g. 'Monthly SaaS subscription at $9/mo' or 'We take 5% of every transaction.' The simpler, the better.",
  },
  funding_goal: {
    title: "Setting your funding goal",
    tip: "How much are you raising and for how long? E.g. '$500k to reach product-market fit over 18 months.' Tie the amount to specific milestones.",
  },
  founder_bio: {
    title: "Writing your founder bio",
    tip: "Why are you the right person to solve this problem? Mention relevant experience, past startups, or domain expertise. 2-3 sentences max.",
  },
  founder_skills: {
    title: "Listing your skills",
    tip: "Be specific. Instead of 'marketing', say 'growth marketing' or 'B2B sales'. Skills that complement your co-founders are especially valuable to investors.",
  },
  founder_achievements: {
    title: "Highlighting achievements",
    tip: "Anything that signals credibility — press features, accelerator alumni, awards, successful exits, patents, or being first in your market.",
  },
};

export function TooltipIcon({ tooltipKey }: { tooltipKey: TooltipKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const content = tooltips[tooltipKey];

  return (
    <div ref={ref} style={styles.wrapper}>
      <button style={styles.iconBtn} onClick={() => setOpen(!open)} type="button">
        <Info size={13} color={open ? "#111111" : "#bbbbbb"} />
      </button>
      {open && (
        <div style={styles.card}>
          <p style={styles.title}>{content.title}</p>
          <p style={styles.tip}>{content.tip}</p>
        </div>
      )}
    </div>
  );
}

export function FieldLabel({ label, tooltipKey }: { label: string; tooltipKey?: TooltipKey }) {
  return (
    <div style={styles.labelRow}>
      <label style={styles.label}>{label}</label>
      {tooltipKey && <TooltipIcon tooltipKey={tooltipKey} />}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  wrapper: { position: "relative", display: "inline-flex", alignItems: "center" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" },
  card: { position: "absolute", top: "calc(100% + 8px)", left: "0", backgroundColor: "#111111", borderRadius: "10px", padding: "12px 14px", width: "260px", zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
  title: { fontSize: "12px", fontWeight: "600", color: "#ffffff", margin: "0 0 6px 0" },
  tip: { fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: "1.6", margin: "0" },
  labelRow: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#111111" },
};