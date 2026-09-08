"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";

type Question = {
  id: string;
  question_text: string;
  question_type: "yes_no" | "free_text";
  correct_answer: string | null;
  display_order: number;
};

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ApplicationForm({
  roleId,
  questions,
  cutoffScore,
}: {
  roleId: string;
  questions: Question[];
  cutoffScore: number;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const yesNoQuestions = questions.filter((q) => q.question_type === "yes_no");
  const freeTextQuestions = questions.filter((q) => q.question_type === "free_text");

  const canSubmit = name && email && cvFile && yesNoQuestions.every((q) => answers[q.id]);

  const handleCvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCvError("");
    if (!file) return;

    if (file.size > MAX_CV_SIZE_BYTES) {
      setCvError("This file is over 5MB. Please reduce your file size and try again.");
      setCvFile(null);
      e.target.value = "";
      return;
    }

    setCvFile(file);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !cvFile) return;
    setSubmitting(true);
    setError("");

    // Upload CV first
    const ext = cvFile.name.split(".").pop();
    const path = `${roleId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("hiring-cvs")
      .upload(path, cvFile);

    if (uploadError) {
      setError("Something went wrong uploading your CV. Please try again.");
      setSubmitting(false);
      return;
    }

    // Score: count how many yes/no answers match the founder's expected correct_answer
    let score = 0;
    yesNoQuestions.forEach((q) => {
      if (q.correct_answer && answers[q.id] === q.correct_answer) score++;
    });
    const metCutoff = score >= cutoffScore;

    const { data: application, error: appError } = await supabase
      .from("hiring_applications")
      .insert({
        role_id: roleId,
        applicant_name: name,
        applicant_email: email,
        cv_url: path,
        score,
        met_cutoff: metCutoff,
      })
      .select()
      .single();

    if (appError || !application) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    const answerRows = questions
      .filter((q) => answers[q.id])
      .map((q) => ({
        application_id: application.id,
        question_id: q.id,
        answer_text: answers[q.id],
      }));

    if (answerRows.length > 0) {
      await supabase.from("hiring_application_answers").insert(answerRows);
    }

    // Notify the founder of a new application
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-hiring-application`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: application.id, event: "new_application" }),
      }
    ).catch(() => {});

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={styles.successCard}>
        <div style={styles.successIcon}><CheckCircle size={26} color="#38a169" /></div>
        <h3 style={styles.successTitle}>Application submitted</h3>
        <p style={styles.successText}>Thanks for applying. The team will review your application and follow up if it's a fit.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.formTitle}>Apply for this role</h3>

      <label style={styles.label}>Your name</label>
      <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />

      <label style={styles.label}>Your email</label>
      <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label style={styles.label}>Your CV <span style={styles.required}>*</span></label>
      {cvFile ? (
        <div style={styles.cvSelected}>
          <span style={styles.cvFileName}>{cvFile.name}</span>
          <button style={styles.cvRemoveBtn} onClick={() => setCvFile(null)}>Remove</button>
        </div>
      ) : (
        <label style={styles.uploadBtn}>
          <Upload size={14} color="#888888" />
          Choose file (max 5MB)
          <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleCvSelect} />
        </label>
      )}
      {cvError && (
        <div style={styles.errorBox}>
          <AlertCircle size={13} color="#d69e2e" />
          <span style={styles.errorBoxText}>{cvError}</span>
        </div>
      )}

      {yesNoQuestions.map((q) => (
        <div key={q.id} style={styles.questionBlock}>
          <label style={styles.label}>{q.question_text}</label>
          <div style={styles.yesNoRow}>
            <button
              style={{ ...styles.yesNoBtn, ...(answers[q.id] === "yes" ? styles.yesNoBtnActive : {}) }}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: "yes" }))}
            >
              Yes
            </button>
            <button
              style={{ ...styles.yesNoBtn, ...(answers[q.id] === "no" ? styles.yesNoBtnActive : {}) }}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: "no" }))}
            >
              No
            </button>
          </div>
        </div>
      ))}

      {freeTextQuestions.map((q) => (
        <div key={q.id} style={styles.questionBlock}>
          <label style={styles.label}>{q.question_text}</label>
          <textarea
            style={styles.textarea}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          />
        </div>
      ))}

      {error && <p style={styles.errorText}>{error}</p>}

      <button
        style={{ ...styles.submitBtn, opacity: canSubmit && !submitting ? 1 : 0.5 }}
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  formTitle: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0 0 18px 0" },
  label: { fontSize: "13px", fontWeight: "500", color: "#111111", display: "block", marginBottom: "6px" },
  required: { color: "#e53e3e" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", marginBottom: "14px" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", fontSize: "13px", color: "#888888", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "8px", cursor: "pointer", marginBottom: "8px" },
  cvSelected: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "8px", marginBottom: "8px" },
  cvFileName: { fontSize: "12px", color: "#38a169", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cvRemoveBtn: { fontSize: "11px", color: "#e53e3e", background: "none", border: "none", cursor: "pointer", fontWeight: "500", flexShrink: 0 },
  errorBox: { display: "flex", alignItems: "flex-start", gap: "6px", padding: "9px 12px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px", marginBottom: "14px" },
  errorBoxText: { fontSize: "11px", color: "#92610a", lineHeight: "1.5" },
  questionBlock: { marginBottom: "16px" },
  yesNoRow: { display: "flex", gap: "8px" },
  yesNoBtn: { flex: 1, padding: "10px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  yesNoBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0 0 12px 0" },
  submitBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  successCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px 28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" },
  successIcon: { width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto" },
  successTitle: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  successText: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0" },
};