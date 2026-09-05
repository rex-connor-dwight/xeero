"use client";

import { Link2, Users, FileText, TrendingUp } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: <Link2 size={16} color="#ffffff" />,
    title: "One link, everything about you",
    description: "Your deck, waitlist, data room, and team, all at one clean link you can send anywhere.",
  },
  {
    icon: <Users size={16} color="#ffffff" />,
    title: "Bring your team along",
    description: "Invite co-founders and teammates with their own permissions, no shared logins.",
  },
  {
    icon: <FileText size={16} color="#ffffff" />,
    title: "Validate before you build",
    description: "A five-question check that tells you honestly if your idea is ready.",
  },
  {
    icon: <TrendingUp size={16} color="#ffffff" />,
    title: "Get funded, get support",
    description: "Apply for funding, technology backing, or let believers support you directly.",
  },
];

export default function AuthShowcasePanel() {
  return (
    <div style={styles.panel}>
      <div style={styles.glow} />
      <div style={styles.content}>
        <span style={styles.eyebrow}>Everything your startup needs</span>
        <h2 style={styles.headline}>Four things you can do with Xeero</h2>

        <div style={styles.list}>
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} style={styles.item}>
              <div style={styles.iconBox}>{item.icon}</div>
              <div>
                <p style={styles.itemTitle}>{item.title}</p>
                <p style={styles.itemDesc}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  panel: {
    flex: 1,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #111111 0%, #1a1a2e 55%, #16213e 100%)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    padding: "56px",
  },
  glow: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "60%",
    height: "60%",
    background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  content: { position: "relative", zIndex: 1, maxWidth: "380px" },
  eyebrow: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "12px",
  },
  headline: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: "1.3",
    margin: "0 0 36px 0",
    letterSpacing: "-0.01em",
  },
  list: { display: "flex", flexDirection: "column", gap: "24px" },
  item: { display: "flex", alignItems: "flex-start", gap: "14px" },
  iconBox: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemTitle: { fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: "0 0 4px 0" },
  itemDesc: { fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", margin: "0" },
};