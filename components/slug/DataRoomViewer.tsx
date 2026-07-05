"use client";

import { useState, useEffect } from "react";
import { FolderOpen, CheckCircle } from "lucide-react";
import { fetchDataRoomDocs, type DataRoomDoc } from "@/lib/data/slugPage";
import DocModal from "@/components/slug/DocModal";

export default function DataRoomViewer({ profileId, startupName }: { profileId: string; startupName: string }) {
  const [docs, setDocs] = useState<DataRoomDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<DataRoomDoc | null>(null);

  useEffect(() => {
    fetchDataRoomDocs(profileId).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [profileId]);

  const sections = [
    { key: "company_overview", label: "Company Overview" },
    { key: "legal", label: "Legal & Corporate" },
    { key: "financials", label: "Financials" },
    { key: "traction", label: "Product & Traction" },
    { key: "team", label: "Team" },
  ];

  if (loading) return <div style={styles.drLoading}><div style={styles.loadingDot} /></div>;

  return (
    <>
      {activeDoc && (
        <DocModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
      )}
      <div style={styles.drViewerWrapper}>
        <div style={styles.drViewerHeader}>
          <div style={styles.drViewerIconBox}>
            <FolderOpen size={20} color="#38a169" />
          </div>
          <div>
            <h3 style={styles.drViewerTitle}>Data Room Access Granted</h3>
            <p style={styles.drViewerSub}>
              You have approved access to {startupName}'s data room. This link expires in 24 hours.
            </p>
          </div>
        </div>
        {sections.map((section) => {
          const sectionDocs = docs.filter((d) => d.section === section.key);
          if (sectionDocs.length === 0) return null;
          return (
            <div key={section.key} style={styles.drSection}>
              <p style={styles.drSectionLabel}>{section.label}</p>
              {sectionDocs.map((doc) => (
                <div key={doc.id} style={styles.drDocRow}>
                  <div style={styles.drDocLeft}>
                    <CheckCircle size={14} color="#38a169" />
                    <span style={styles.drDocTitle}>{doc.title}</span>
                  </div>
                  <button style={styles.drDocViewBtn} onClick={() => setActiveDoc(doc)}>
                    View
                  </button>
                </div>
              ))}
            </div>
          );
        })}
        {docs.length === 0 && (
          <div style={styles.drEmptyDocs}>
            <p style={styles.drEmptyDocsText}>
              The founder hasn't uploaded any documents yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  drLoading: { display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" },
  drViewerWrapper: { display: "flex", flexDirection: "column", gap: "14px" },
  drViewerHeader: { backgroundColor: "#f0fff4", borderRadius: "14px", padding: "20px", border: "1px solid #c6f6d5", display: "flex", alignItems: "flex-start", gap: "14px" },
  drViewerIconBox: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #c6f6d5" },
  drViewerTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  drViewerSub: { fontSize: "13px", color: "#38a169", margin: "0", lineHeight: "1.5" },
  drSection: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  drSectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px 0" },
  drDocRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  drDocLeft: { display: "flex", alignItems: "center", gap: "8px" },
  drDocTitle: { fontSize: "13px", fontWeight: "500", color: "#111111" },
  drDocViewBtn: { fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px", padding: "4px 12px", cursor: "pointer" },
  drEmptyDocs: { backgroundColor: "#fafafa", borderRadius: "12px", padding: "32px", textAlign: "center", border: "1px dashed #e5e5e5" },
  drEmptyDocsText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
};