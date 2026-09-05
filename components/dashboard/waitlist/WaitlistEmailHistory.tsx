"use client";

import { useState } from "react";
import { Mail, ChevronDown, ChevronUp } from "lucide-react";

type EmailHistory = { id: string; subject: string; sent_count: number; created_at: string };

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function WaitlistEmailHistory({ history }: { history: EmailHistory[] }) {
  const [showHistory, setShowHistory] = useState(false);
  if (history.length === 0) return null;

  return (
    <div style={styles.historySection}>
      <button style={styles.historyToggle} onClick={() => setShowHistory(!showHistory)}>
        <Mail size={13} color="#888888" />
        <span style={styles.historyToggleText}>Email history ({history.length})</span>
        {showHistory ? <ChevronUp size={14} color="#888888" /> : <ChevronDown size={14} color="#888888" />}
      </button>
      {showHistory && (
        <div style={styles.historyList}>
          {history.map((h) => (
            <div key={h.id} style={styles.historyRow}>
              <div style={styles.historyLeft}>
                <div style={styles.historyIcon}><Mail size={12} color="#888888" /></div>
                <div>
                  <p style={styles.historySubject}>{h.subject}</p>
                  <p style={styles.historyMeta}>{timeAgo(h.created_at)}</p>
                </div>
              </div>
              <span style={styles.historySentCount}>{h.sent_count} sent</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  historySection: { marginBottom: "16px" },
  historyToggle: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "10px", cursor: "pointer", width: "100%" },
  historyToggleText: { fontSize: "13px", fontWeight: "500", color: "#888888", flex: 1, textAlign: "left" },
  historyList: { backgroundColor: "#ffffff", borderRadius: "0 0 10px 10px", border: "1px solid #f0f0f0", borderTop: "none", overflow: "hidden" },
  historyRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f9f9f9" },
  historyLeft: { display: "flex", alignItems: "center", gap: "10px" },
  historyIcon: { width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  historySubject: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0 0 2px 0" },
  historyMeta: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  historySentCount: { fontSize: "12px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", padding: "3px 10px", borderRadius: "99px", border: "1px solid #c6f6d5", flexShrink: 0 },
};