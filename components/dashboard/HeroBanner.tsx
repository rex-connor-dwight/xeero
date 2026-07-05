"use client";

import { useState, useEffect } from "react";

const bannerMessages = [
  "Founders who complete their Xeero profile get 3x more investor reach.",
  "Your waitlist is your first proof of demand. Keep sharing.",
  "40% of funded startups started with a validated idea. Have you validated yours?",
  "Investors decide in 60 seconds. Make your profile count.",
];

export default function HeroBanner({ startupName }: { startupName: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % bannerMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.banner}>
      <svg style={styles.svg} viewBox="0 0 800 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="160" x2="800" y2="0" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
        <line x1="0" y1="120" x2="800" y2="40" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
        <line x1="0" y1="80" x2="800" y2="80" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
        <line x1="200" y1="0" x2="600" y2="160" stroke="white" strokeWidth="0.4" strokeOpacity="0.06" />
        <line x1="400" y1="0" x2="400" y2="160" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
        <circle cx="700" cy="80" r="60" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.05" />
        <circle cx="700" cy="80" r="100" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.03" />
        <circle cx="100" cy="140" r="80" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.04" />
      </svg>
      <div style={styles.content}>
        <div style={styles.greeting}>
          Welcome back — <strong>{startupName}</strong>
        </div>
        <p style={styles.message}>{bannerMessages[msgIndex]}</p>
        <div style={styles.dots}>
          {bannerMessages.map((_, i) => (
            <div key={i} style={{
              ...styles.dot,
              backgroundColor: i === msgIndex ? "#ffffff" : "rgba(255,255,255,0.25)",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  banner: {
    background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)",
    borderRadius: "16px",
    padding: "28px 32px",
    position: "relative",
    overflow: "hidden",
    marginBottom: "20px",
  },
  svg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" },
  content: { position: "relative", zIndex: 1 },
  greeting: { fontSize: "12px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  message: { fontSize: "18px", fontWeight: "600", color: "#ffffff", lineHeight: "1.5", maxWidth: "480px", margin: "0 0 16px 0" },
  dots: { display: "flex", gap: "6px" },
  dot: { width: "5px", height: "5px", borderRadius: "50%", transition: "background-color 0.3s ease" },
};