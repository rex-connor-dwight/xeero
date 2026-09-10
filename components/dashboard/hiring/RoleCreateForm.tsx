"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";
import EmploymentSection from "@/components/dashboard/hiring/formSections/EmploymentSection";
import CompensationSection from "@/components/dashboard/hiring/formSections/CompensationSection";
import ScreeningQuestionsSection from "@/components/dashboard/hiring/formSections/ScreeningQuestionsSection";
import ApplicationFieldsSection, { type ApplicationFields } from "@/components/dashboard/hiring/formSections/ApplicationFieldsSection";

const DEFAULT_APPLICATION_FIELDS: ApplicationFields = {
  cv: { enabled: true, mode: "upload_or_link" },
  cover_letter: { enabled: false, mode: "upload_or_link" },
  portfolio_link: { enabled: false },
  linkedin: { enabled: false },
  website: { enabled: false },
  twitter: { enabled: false },
};

type QuestionDraft = { id?: string; question_text: string; question_type: "yes_no" | "free_text"; correct_answer: "yes" | "no" | null };

export default function RoleCreateForm({
  profileId,
  founderSlug,
  existingRole,
  onClose,
  onCreated,
}: {
  profileId: string;
  founderSlug: string;
  existingRole?: any;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { profile } = useXeero();
  const isEditing = !!existingRole;

  const [title, setTitle] = useState(existingRole?.title || "");
  const [employmentType, setEmploymentType] = useState(existingRole?.employment_type || "remote");
  const [jobType, setJobType] = useState(existingRole?.job_type || "full_time");
  const [contractValue, setContractValue] = useState(existingRole?.contract_duration_value?.toString() || "");
  const [contractUnit, setContractUnit] = useState(existingRole?.contract_duration_unit || "months");
  const [aboutSource, setAboutSource] = useState<"custom" | "profile">(existingRole?.about_company_source || "custom");
  const [aboutCompany, setAboutCompany] = useState(existingRole?.about_company || "");
  const [responsibilities, setResponsibilities] = useState(existingRole?.responsibilities || "");
  const [requirements, setRequirements] = useState(existingRole?.requirements || "");
  const [tools, setTools] = useState(existingRole?.tools || "");
  const [whatWeOffer, setWhatWeOffer] = useState(existingRole?.what_we_offer || "");
  const [compAmount, setCompAmount] = useState(existingRole?.compensation_amount || "");
  const [compCurrency, setCompCurrency] = useState(existingRole?.compensation_currency || "USD");
  const [payFrequency, setPayFrequency] = useState(existingRole?.pay_frequency || "monthly");
  const [isEquity, setIsEquity] = useState(existingRole?.is_equity_offered || false);
  const [opensAt, setOpensAt] = useState(
    existingRole?.opens_at ? new Date(existingRole.opens_at).toISOString().slice(0, 16) : ""
  );
  const [closesAt, setClosesAt] = useState(
    existingRole?.closes_at ? new Date(existingRole.closes_at).toISOString().slice(0, 16) : ""
  );
  const [cutoffScore, setCutoffScore] = useState(existingRole?.cutoff_score || 0);
  const [applicationFields, setApplicationFields] = useState<ApplicationFields>(
    existingRole?.application_fields || DEFAULT_APPLICATION_FIELDS
  );
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdRoleId, setCreatedRoleId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    supabase
      .from("hiring_screening_questions")
      .select("*")
      .eq("role_id", existingRole.id)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setQuestions(
          (data || []).map((q) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            correct_answer: q.correct_answer,
          }))
        );
        setLoadingQuestions(false);
      });
  }, [isEditing, existingRole?.id]);

  const addQuestion = (type: "yes_no" | "free_text") => {
    setQuestions((prev) => [...prev, { question_text: "", question_type: type, correct_answer: type === "yes_no" ? "yes" : null }]);
  };

  const updateQuestion = (index: number, field: keyof QuestionDraft, value: any) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit =
    title && employmentType && jobType && responsibilities && requirements && opensAt && closesAt && compAmount &&
    (aboutSource === "profile" || aboutCompany) &&
    (jobType !== "contract" || contractValue);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (new Date(closesAt) <= new Date(opensAt)) {
      setError("Close date must be after the open date.");
      return;
    }
    setSaving(true);
    setError("");

    const rolePayload = {
      title,
      employment_type: employmentType,
      job_type: jobType,
      contract_duration_value: jobType === "contract" ? parseInt(contractValue) || null : null,
      contract_duration_unit: jobType === "contract" ? contractUnit : null,
      about_company_source: aboutSource,
      about_company: aboutSource === "custom" ? aboutCompany : null,
      responsibilities,
      requirements,
      tools: tools || null,
      what_we_offer: whatWeOffer || null,
      compensation_amount: compAmount,
      compensation_currency: compCurrency,
      pay_frequency: payFrequency,
      is_equity_offered: isEquity,
      opens_at: new Date(opensAt).toISOString(),
      closes_at: new Date(closesAt).toISOString(),
      cutoff_score: cutoffScore,
      description: aboutSource === "custom" ? aboutCompany : `${profile?.problem || ""} ${profile?.solution || ""}`.trim(),
      application_fields: applicationFields,
    };

    let roleId = existingRole?.id;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("hiring_roles")
        .update({ ...rolePayload, updated_at: new Date().toISOString() })
        .eq("id", roleId);

      if (updateError) {
        setError("Something went wrong. Please try again.");
        setSaving(false);
        return;
      }

      await supabase.from("hiring_screening_questions").delete().eq("role_id", roleId);
    } else {
      const { data: role, error: roleError } = await supabase
        .from("hiring_roles")
        .insert({ profile_id: profileId, ...rolePayload })
        .select()
        .single();

      if (roleError || !role) {
        setError("Something went wrong. Please try again.");
        setSaving(false);
        return;
      }
      roleId = role.id;
    }

    if (questions.length > 0) {
      const rows = questions.map((q, i) => ({
        role_id: roleId,
        question_text: q.question_text,
        question_type: q.question_type,
        correct_answer: q.question_type === "yes_no" ? q.correct_answer : null,
        display_order: i,
      }));
      await supabase.from("hiring_screening_questions").insert(rows);
    }

    setSaving(false);

    if (isEditing) {
      onCreated();
    } else {
      setCreatedRoleId(roleId);
    }
  };

  const roleLink = createdRoleId ? `https://xeero.me/hiring/${founderSlug}-${createdRoleId}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(roleLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingQuestions) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>
      </div>
    );
  }

  if (createdRoleId) {
    return (
      <div style={styles.card}>
        <div style={styles.successIcon}><CheckCircle size={26} color="#38a169" /></div>
        <h2 style={styles.successTitle}>Role opened</h2>
        <p style={styles.successText}>Share this link so candidates can apply directly.</p>
        <div style={styles.linkRow}>
          <span style={styles.linkText}>{roleLink}</span>
          <button style={styles.copyBtn} onClick={handleCopy}>
            {copied ? <CheckCircle size={13} color="#38a169" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button style={styles.doneBtn} onClick={onCreated}>Done</button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <button style={styles.backBtn} onClick={onClose}><ArrowLeft size={13} />Back</button>

      <h2 style={styles.title}>{isEditing ? "Edit Role" : "Open a Role"}</h2>

      <label style={styles.label}>Role title</label>
      <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Growth & Sales Specialist" />

      <EmploymentSection
        employmentType={employmentType} setEmploymentType={setEmploymentType}
        jobType={jobType} setJobType={setJobType}
        contractValue={contractValue} setContractValue={setContractValue}
        contractUnit={contractUnit} setContractUnit={setContractUnit}
      />

      <label style={styles.label}>About the company</label>
      <div style={styles.segmentRow}>
        <button
          style={{ ...styles.segmentBtn, ...(aboutSource === "custom" ? styles.segmentBtnActive : {}) }}
          onClick={() => setAboutSource("custom")}
        >
          Write new
        </button>
        <button
          style={{ ...styles.segmentBtn, ...(aboutSource === "profile" ? styles.segmentBtnActive : {}) }}
          onClick={() => setAboutSource("profile")}
        >
          Pull from my profile
        </button>
      </div>

      {aboutSource === "custom" ? (
        <textarea
          style={styles.textarea}
          value={aboutCompany}
          onChange={(e) => setAboutCompany(e.target.value)}
          placeholder="What does your company do?"
        />
      ) : (
        <div style={styles.previewBox}>
          <p style={styles.previewLabel}>Will use your profile's problem + solution</p>
          <p style={styles.previewText}>{profile?.problem} {profile?.solution}</p>
        </div>
      )}

      <label style={styles.label}>Key Responsibilities</label>
      <textarea style={styles.textareaLarge} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="What this person will actually do" />

      <label style={styles.label}>Requirements</label>
      <textarea style={styles.textareaLarge} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Experience, skills, background needed" />

      <label style={styles.label}>Tools (optional)</label>
      <textarea style={styles.textarea} value={tools} onChange={(e) => setTools(e.target.value)} placeholder="e.g. Meta Ads Manager, a CRM, Google Sheets" />

      <label style={styles.label}>What We Offer (optional)</label>
      <textarea style={styles.textarea} value={whatWeOffer} onChange={(e) => setWhatWeOffer(e.target.value)} placeholder="Perks, growth opportunities, culture" />

      <CompensationSection
        compAmount={compAmount} setCompAmount={setCompAmount}
        compCurrency={compCurrency} setCompCurrency={setCompCurrency}
        payFrequency={payFrequency} setPayFrequency={setPayFrequency}
        isEquity={isEquity} setIsEquity={setIsEquity}
      />

      <div style={styles.dateRow}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Opens</label>
          <input style={styles.input} type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Closes</label>
          <input style={styles.input} type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
        </div>
      </div>

      <ApplicationFieldsSection fields={applicationFields} setFields={setApplicationFields} />

      <ScreeningQuestionsSection
        questions={questions}
        onAdd={addQuestion}
        onUpdate={updateQuestion}
        onRemove={removeQuestion}
        cutoffScore={cutoffScore}
        setCutoffScore={setCutoffScore}
      />

      {error && <p style={styles.errorText}>{error}</p>}

      <button style={{ ...styles.submitBtn, opacity: canSubmit && !saving ? 1 : 0.5 }} onClick={handleSubmit} disabled={!canSubmit || saving}>
        {saving ? "Saving..." : isEditing ? "Save Changes" : "Open Role"}
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  loadingWrap: { display: "flex", justifyContent: "center", padding: "40px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "16px", padding: "0" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 20px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit" },
  textareaLarge: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "120px", resize: "vertical", fontFamily: "inherit" },
  segmentRow: { display: "flex", gap: "6px" },
  segmentBtn: { flex: 1, padding: "9px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  segmentBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
  previewBox: { backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "12px", border: "1px solid #f0f0f0" },
  previewLabel: { fontSize: "10px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px 0" },
  previewText: { fontSize: "13px", color: "#555555", lineHeight: "1.6", margin: "0" },
  dateRow: { display: "flex", gap: "10px" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "14px 0 0 0" },
  submitBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer", marginTop: "20px" },
  successIcon: { width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto" },
  successTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0", textAlign: "center" },
  successText: { fontSize: "13px", color: "#666666", margin: "0 0 20px 0", textAlign: "center" },
  linkRow: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" },
  linkText: { flex: 1, fontSize: "12px", color: "#444444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  copyBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", fontSize: "12px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  doneBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};