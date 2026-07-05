"use client";

import { Target, Lightbulb, TrendingUp, DollarSign, Rocket, CheckCircle } from "lucide-react";
import { InfoCard } from "@/components/slug/InfoCard";
import type { Profile } from "@/lib/data/slugPage";

export default function OverviewTab({ profile }: { profile: Profile }) {
  const validationColor = profile.validation_score
    ? profile.validation_score >= 70 ? "#38a169" : profile.validation_score >= 40 ? "#d69e2e" : "#e53e3e"
    : "#38a169";
  const validationBg = profile.validation_score
    ? profile.validation_score >= 70 ? "#f0fff4" : profile.validation_score >= 40 ? "#fffbeb" : "#fff5f5"
    : "#f0fff4";
  const validationBorder = profile.validation_score
    ? profile.validation_score >= 70 ? "#c6f6d5" : profile.validation_score >= 40 ? "#fef08a" : "#fed7d7"
    : "#c6f6d5";

  return (
    <div style={styles.grid}>
      <InfoCard label="Problem" icon={<Target size={16} color="#999999" />} value={profile.problem} fullWidth />
      <InfoCard label="Solution" icon={<Lightbulb size={16} color="#999999" />} value={profile.solution} fullWidth />
      <InfoCard label="Traction" icon={<TrendingUp size={16} color="#999999" />} value={profile.traction} />
      <InfoCard label="Business Model" icon={<DollarSign size={16} color="#999999" />} value={profile.business_model} />

      {(profile.funding_stage || profile.funding_goal) && (
        <div style={{ ...styles.infoCard, ...styles.infoCardFull }}>
          <div style={styles.infoCardTop}>
            <div style={styles.infoCardIconWrapper}><Rocket size={16} color="#999999" /></div>
            <span style={styles.infoCardCapsule}>Fundraising</span>
          </div>
          <div style={styles.fundraisingRow}>
            {profile.funding_stage && (
              <div style={styles.fundraisingItem}>
                <p style={styles.fundraisingLabel}>Stage</p>
                <p style={styles.fundraisingValue}>{profile.funding_stage}</p>
              </div>
            )}
            {profile.funding_goal && (
              <div style={styles.fundraisingItem}>
                <p style={styles.fundraisingLabel}>Raising</p>
                <p style={styles.fundraisingValue}>{profile.funding_goal}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {profile.validation_score && (
        <div style={{ ...styles.infoCard, ...styles.infoCardFull, backgroundColor: validationBg, border: `1px solid ${validationBorder}` }}>
          <div style={styles.infoCardTop}>
            <div style={styles.infoCardIconWrapper}>
              <CheckCircle size={16} color={validationColor} />
            </div>
            <span style={{ ...styles.infoCardCapsule, backgroundColor: validationBg, color: validationColor }}>
              Validation Score
            </span>
          </div>
          <div style={styles.validationCardTop}>
            <div>
              <p style={{ ...styles.validationBand, color: validationColor }}>
                {profile.validation_band || "Validated"}
              </p>
              <p style={{ ...styles.validationSubtext, color: validationColor }}>
                {profile.validation_score}/100 — This founder validated their idea before building.
              </p>
            </div>
          </div>
          <div style={{ ...styles.validationBar, marginTop: "14px" }}>
            <div style={{ ...styles.validationBarFill, width: `${profile.validation_score}%`, backgroundColor: validationColor }} />
          </div>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" },
  infoCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  infoCardFull: { gridColumn: "1 / -1" },
  infoCardTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  infoCardIconWrapper: { display: "flex", alignItems: "center" },
  infoCardCapsule: { fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "0.07em", backgroundColor: "#f5f5f5", padding: "3px 10px", borderRadius: "99px" },
  fundraisingRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  fundraisingItem: { display: "flex", flexDirection: "column", gap: "4px" },
  fundraisingLabel: { fontSize: "11px", color: "#999999", fontWeight: "500", margin: "0", textTransform: "uppercase", letterSpacing: "0.06em" },
  fundraisingValue: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0" },
  validationCardTop: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" },
  validationBand: { fontSize: "14px", fontWeight: "700", margin: "0 0 2px 0" },
  validationSubtext: { fontSize: "12px", color: "#888888", margin: "0" },
  validationBar: { width: "100%", height: "6px", backgroundColor: "#e5e5e5", borderRadius: "99px", overflow: "hidden" },
  validationBarFill: { height: "100%", borderRadius: "99px", transition: "width 0.6s ease" },
};