"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Upload, AlertCircle, Link2 } from "lucide-react";

type Question = {
  id: string;
  question_text: string;
  question_type: "yes_no" | "free_text";
  correct_answer: string | null;
  display_order: number;
};

type FieldConfig = { enabled: boolean; mode?: "upload" | "link" | "upload_or_link" };
type ApplicationFields = {
  cv: FieldConfig;
  cover_letter: FieldConfig;
  portfolio_link: FieldConfig;
  linkedin: FieldConfig;
  website: FieldConfig;
  twitter: FieldConfig;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function UploadOrLinkField({
  label,
  mode,
  required,
  fileValue, onFileChange,
  linkValue, onLinkChange,
  bucket,
  error,
}: {
  label: string;
  mode: "upload" | "link" | "upload_or_link";
  required: boolean;
  fileValue: File | null; onFileChange: (f: File | null) => void;
  linkValue: string; onLinkChange: (v: string) => void;
  bucket: string;
  error: string;
}) {
  const [choice, setChoice] = useState<"upload" | "link">(mode === "link" ? "link" : "upload");
  const showUpload = mode === "upload" || (mode === "upload_or_link" && choice === "upload");
  const showLink = mode === "link" || (mode === "upload_or_link" && choice === "link");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      onFileChange(null);
      e.target.value = "";
      return;
    }
    onFileChange(file);
  };

  return (
    <div style={styles.fieldBlock}>
      <label style={styles.label}>{label} {required && <span style={styles.required}>*</span>}</label>

      {mode === "upload_or_link" && (
        <div style={styles.choiceRow}>
          <button
            type="button"
            style={{ ...styles.choiceBtn, ...(choice === "upload" ? styles.choiceBtnActive : {}) }}
            onClick={() => setChoice("upload")}
          >
            Upload file
          </button>
          <button
            type="button"
            style={{ ...styles.choiceBtn, ...(choice === "link" ? styles.choiceBtnActive : {}) }}
            onClick={() => setChoice("link")}
          >
            Share a link
          </button>
        </div>
      )}

      {showUpload && (
        fileValue ? (
          <div style={styles.fileSelected}>
            <span style={styles.fileName}>{fileValue.name}</span>
            <button type="button" style={styles.fileRemoveBtn} onClick={() => onFileChange(null)}>Remove</button>
          </div>
        ) : (
          <label style={styles.uploadBtn}>
            <Upload size={14} color="#888888" />
            Choose file (max 5MB)
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleFile} />
          </label>
        )
      )}

      {showLink && (
        <div style={styles.linkInputRow}>
          <Link2 size={14} color="#888888" />
          <input
            style={styles.linkInput}
            placeholder="https://..."
            value={linkValue}
            onChange={(e) => onLinkChange(e.target.value)}
          />
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={13} color="#d69e2e" />
          <span style={styles.errorBoxText}>{error}</span>
        </div>
      )}
    </div>
  );
}

