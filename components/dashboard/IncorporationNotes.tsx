"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { COUNTRY_NOTES, GENERAL_DISCLAIMER } from "@/lib/data/incorporationNotes";

export default function IncorporationNotes({ country }: { country: string }) {
  const [expanded, setExpanded] = useState(true);
  const notes = COUNTRY_NOTES[country] || [];

  if (notes.length === 0) return null;

  return (
    <div style={styles.card}>
      <button style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <AlertCircle size={15} color="#d69e2e" />
          <span style={styles.headerTitle}>Things to note before you start</span>
        </div>
        {expanded ? <ChevronUp size={14} color="#aaaaaa" /> : <ChevronDown size={14} color="#aaaaaa" />}
      </button>

      {expanded && (
        <div style={styles.body}>
          {notes.map((section) => (
            <div key={section.title} style={styles.section}>
              <p style={styles.sectionTitle}>{section.title}</p>
              <ul style={styles.list}>
                {section.points.map((point, i) => (
                  <li key={i} style={styles.listItem}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
          <div style={styles.disclaimerBox}>
            <p style={styles.disclaimerText}>{GENERAL_DISCLAIMER}</p>
          </div>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#fffbeb", borderRadius: "14px", border: "1px solid #fef08a", marginBottom: "16px", overflow: "hidden" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 18px", backgroundColor: "transparent", border: "none", cursor: "pointer" },
  headerLeft: { display: "flex", alignItems: "center", gap: "8px" },
  headerTitle: { fontSize: "13px", fontWeight: "600", color: "#92610a" },
  body: { padding: "0 18px 18px 18px", display: "flex", flexDirection: "column", gap: "16px" },
  section: {},
  sectionTitle: { fontSize: "12px", fontWeight: "700", color: "#92610a", margin: "0 0 8px 0" },
  list: { margin: "0", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" },
  listItem: { fontSize: "12px", color: "#7a5209", lineHeight: "1.6" },
  disclaimerBox: { paddingTop: "12px", borderTop: "1px solid #fde68a" },
  disclaimerText: { fontSize: "11px", color: "#a16207", lineHeight: "1.6", margin: "0", fontStyle: "italic" },
};