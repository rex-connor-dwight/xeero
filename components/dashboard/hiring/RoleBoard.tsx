"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Mail, X } from "lucide-react";
import ApplicationDetailFields from "@/components/dashboard/hiring/ApplicationDetailFields";

type Application = {
  id: string;
  applicant_name: string;
  applicant_email: string;
  cv_url: string | null;
  cv_link: string | null;
  cover_letter_url: string | null;
  cover_letter_link: string | null;
  portfolio_link: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  twitter_url: string | null;
  score: number;
  met_cutoff: boolean;
  status: string;
  created_at: string;
};

type Answer = { question_id: string; answer_text: string; question_text?: string };

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "reviewing", label: "Reviewing", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "shortlisted", label: "Shortlisted", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
  { value: "rejected", label: "Rejected", color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7" },
  { value: "hired", label: "Hired", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
];

const AUTO_NOTIFY_STATUSES = ["reviewing", "shortlisted", "rejected", "hired"];

function timeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getFileExtension(url: string) {
  const clean = url.split("?")[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : "pdf";
}

export default function RoleBoard({ roleId, roleTitle }: { roleId: string; roleTitle: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [cvSignedUrl, setCvSignedUrl] = useState<string | null>(null);
  const [coverSignedUrl, setCoverSignedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [downloadingCover, setDownloadingCover] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("hiring_applications")
      .select("*")
      .eq("role_id", roleId)
      .order("met_cutoff", { ascending: false })
      .order("score", { ascending: false });
    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [roleId]);

  const openApplication = async (app: Application) => {
    setSelectedApp(app);
    setCvSignedUrl(null);
    setCoverSignedUrl(null);

    const { data } = await supabase
      .from("hiring_application_answers")
      .select("question_id, answer_text, hiring_screening_questions(question_text)")
      .eq("application_id", app.id);

    setAnswers(
      (data || []).map((a: any) => ({
        question_id: a.question_id,
        answer_text: a.answer_text,
        question_text: a.hiring_screening_questions?.question_text,
      }))
    );

    if (app.cv_url) {
      const { data: signed } = await supabase.storage.from("hiring-cvs").createSignedUrl(app.cv_url, 3600);
      setCvSignedUrl(signed?.signedUrl || null);
    }
    if (app.cover_letter_url) {
      const { data: signed } = await supabase.storage.from("hiring-cvs").createSignedUrl(app.cover_letter_url, 3600);
      setCoverSignedUrl(signed?.signedUrl || null);
    }
  };

  const handleDownload = async (signedUrl: string, filePath: string, label: string, setDownloading: (v: boolean) => void) => {
    if (!selectedApp) return;
    setDownloading(true);
    try {
      const res = await fetch(signedUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const ext = getFileExtension(filePath);
      const safeName = selectedApp.applicant_name.trim().replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, " ");
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${safeName} ${label}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(false);
  };

  const handleStatusChange = async (appId: string, status: string) => {
    setSavingId(appId);
    await supabase.from("hiring_applications").update({ status }).eq("id", appId);

    if (AUTO_NOTIFY_STATUSES.includes(status)) {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-hiring-application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: appId, event: status }),
        }
      ).catch(() => {});
    }

    await fetchApplications();
    setSelectedApp((prev) => (prev ? { ...prev, status } : prev));
    setSavingId(null);
  };

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>;

  const metCutoff = applications.filter((a) => a.met_cutoff);
  const belowCutoff = applications.filter((a) => !a.met_cutoff);

  const renderListRow = (app: Application) => {
    const statusInfo = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];
    return (
      <button key={app.id} style={styles.listRow} onClick={() => openApplication(app)}>
        <div style={styles.listRowLeft}>
          <p style={styles.listName}>{app.applicant_name}</p>
          <p style={styles.listMeta}>Score: {app.score} · {timeAgo(app.created_at)}</p>
        </div>
        <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
          {statusInfo.label}
        </span>
      </button>
    );
  };

  return (
    <div>
      <h3 style={styles.boardTitle}>{roleTitle} — Applications</h3>

      {applications.length === 0 && <p style={styles.emptyText}>No applications yet.</p>}

      {metCutoff.length > 0 && (
        <>
          <div style={styles.sectionLabelRow}>
            <CheckCircle size={13} color="#38a169" />
            <p style={styles.sectionLabel}>Met cutoff ({metCutoff.length})</p>
          </div>
          <div style={styles.list}>{metCutoff.map(renderListRow)}</div>
        </>
      )}

      {belowCutoff.length > 0 && (
        <>
          <div style={styles.sectionLabelRow}>
            <XCircle size={13} color="#aaaaaa" />
            <p style={styles.sectionLabel}>Below cutoff ({belowCutoff.length}) — still worth a look</p>
          </div>
          <div style={styles.list}>{belowCutoff.map(renderListRow)}</div>
        </>
      )}

      {selectedApp && (
        <div style={styles.modalOverlay} onClick={() => setSelectedApp(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <p style={styles.modalName}>{selectedApp.applicant_name}</p>
                <p style={styles.modalEmail}><Mail size={11} />{selectedApp.applicant_email}</p>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setSelectedApp(null)}>
                <X size={16} color="#888888" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <ApplicationDetailFields
                app={selectedApp}
                cvSignedUrl={cvSignedUrl}
                coverSignedUrl={coverSignedUrl}
                onPreviewCv={() => { setPreviewUrl(cvSignedUrl); setPreviewLabel("CV"); }}
                onPreviewCover={() => { setPreviewUrl(coverSignedUrl); setPreviewLabel("Cover Letter"); }}
                onDownloadCv={() => cvSignedUrl && selectedApp.cv_url && handleDownload(cvSignedUrl, selectedApp.cv_url, "CV", setDownloadingCv)}
                onDownloadCover={() => coverSignedUrl && selectedApp.cover_letter_url && handleDownload(coverSignedUrl, selectedApp.cover_letter_url, "Cover Letter", setDownloadingCover)}
                downloadingCv={downloadingCv}
                downloadingCover={downloadingCover}
              />

              {answers.length > 0 && (
                <div style={styles.answersList}>
                  <p style={styles.answersLabel}>Screening Responses</p>
                  {answers.map((a) => {
                    const isYesNo = a.answer_text === "yes" || a.answer_text === "no";
                    return (
                      <div key={a.question_id} style={styles.answerBlock}>
                        <p style={styles.answerQuestion}>{a.question_text}</p>
                        {isYesNo ? (
                          <span style={{
                            ...styles.answerBadge,
                            ...(a.answer_text === "yes" ? styles.answerBadgeYes : styles.answerBadgeNo),
                          }}>
                            {a.answer_text === "yes" ? "Yes" : "No"}
                          </span>
                        ) : (
                          <p style={styles.answerText}>{a.answer_text}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <p style={styles.statusLabel}>Status</p>
              <div style={styles.statusGrid}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    style={{
                      ...styles.statusBtn,
                      ...(selectedApp.status === opt.value ? { backgroundColor: opt.bg, border: `1px solid ${opt.border}`, color: opt.color, fontWeight: 600 } : {}),
                    }}
                    onClick={() => handleStatusChange(selectedApp.id, opt.value)}
                    disabled={savingId === selectedApp.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div style={styles.previewOverlay} onClick={() => setPreviewUrl(null)}>
          <div style={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.previewHeader}>
              <p style={styles.previewTitle}>{selectedApp?.applicant_name}'s {previewLabel}</p>
              <button style={styles.previewCloseBtn} onClick={() => setPreviewUrl(null)}>
                <X size={16} color="#888888" />
              </button>
            </div>
            <iframe src={previewUrl} style={styles.previewFrame} title="Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  loadingWrap: { display: "flex", justifyContent: "center", padding: "40px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  boardTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 16px 0" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
  sectionLabelRow: { display: "flex", alignItems: "center", gap: "6px", margin: "18px 0 10px 0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0" },
  list: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  listRow: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" },
  listRowLeft: { minWidth: 0 },
  listName: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  listMeta: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  statusBadge: { fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap", flexShrink: 0 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "460px", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  modalName: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 3px 0" },
  modalEmail: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#888888", margin: "0" },
  modalCloseBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", flexShrink: 0 },
  modalBody: { padding: "18px 20px", overflowY: "auto" },
  answersList: { display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0 14px 0" },
  answersLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" },
  answerBlock: { backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "10px", padding: "12px 14px" },
  answerQuestion: { fontSize: "13px", fontWeight: "500", color: "#333333", margin: "0 0 8px 0", lineHeight: "1.5" },
  answerText: { fontSize: "13px", color: "#555555", margin: "0", lineHeight: "1.6" },
  answerBadge: { display: "inline-block", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px" },
  answerBadgeYes: { color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5" },
  answerBadgeNo: { color: "#e53e3e", backgroundColor: "#fff5f5", border: "1px solid #fed7d7" },
  statusLabel: { fontSize: "12px", fontWeight: "600", color: "#555555", margin: "14px 0 8px 0" },
  statusGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  statusBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  previewOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  previewModal: { backgroundColor: "#ffffff", borderRadius: "12px", width: "100%", maxWidth: "700px", height: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  previewHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 },
  previewTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0" },
  previewCloseBtn: { background: "none", border: "none", cursor: "pointer", display: "flex" },
  previewFrame: { flex: 1, width: "100%", border: "none" },
};