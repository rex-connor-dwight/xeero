"use client";

import { MapPin, Building2, Calendar } from "lucide-react";
import { getCurrencySymbol } from "@/lib/data/currencies";

type OpenRole = {
  id: string;
  title: string;
  employment_type: string | null;
  job_type: string | null;
  responsibilities: string | null;
  compensation_amount: string | null;
  compensation_currency: string | null;
  is_equity_offered: boolean;
  created_at: string;
  closes_at: string;
  profiles: { startup_name: string; slug: string; logo_url: string | null } | null;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function RoleCard({ role, onClick }: { role: OpenRole; onClick: () => void }) {
  const symbol = role.compensation_currency ? getCurrencySymbol(role.compensation_currency) : null;

  return (
    <button style={styles.card} onClick={onClick}>
      <div style={styles.cardHeader}>
        <div style={styles.logoCircle}>
          {role.profiles?.logo_url ? (
            <img src={role.profiles.logo_url} alt="" style={styles.logoImg} loading="lazy" />
          ) : (
            <Building2 size={18} color="#bbbbbb" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.startupName}>{role.profiles?.startup_name || "Unknown"}</p>
          {(role.employment_type || role.job_type) && (
            <span style={styles.formatTag}>
              <MapPin size={10} />
              {role.employment_type ? role.employment_type.charAt(0).toUpperCase() + role.employment_type.slice(1) : ""}
              {role.employment_type && role.job_type ? " · " : ""}
              {role.job_type ? role.job_type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : ""}
            </span>
          )}
        </div>
      </div>

      <h3 style={styles.roleTitle}>{role.title}</h3>

      {role.responsibilities && (
        <p style={styles.roleDesc}>
          {role.responsibilities.slice(0, 100)}{role.responsibilities.length > 100 ? "..." : ""}
        </p>
      )}

      <div style={styles.datesRow}>
        <Calendar size={10} color="#cccccc" />
        <span style={styles.datesText}>
          Posted {formatDate(role.created_at)} · Deadline:  {formatDate(role.closes_at)}
        </span>
      </div>

      <div style={styles.cardFooter}>
        {role.compensation_amount && symbol ? (
          <span style={styles.compText}>{symbol}{role.compensation_amount}</span>
        ) : <span />}
        {role.is_equity_offered && <span style={styles.equityTag}>+ Equity</span>}
      </div>
    </button>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { textAlign: "left", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px" },
  logoCircle: { width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "#f7f7f5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  startupName: { fontSize: "12px", fontWeight: "700", color: "#666666", margin: "0 0 3px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  formatTag: { display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: "600", color: "#aaaaaa" },
  roleTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0" },
  roleDesc: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "0" },
  datesRow: { display: "flex", alignItems: "center", gap: "5px" },
  datesText: { fontSize: "10px", color: "#cccccc" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f5f5f5" },
  compText: { fontSize: "13px", fontWeight: "700", color: "#111111" },
  equityTag: { fontSize: "10px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "2px 8px", borderRadius: "99px" },
};