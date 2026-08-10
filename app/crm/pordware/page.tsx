"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Cpu, ExternalLink } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "#aaaaaa", bg: "#f5f5f5", border: "#eeeeee" },
  { value: "submitted", label: "Submitted", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "under_review", label: "Under Review", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "shortlisted", label: "Shortlisted", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "technical_assessment", label: "Technical Assessment", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "due_diligence", label: "Due Diligence", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "approved", label: "Approved", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
  { value: "rejected", label: "Rejected", color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7" },
  { value: "waitlisted", label: "Waitlisted", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "development_in_progress", label: "In Development", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "completed", label: "Completed", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
];

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CrmPordwarePage() {
  const router = useRouter();
  const { user, loading } = useXeero();
  const [applications, setApplications] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<string>("submitted");

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) {
      supabase
        .from("pordware_applications")
        .select("id, status, startup_name, full_name, email, requested_pordware_amount, submitted_at, created_at")
        .neq("status", "draft")
        .order("submitted_at", { ascending: false })
        .then(({ data }) => {
          setApplications(data || []);
          setDataLoading(false);
        });
    }
  }, [loading, user]);

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerIcon}><Cpu size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Pordware Technology Fund</h1>
          <p style={styles.headerSub}>{applications.length} submitted application{applications.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={styles.filterRow}>
        <button style={{ ...styles.filterBtn, ...(filter === "all" ? styles.filterBtnActive : {}) }} onClick={() => setFilter("all")}>All</button>
        {STATUS_OPTIONS.filter((s) => s.value !== "draft").map((s) => (
          <button
            key={s.value}
            style={{ ...styles.filterBtn, ...(filter === s.value ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyCard}><p style={styles.emptyText}>No applications here.</p></div>
      ) : (
        <div style={styles.list}>
          {filtered.map((app) => {
            const statusInfo = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];
            return (
              <div key={app.id} style={styles.row} onClick={() => router.push(`/crm/pordware/${app.id}`)}>
                <div style={styles.rowLeft}>
                  <p style={styles.rowTitle}>{app.startup_name || "Untitled"}</p>
                  <p style={styles.rowSub}>{app.full_name} · {app.email}</p>
                  <p style={styles.rowMeta}>
                    {app.requested_pordware_amount ? `$${Number(app.requested_pordware_amount).toLocaleString()} requested` : "No amount specified"}
                    {" · "}{timeAgo(app.submitted_at || app.created_at)}
                  </p>
                </div>
                <div style={styles.rowRight}>
                  <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
                    {statusInfo.label}
                  </span>
                  <ExternalLink size={14} color="#cccccc" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "820px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  filterRow: { display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" },
  filterBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  filterBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #dddddd", fontWeight: "600" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "40px", border: "1px solid #f0f0f0", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer", gap: "12px" },
  rowLeft: { flex: 1, minWidth: 0 },
  rowRight: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
  rowTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  rowSub: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  rowMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  statusBadge: { fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap" },
};