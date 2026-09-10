"use client";

import { Plus, Trash2 } from "lucide-react";

type QuestionDraft = { id?: string; question_text: string; question_type: "yes_no" | "free_text"; correct_answer: "yes" | "no" | null };

export default function ScreeningQuestionsSection({
  questions,
  onAdd,
  onUpdate,
  onRemove,
  cutoffScore,
  setCutoffScore,
}: {
  questions: QuestionDraft[];
  onAdd: (type: "yes_no" | "free_text") => void;
  onUpdate: (index: number, field: keyof QuestionDraft, value: any) => void;
  onRemove: (index: number) => void;
  cutoffScore: number;
  setCutoffScore: (v: number) => void;
}) {
  return (
    <>
      <label style={styles.label}>Cutoff score (number of correct yes/no answers to be flagged as a strong fit)</label>
      <input style={styles.input} type="number" min="0" value={cutoffScore} onChange={(e) => setCutoffScore(parseInt(e.target.value) || 0)} />

      <label style={styles.label}>Screening Questions</label>
      {questions.map((q, i) => (
        <div key={i} style={styles.questionRow}>
          <input
            style={styles.questionInput}
            placeholder={q.question_type === "yes_no" ? "Yes/No question" : "Free-text question"}
            value={q.question_text}
            onChange={(e) => onUpdate(i, "question_text", e.target.value)}
          />
          {q.question_type === "yes_no" && (
            <select
              style={styles.correctSelect}
              value={q.correct_answer || "yes"}
              onChange={(e) => onUpdate(i, "correct_answer", e.target.value)}
            >
              <option value="yes">Correct: Yes</option>
              <option value="no">Correct: No</option>
            </select>
          )}
          <button style={styles.removeBtn} onClick={() => onRemove(i)}><Trash2 size={13} /></button>
        </div>
      ))}

      <div style={styles.addQuestionRow}>
        <button style={styles.addBtn} onClick={() => onAdd("yes_no")}><Plus size={13} />Yes/No Question</button>
        <button style={styles.addBtn} onClick={() => onAdd("free_text")}><Plus size={13} />Free-Text Question</button>
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  questionRow: { display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" },
  questionInput: { flex: 1, padding: "9px 12px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111" },
  correctSelect: { padding: "9px 10px", fontSize: "12px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111" },
  removeBtn: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e", flexShrink: 0 },
  addQuestionRow: { display: "flex", gap: "8px", marginTop: "12px" },
  addBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
};