"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function PordwareStep1({
  activeProfile,
  application,
  saving,
  onNext,
}: {
  activeProfile: any;
  application: any;
  saving: boolean;
  onNext: (data: Record<string, any>) => void;
}) {
  const [fullName, setFullName] = useState(application?.full_name || activeProfile?.founder_name || "");
  const [email, setEmail] = useState(application?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(application?.phone_number || "");
  const [linkedinUrl, setLinkedinUrl] = useState(application?.linkedin_url || activeProfile?.founder_linkedin || "");
  const [location, setLocation] = useState(application?.location || activeProfile?.location || "");
  const [founderRole, setFounderRole] = useState(application?.founder_role || activeProfile?.founder_role || "");
  const [numberOfFounders, setNumberOfFounders] = useState(application?.number_of_founders?.toString() || "");
  const [teamSize, setTeamSize] = useState(application?.team_size || activeProfile?.team_size || "");

  const canContinue = fullName && email && phoneNumber && location && founderRole && numberOfFounders;

  const handleNext = () => {
    onNext({
      full_name: fullName,
      email,
      phone_number: phoneNumber,
      linkedin_url: linkedinUrl || null,
      location,
      founder_role: founderRole,
      number_of_founders: parseInt(numberOfFounders, 10) || null,
      team_size: teamSize || null,
    });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 1 of 9</p>
      <h2 style={styles.title}>Founder Information</h2>
      <p style={styles.subtitle}>We've pulled some of this from your Xeero profile. Update anything that's changed.</p>

      <label style={styles.label}>Full name</label>
      <input style={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label style={styles.label}>Email</label>
      <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@startup.com" />

      <label style={styles.label}>Phone number</label>
      <input style={styles.input} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+234..." />

      <label style={styles.label}>LinkedIn / profile URL</label>
      <input style={styles.input} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />

      <label style={styles.label}>Location</label>
      <input style={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />

      <label style={styles.label}>Founder role</label>
      <input style={styles.input} value={founderRole} onChange={(e) => setFounderRole(e.target.value)} placeholder="e.g. CEO, Co-founder" />

      <label style={styles.label}>Number of founders</label>
      <input style={styles.input} type="number" min="1" value={numberOfFounders} onChange={(e) => setNumberOfFounders(e.target.value)} />

      <label style={styles.label}>Current team size</label>
      <input style={styles.input} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="e.g. 3" />

      <button
        style={{ ...styles.nextBtn, opacity: canContinue && !saving ? 1 : 0.5 }}
        onClick={handleNext}
        disabled={!canContinue || saving}
      >
        {saving ? "Saving..." : "Save & Continue"}
        {!saving && <ArrowRight size={14} />}
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  stepLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 20px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  nextBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "24px" },
};