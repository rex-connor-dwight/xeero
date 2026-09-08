"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle } from "lucide-react";

type Question = {
  id: string;
  question_text: string;
  question_type: "yes_no" | "free_text";
  correct_answer: string | null;
  display_order: number;
};

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const yesNoQuestions = questions.filter((q) => q.question_type === "yes_no");
  const freeTextQuestions = questions.filter((q) => q.question_type === "free_text");

  const canSubmit = name && email && yesNoQuestions.every((q) => answers[q.id]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

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
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", marginBottom: "14px" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit" },
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