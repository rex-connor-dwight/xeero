"use client";

import { Link2, ClipboardList, User, Mail, FileText, Lock, Users, Heart } from "lucide-react";
import RevealOnScroll from "@/components/landing/RevealOnScroll";

const features = [
  { icon: <Link2 size={20} color="#111111" />, title: "One clean link", body: "Your entire startup lives at xeero.me/yourname. Share it once, update it forever." },
  { icon: <ClipboardList size={20} color="#111111" />, title: "Startup profile", body: "Problem, solution, traction, business model, fundraising goals. All in one minimal, beautiful page." },
  { icon: <User size={20} color="#111111" />, title: "Founder CV", body: "Investors bet on founders as much as ideas. Showcase your experience, education, and achievements." },
  { icon: <Mail size={20} color="#111111" />, title: "Built-in waitlist", body: "Collect early users before you build, and email them directly from your dashboard." },
  { icon: <FileText size={20} color="#111111" />, title: "Pitch deck", body: "Upload your PDF and let investors view it right from your profile." },
  { icon: <Lock size={20} color="#111111" />, title: "Data room", body: "Share sensitive documents only with investors you approve. Full control over who sees what." },
  { icon: <Users size={20} color="#111111" />, title: "Team access", body: "Invite your co-founders and team with role-based permissions, so everyone can help without stepping on each other." },
  { icon: <Heart size={20} color="#111111" />, title: "Community support", body: "Let believers fund you directly from your profile, before you've raised a round." },
];

export default function Features() {
  return (
    <section style={{ ...styles.section, backgroundColor: "#f9f9f9" }}>
      <div style={styles.sectionInner}>
        <RevealOnScroll>
          <span style={styles.sectionTag}>Features</span>
          <h2 style={styles.sectionHeadline}>Everything you need. Nothing you don't.</h2>
        </RevealOnScroll>

        <div style={styles.featuresGrid} className="features-grid-mobile">
          {features.map((feature, i) => (
            <RevealOnScroll key={feature.title} delay={(i % 3) * 0.1}>
              <div style={styles.featureCard}>
                <div style={styles.featureIconBox}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureBody}>{feature.body}</p>
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
  section: { padding: "80px 24px" },
  sectionInner: { maxWidth: "1100px", margin: "0 auto" },
  sectionTag: { display: "block", fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" },
  sectionHeadline: { fontSize: "36px", fontWeight: "800", color: "#111111", margin: "0 0 48px 0", letterSpacing: "-0.01em", lineHeight: "1.2" },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  featureCard: { padding: "24px", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  featureIconBox: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" },
  featureTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  featureBody: { fontSize: "13px", color: "#666666", lineHeight: "1.7", margin: "0" },
};