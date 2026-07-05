"use client";

import { FileText } from "lucide-react";

export default function DeckTab({
  deckSignedUrl,
  emptyCta,
}: {
  deckSignedUrl: string | null;
  emptyCta?: { label: string; onClick: () => void };
}) {
  return (
    <div style={styles.deckWrapper}>
      {deckSignedUrl ? (
        <div style={styles.deckViewerCard}>
          <div style={styles.deckViewerHeader}>
            <div style={styles.deckViewerTitleRow}>
              <FileText size={16} color="#111111" />
              <span style={styles.deckViewerTitleText}>Pitch Deck</span>
            </div>
            <a href={deckSignedUrl} target="_blank" rel="noopener noreferrer" style={styles.deckDownloadBtn}>
              Download PDF
            </a>
          </div>
          <div style={styles.deckIframeWrapper}>
            <iframe src={deckSignedUrl} style={styles.deckIframe} title="Pitch Deck" />
          </div>
        </div>
      ) : (
        <div style={styles.deckEmptyCard}>
          <div style={styles.deckEmptyIconWrapper}><FileText size={28} color="#cccccc" /></div>
          <h3 style={styles.deckEmptyTitle}>No deck uploaded yet</h3>
          <p style={styles.deckEmptyText}>
            {emptyCta
              ? "Upload a pitch deck so investors can view it here."
              : "This startup hasn't uploaded a pitch deck yet. Check back soon."}
          </p>
          {emptyCta && (
            <button style={styles.deckEmptyCtaBtn} onClick={emptyCta.onClick}>
              {emptyCta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  deckWrapper: { display: "flex", flexDirection: "column", gap: "14px" },
  deckViewerCard: { backgroundColor: "#ffffff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" },
  deckViewerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" },
  deckViewerTitleRow: { display: "flex", alignItems: "center", gap: "8px" },
  deckViewerTitleText: { fontSize: "14px", fontWeight: "600", color: "#111111" },
  deckDownloadBtn: { padding: "6px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px", textDecoration: "none" },
  deckIframeWrapper: { width: "100%", height: "600px", backgroundColor: "#f9f9f9" },
  deckIframe: { width: "100%", height: "100%", border: "none" },
  deckEmptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  deckEmptyIconWrapper: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  deckEmptyTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  deckEmptyText: { fontSize: "13px", color: "#999999", margin: "0 0 20px 0", lineHeight: "1.6", maxWidth: "280px" },
  deckEmptyCtaBtn: { padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};