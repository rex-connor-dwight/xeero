"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { ArrowLeft, Cpu, Send, CheckCircle } from "lucide-react";
import ApplicationDetail from "@/components/crm/pordware/ApplicationDetail";

const ADMIN_EMAILS = ["connor@xeero.me"];

const STATUS_OPTIONS = [
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

export default function CrmPordwareDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useXeero();
  const [app, setApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [notifying, setNotifying] = useState(false);
  const [notifySent, setNotifySent] = useState(false);

  const fetchData = async () => {
    const { data: appData } = await supabase
      .from("pordware_applications")
      .select("*")
      .eq("id", params.id)
      .single();

    if (appData) {
      setApp(appData);

      const { data: docs } = await supabase
        .from("pordware_application_documents")
        .select("*")
        .eq("application_id", appData.id);

      const docsWithUrls = await Promise.all(
        (docs || []).map(async (doc) => {
          const { data: signed } = await supabase.storage
            .from("pordware-evidence")
            .createSignedUrl(doc.file_path, 3600);
          return { ...doc, signedUrl: signed?.signedUrl };
        })
      );
      setDocuments(docsWithUrls);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handleStatusChange = async (status: string) => {
    setSavingStatus(true);
    await supabase
      .from("pordware_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", app.id);
    await fetchData();
    setSavingStatus(false);
  };

  const handleNotify = async () => {
    setNotifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-pordware-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ application_id: app.id, review_note: notesDraft || null }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setNotifySent(true);
        setTimeout(() => setNotifySent(false), 4000);
      }
    } catch (err) {
      console.error("notify error:", err);
    }
    setNotifying(false);
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  if (!app) {
    return <div style={styles.page}><p>Application not found.</p></div>;
  }

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => router.push("/crm/pordware")}>
        <ArrowLeft size={14} />All Applications
      </button>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Cpu size={18} color="#111111" /></div>
        <div style={{ flex: 1 }}>
          <h1 style={styles.headerTitle}>{app.startup_name || "Untitled"}</h1>
          <p style={styles.headerSub}>{app.full_name} · {app.email}</p>
        </div>
        <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
          {statusInfo.label}
        </span>
      </div>

      <div style={styles.actionCard}>
        <p style={styles.actionLabel}>Update Status</p>
        <div style={styles.statusGrid}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={{
                ...styles.statusBtn,
                ...(app.status === opt.value ? { backgroundColor: opt.bg, border: `1px solid ${opt.border}`, color: opt.color, fontWeight: 600 } : {}),
              }}
              onClick={() => handleStatusChange(opt.value)}
              disabled={savingStatus}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p style={styles.actionLabel}>Notify Founder</p>
        <textarea
          style={styles.textarea}
          placeholder="Optional note to include in the email (e.g. what's next, what's needed)"
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
        />
        <button
          style={{ ...styles.notifyBtn, opacity: notifying ? 0.6 : 1 }}
          onClick={handleNotify}
          disabled={notifying}
        >
          {notifySent ? <><CheckCircle size={13} />Notified</> : <><Send size={13} />{notifying ? "Sending..." : "Send Update Email"}</>}
        </button>
      </div>

      <ApplicationDetail app={app} documents={documents} />
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "820px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", padding: "0" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  statusBadge: { fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "99px", flexShrink: 0, whiteSpace: "nowrap" },
  actionCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "16px" },
  actionLabel: { fontSize: "12px", fontWeight: "600", color: "#555555", margin: "0 0 8px 0" },
  statusGrid: { display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" },
  statusBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "60px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111", marginBottom: "10px" },
  notifyBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};