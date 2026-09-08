"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Mail, ChevronDown, ChevronUp } from "lucide-react";

type Application = {
  id: string;
  applicant_name: string;
  applicant_email: string;
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

function timeAgo(dateString: string) {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RoleBoard({ roleId, roleTitle }: { roleId: string; roleTitle: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
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

  const handleExpand = async (appId: string) => {
    if (expandedId === appId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(appId);

    const { data } = await supabase
      .from("hiring_application_answers")
      .select("question_id, answer_text, hiring_screening_questions(question_text)")
      .eq("application_id", appId);

    setAnswers(
      (data || []).map((a: any) => ({
        question_id: a.question_id,
        answer_text: a.answer_text,
        question_text: a.hiring_screening_questions?.question_text,
      }))
    );
  };

  const handleStatusChange = async (appId: string, status: string) => {
    setSavingId(appId);
    await supabase.from("hiring_applications").update({ status }).eq("id", appId);
    await fetchApplications();
    setSavingId(null);
  };

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>;

  const metCutoff = applications.filter((a) => a.met_cutoff);
  const belowCutoff = applications.filter((a) => !a.met_cutoff);

  const renderRow = (app: Application) => {
    const statusInfo = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];
    const isExpanded = expandedId === app.id;

    return (
      <div key={app.id} style={styles.appCard}>
        <div style={styles.appTop} onClick={() => handleExpand(app.id)}>
          <div style={styles.appLeft}>
            <p style={styles.appName}>{app.applicant_name}</p>
            <p style={styles.appEmail}><Mail size={11} />{app.applicant_email}</p>
            <p style={styles.appMeta}>Score: {app.score} · {timeAgo(app.created_at)}</p>
          </div>
          <div style={styles.appRight}>
            <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
              {statusInfo.label}
            </span>
            {isExpanded ? <ChevronUp size={15} color="#888888" /> : <ChevronDown size={15} color="#888888" />}
          </div>
        </div>

        {isExpanded && (
          <div style={styles.expanded}>
            {answers.length > 0 && (
              <div style={styles.answersList}>
                {answers.map((a) => (
                  <div key={a.question_id} style={styles.answerBlock}>
                    <p style={styles.answerQuestion}>{a.question_text}</p>
                    <p style={styles.answerText}>{a.answer_text}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.statusGrid}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  style={{
                    ...styles.statusBtn,
                    ...(app.status === opt.value ? { backgroundColor: opt.bg, border: `1px solid ${opt.border}`, color: opt.color, fontWeight: 600 } : {}),
                  }}
                  onClick={() => handleStatusChange(app.id, opt.value)}
                  disabled={savingId === app.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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
          {metCutoff.map(renderRow)}
        </>
      )}

      {belowCutoff.length > 0 && (
        <>
          <div style={styles.sectionLabelRow}>
            <XCircle size={13} color="#aaaaaa" />
            <p style={styles.sectionLabel}>Below cutoff ({belowCutoff.length}) — still worth a look</p>
          </div>
          {belowCutoff.map(renderRow)}
        </>
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
  appCard: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: "8px", overflow: "hidden" },
  appTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", gap: "10px" },
  appLeft: { flex: 1, minWidth: 0 },
  appName: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  appEmail: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  appMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  appRight: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  statusBadge: { fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap" },
  expanded: { padding: "0 16px 16px 16px", borderTop: "1px solid #f5f5f5" },
  answersList: { display: "flex", flexDirection: "column", gap: "10px", padding: "14px 0" },
  answerBlock: { backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "10px 12px" },
  answerQuestion: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", margin: "0 0 4px 0" },
  answerText: { fontSize: "13px", color: "#333333", margin: "0" },
  statusGrid: { display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "10px" },
  statusBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
};