export default function ApplicationForm({
  roleId,
  questions,
  cutoffScore,
  applicationFields,
}: {
  roleId: string;
  questions: Question[];
  cutoffScore: number;
  applicationFields: ApplicationFields;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvLink, setCvLink] = useState("");
  const [cvError, setCvError] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverLink, setCoverLink] = useState("");

  const [portfolioLink, setPortfolioLink] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const yesNoQuestions = questions.filter((q) => q.question_type === "yes_no");
  const freeTextQuestions = questions.filter((q) => q.question_type === "free_text");

  const hasCv = applicationFields.cv.mode === "link" ? !!cvLink : applicationFields.cv.mode === "upload" ? !!cvFile : !!cvFile || !!cvLink;

  const canSubmit = name && email && hasCv && yesNoQuestions.every((q) => answers[q.id]);

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${roleId}/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("hiring-cvs").upload(path, file);
    if (uploadError) throw uploadError;
    return path;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      let cvPath: string | null = null;
      if (cvFile) cvPath = await uploadFile(cvFile, "cv");

      let coverPath: string | null = null;
      if (coverFile) coverPath = await uploadFile(coverFile, "cover-letter");

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
          cv_url: cvPath,
          cv_link: cvLink || null,
          cover_letter_url: coverPath,
          cover_letter_link: coverLink || null,
          portfolio_link: portfolioLink || null,
          linkedin_url: linkedinUrl || null,
          website_url: websiteUrl || null,
          twitter_url: twitterUrl || null,
          score,
          met_cutoff: metCutoff,
        })
        .select()
        .single();

        if (appError || !application) {
          if (appError?.message?.includes("Too many")) {
            setError(appError.message);
          } else {
            setError("Something went wrong. Please try again.");
          }
          setSubmitting(false);
          return;
        }

      const answerRows = questions
        .filter((q) => answers[q.id])
        .map((q) => ({ application_id: application.id, question_id: q.id, answer_text: answers[q.id] }));

      if (answerRows.length > 0) {
        await supabase.from("hiring_application_answers").insert(answerRows);
      }

      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-hiring-application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_id: application.id, event: "new_application" }),
        }
      ).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
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

      <UploadOrLinkField
        label="CV / Resume"
        mode={applicationFields.cv.mode || "upload_or_link"}
        required
        fileValue={cvFile} onFileChange={setCvFile}
        linkValue={cvLink} onLinkChange={setCvLink}
        bucket="hiring-cvs"
        error={cvError}
      />

      {applicationFields.cover_letter.enabled && (
        <UploadOrLinkField
          label="Cover Letter"
          mode={applicationFields.cover_letter.mode || "upload_or_link"}
          required={false}
          fileValue={coverFile} onFileChange={setCoverFile}
          linkValue={coverLink} onLinkChange={setCoverLink}
          bucket="hiring-cvs"
          error=""
        />
      )}

      {applicationFields.portfolio_link.enabled && (
        <>
          <label style={styles.label}>Portfolio link</label>
          <input style={styles.input} value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} placeholder="https://..." />
        </>
      )}

      {applicationFields.linkedin.enabled && (
        <>
          <label style={styles.label}>LinkedIn</label>
          <input style={styles.input} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
        </>
      )}

      {applicationFields.website.enabled && (
        <>
          <label style={styles.label}>Personal website / GitHub</label>
          <input style={styles.input} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
        </>
      )}

      {applicationFields.twitter.enabled && (
        <>
          <label style={styles.label}>Twitter / X</label>
          <input style={styles.input} value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..." />
        </>
      )}

      {yesNoQuestions.map((q) => (
        <div key={q.id} style={styles.questionBlock}>
          <label style={styles.label}>{q.question_text}</label>
          <div style={styles.yesNoRow}>
            <button style={{ ...styles.yesNoBtn, ...(answers[q.id] === "yes" ? styles.yesNoBtnActive : {}) }} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: "yes" }))}>Yes</button>
            <button style={{ ...styles.yesNoBtn, ...(answers[q.id] === "no" ? styles.yesNoBtnActive : {}) }} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: "no" }))}>No</button>
          </div>
        </div>
      ))}

      {freeTextQuestions.map((q) => (
        <div key={q.id} style={styles.questionBlock}>
          <label style={styles.label}>{q.question_text}</label>
          <textarea style={styles.textarea} value={answers[q.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} />
        </div>
      ))}

      {error && <p style={styles.errorText}>{error}</p>}

      <button style={{ ...styles.submitBtn, opacity: canSubmit && !submitting ? 1 : 0.5 }} onClick={handleSubmit} disabled={!canSubmit || submitting}>
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
  fieldBlock: { marginBottom: "14px" },
  choiceRow: { display: "flex", gap: "6px", marginBottom: "8px" },
  choiceBtn: { flex: 1, padding: "7px", fontSize: "11px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "6px", cursor: "pointer" },
  choiceBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", fontSize: "13px", color: "#888888", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "8px", cursor: "pointer" },
  fileSelected: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "8px" },
  fileName: { fontSize: "12px", color: "#38a169", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileRemoveBtn: { fontSize: "11px", color: "#e53e3e", background: "none", border: "none", cursor: "pointer", fontWeight: "500", flexShrink: 0 },
  linkInputRow: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 13px", border: "1px solid #e5e5e5", borderRadius: "8px", backgroundColor: "#fafafa" },
  linkInput: { flex: 1, border: "none", outline: "none", backgroundColor: "transparent", fontSize: "13px", color: "#111111" },
  errorBox: { display: "flex", alignItems: "flex-start", gap: "6px", padding: "9px 12px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px", marginTop: "8px" },
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