"use client";

import { useEffect } from "react";
import type { DataRoomDoc } from "@/lib/data/slugPage";

export default function DocModal({ doc, onClose }: { doc: DataRoomDoc; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const renderContent = () => {
    if (doc.file_url) {
      return (
        <iframe
          src={doc.file_url}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={doc.title}
        />
      );
    }

    if (doc.content_json) {
      const content = doc.content_json;

      if (doc.doc_type === "cap_table" && content.rows) {
        return (
          <div style={styles.builtContent}>
            <h3 style={styles.builtTitle}>{doc.title}</h3>
            <div style={styles.tableWrapper}>
              <div style={styles.tableHeader}>
                <span style={styles.tableCell}>Name</span>
                <span style={styles.tableCell}>Role</span>
                <span style={styles.tableCell}>Shares</span>
                <span style={styles.tableCell}>%</span>
              </div>
              {content.rows.map((row: any, i: number) => (
                <div key={i} style={styles.tableRow}>
                  <span style={styles.tableCell}>{row.name || "—"}</span>
                  <span style={styles.tableCell}>{row.role || "—"}</span>
                  <span style={styles.tableCell}>{row.shares || "—"}</span>
                  <span style={styles.tableCell}>{row.percent ? `${row.percent}%` : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (doc.doc_type === "metrics") {
        const fields = [
          { key: "dau", label: "Daily Active Users" },
          { key: "mau", label: "Monthly Active Users" },
          { key: "retention", label: "Retention Rate" },
          { key: "churn", label: "Churn Rate" },
          { key: "nps", label: "NPS Score" },
          { key: "other", label: "Other Metric" },
        ];
        return (
          <div style={styles.builtContent}>
            <h3 style={styles.builtTitle}>{doc.title}</h3>
            <div style={styles.metricsGrid}>
              {fields.filter((f) => content[f.key]).map((f) => (
                <div key={f.key} style={styles.metricCard}>
                  <p style={styles.metricLabel}>{f.label}</p>
                  <p style={styles.metricValue}>{content[f.key]}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div style={styles.builtContent}>
          <h3 style={styles.builtTitle}>{doc.title}</h3>
          {Object.entries(content).map(([key, value]) => {
            if (!value || typeof value !== "string") return null;
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            return (
              <div key={key} style={styles.fieldRow}>
                <p style={styles.fieldLabel}>{label}</p>
                <p style={styles.fieldValue}>{value as string}</p>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{doc.title}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "720px", height: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", overflow: "hidden" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  modalTitle: { fontSize: "14px", fontWeight: "600", color: "#111111" },
  closeBtn: { fontSize: "14px", color: "#888888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" },
  modalBody: { flex: 1, overflow: "auto", minHeight: 0, height: "100%" },
  builtContent: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },
  builtTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0" },
  fieldRow: { borderBottom: "1px solid #f5f5f5", paddingBottom: "16px" },
  fieldLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px 0" },
  fieldValue: { fontSize: "14px", color: "#333333", lineHeight: "1.7", margin: "0", whiteSpace: "pre-wrap" },
  tableWrapper: { border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: "8px", padding: "10px 14px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0" },
  tableRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: "8px", padding: "10px 14px", borderBottom: "1px solid #f9f9f9" },
  tableCell: { fontSize: "13px", color: "#333333" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  metricCard: { backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "16px", border: "1px solid #f0f0f0" },
  metricLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px 0" },
  metricValue: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0" },
};