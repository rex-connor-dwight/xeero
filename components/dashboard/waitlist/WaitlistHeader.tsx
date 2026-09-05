"use client";

import { Users, Download, Upload, Mail } from "lucide-react";

export default function WaitlistHeader({
  count,
  startupName,
  onExport,
  onImport,
  onComposeToggle,
}: {
  count: number;
  startupName: string;
  onExport: () => void;
  onImport: () => void;
  onComposeToggle: () => void;
}) {
  return (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <div style={styles.headerIcon}><Users size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Waitlist</h1>
          <p style={styles.headerSub}>
            {count} {count === 1 ? "person" : "people"} waiting for {startupName}
          </p>
        </div>
      </div>
      <div style={styles.headerRight}>
        <button style={styles.importBtn} onClick={onImport}>
          <Upload size={13} />Import CSV
        </button>
        {count > 0 && (
          <>
            <button style={styles.exportBtn} onClick={onExport}>
              <Download size={13} />Export
            </button>
            <button style={styles.emailBtn} onClick={onComposeToggle}>
              <Mail size={13} />Email Waitlist
            </button>
          </>
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  importBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  exportBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  emailBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};