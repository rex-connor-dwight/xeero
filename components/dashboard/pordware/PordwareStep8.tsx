"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, Upload, X, AlertCircle } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

type UploadedDoc = { id: string; file_name: string; file_path: string };

export default function PordwareStep8({
  activeProfile,
  application,
  saving,
  onNext,
  onBack,
}: {
  activeProfile: any;
  application: any;
  saving: boolean;
  onNext: (data: Record<string, any>) => void;
  onBack: () => void;
}) {
  const [evidenceNotes, setEvidenceNotes] = useState(application?.evidence_notes || "");
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!application?.id) return;
    supabase
      .from("pordware_application_documents")
      .select("id, file_name, file_path")
      .eq("application_id", application.id)
      .then(({ data }) => setDocs(data || []));
  }, [application]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");

    if (docs.length + files.length > MAX_FILES) {
      setUploadError(`You can upload up to ${MAX_FILES} files total.`);
      return;
    }

    const oversized = files.find((f) => f.size > MAX_SIZE_BYTES);
    if (oversized) {
      setUploadError(`"${oversized.name}" is over 2MB. Please resize or compress it and try again.`);
      return;
    }

    if (!application?.id) {
      setUploadError("Please save this step once before uploading files.");
      return;
    }

    setUploading(true);
    for (const file of files) {
      const path = `${activeProfile.user_id}/${application.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("pordware-evidence")
        .upload(path, file);

      if (!uploadErr) {
        const { data: inserted } = await supabase
          .from("pordware_application_documents")
          .insert({
            application_id: application.id,
            file_name: file.name,
            file_path: path,
            file_size_bytes: file.size,
          })
          .select("id, file_name, file_path")
          .single();

        if (inserted) setDocs((prev) => [...prev, inserted]);
      }
    }
    setUploading(false);
  };

  const handleRemoveDoc = async (docId: string, filePath: string) => {
    await supabase.storage.from("pordware-evidence").remove([filePath]);
    await supabase.from("pordware_application_documents").delete().eq("id", docId);
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleNext = () => {
    onNext({ evidence_notes: evidenceNotes || null });
  };

  return (
    <div style={styles.card}>
      <p style={styles.stepLabel}>Step 8 of 9</p>
      <h2 style={styles.title}>Validation Evidence</h2>
      <p style={styles.subtitle}>
        Testimonials, revenue evidence, purchase orders, waitlists, letters of intent, screenshots, survey results,
        interview summaries, or an existing product/demo. Prioritize evidence over presentation.
      </p>

      <label style={styles.label}>Evidence notes (optional context for what you're uploading)</label>
      <textarea style={styles.textarea} value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} />

      <label style={styles.label}>Upload files ({docs.length}/{MAX_FILES}, max 2MB each)</label>

      {docs.length > 0 && (
        <div style={styles.docList}>
          {docs.map((doc) => (
            <div key={doc.id} style={styles.docRow}>
              <span style={styles.docName}>{doc.file_name}</span>
              <button style={styles.removeBtn} onClick={() => handleRemoveDoc(doc.id, doc.file_path)}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {docs.length < MAX_FILES && (
        <label style={styles.uploadBtn}>
          <Upload size={14} color="#888888" />
          {uploading ? "Uploading..." : "Choose files"}
          <input
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      )}

      {uploadError && (
        <div style={styles.errorBox}>
          <AlertCircle size={13} color="#d69e2e" />
          <span style={styles.errorText}>{uploadError}</span>
        </div>
      )}

      <div style={styles.navRow}>
        <button style={styles.backBtn} onClick={onBack}><ArrowLeft size={13} />Back</button>
        <button
          style={{ ...styles.nextBtn, opacity: !saving ? 1 : 0.5 }}
          onClick={handleNext}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save & Continue"}
          {!saving && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  stepLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px 0" },
  title: { fontSize: "19px", fontWeight: "700", color: "#111111", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 20px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box", minHeight: "60px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  docList: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" },
  docRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "8px" },
  docName: { fontSize: "12px", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", color: "#e53e3e", display: "flex", flexShrink: 0 },
  uploadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", fontSize: "13px", color: "#888888", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "10px", cursor: "pointer", justifyContent: "center" },
  errorBox: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px", marginTop: "10px" },
  errorText: { fontSize: "12px", color: "#92610a", lineHeight: "1.5" },
  navRow: { display: "flex", gap: "10px", marginTop: "24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "13px 18px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "10px", cursor: "pointer" },
  nextBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};