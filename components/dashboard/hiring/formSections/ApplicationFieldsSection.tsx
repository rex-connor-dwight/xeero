"use client";

export type FieldConfig = { enabled: boolean; mode?: "upload" | "link" | "upload_or_link" };
export type ApplicationFields = {
  cv: FieldConfig;
  cover_letter: FieldConfig;
  portfolio_link: FieldConfig;
  linkedin: FieldConfig;
  website: FieldConfig;
  twitter: FieldConfig;
};

const MODE_OPTIONS = [
  { value: "upload", label: "Upload only" },
  { value: "link", label: "Link only" },
  { value: "upload_or_link", label: "Applicant's choice" },
];

export default function ApplicationFieldsSection({
  fields,
  setFields,
}: {
  fields: ApplicationFields;
  setFields: (f: ApplicationFields) => void;
}) {
  const toggle = (key: keyof ApplicationFields) => {
    setFields({ ...fields, [key]: { ...fields[key], enabled: !fields[key].enabled } });
  };

  const setMode = (key: "cv" | "cover_letter", mode: string) => {
    setFields({ ...fields, [key]: { ...fields[key], mode: mode as any } });
  };

  return (
    <>
      <label style={styles.label}>What should applicants submit?</label>

      <div style={styles.fieldRow}>
        <label style={styles.checkboxRow}>
          <input type="checkbox" checked disabled />
          <span>CV / Resume <span style={styles.alwaysOn}>always required</span></span>
        </label>
        <select style={styles.modeSelect} value={fields.cv.mode} onChange={(e) => setMode("cv", e.target.value)}>
          {MODE_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div style={styles.fieldRow}>
        <label style={styles.checkboxRow}>
          <input type="checkbox" checked={fields.cover_letter.enabled} onChange={() => toggle("cover_letter")} />
          <span>Cover Letter</span>
        </label>
        {fields.cover_letter.enabled && (
          <select style={styles.modeSelect} value={fields.cover_letter.mode} onChange={(e) => setMode("cover_letter", e.target.value)}>
            {MODE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        )}
      </div>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={fields.portfolio_link.enabled} onChange={() => toggle("portfolio_link")} />
        <span>Portfolio link</span>
      </label>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={fields.linkedin.enabled} onChange={() => toggle("linkedin")} />
        <span>LinkedIn</span>
      </label>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={fields.website.enabled} onChange={() => toggle("website")} />
        <span>Personal website / GitHub</span>
      </label>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={fields.twitter.enabled} onChange={() => toggle("twitter")} />
        <span>Twitter / X</span>
      </label>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "8px", marginTop: "14px" },
  fieldRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "8px" },
  checkboxRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#444444", cursor: "pointer" },
  alwaysOn: { fontSize: "10px", color: "#bbbbbb", fontWeight: "500" },
  modeSelect: { padding: "6px 9px", fontSize: "11px", border: "1px solid #e5e5e5", borderRadius: "6px", outline: "none", backgroundColor: "#fafafa", color: "#666666", flexShrink: 0 },
};