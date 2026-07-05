"use client";

import { useRef } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/dashboard/TooltipField";

type ExperienceEntry = { id: string; role: string; company: string; year_start: string; year_end: string };
type EducationEntry = { id: string; degree: string; school: string; year: string };

export default function EditFounderTab({
  data,
  update,
  onPhotoUpload,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
}: {
  data: any;
  update: (field: string, value: any) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addExperience: () => void;
  updateExperience: (id: string, field: keyof ExperienceEntry, value: string) => void;
  removeExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: keyof EducationEntry, value: string) => void;
  removeEducation: (id: string) => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);

  return (
    <div style={styles.sections}>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Basic Info</h2>
        <p style={styles.cardSubtitle}>Who are you?</p>

        <div style={styles.logoUploadRow}>
          <div style={styles.photoCircle}>
            {data.founder_photo_url ? (
              <img src={data.founder_photo_url} alt="photo" style={styles.logoImg} />
            ) : (
              <span style={styles.logoInitial}>{data.founder_name?.[0]?.toUpperCase() || "F"}</span>
            )}
          </div>
          <div>
            <button style={styles.uploadBtn} onClick={() => photoRef.current?.click()}>
              <Upload size={13} />Upload Photo
            </button>
            <p style={styles.hint}>PNG or JPG, max 2MB</p>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoUpload} />
          </div>
        </div>

        <FieldLabel label="Full Name" />
        <input style={styles.input} value={data.founder_name} onChange={(e) => update("founder_name", e.target.value)} placeholder="e.g. John Doe" />

        <FieldLabel label="Role" />
        <input style={styles.input} value={data.founder_role} onChange={(e) => update("founder_role", e.target.value)} placeholder="e.g. CEO & Co-founder" />

        <FieldLabel label="Bio" tooltipKey="founder_bio" />
        <textarea style={styles.textarea} value={data.founder_bio} onChange={(e) => update("founder_bio", e.target.value)} placeholder="2-3 sentences about yourself" />

        <div style={styles.twoCol}>
          <div style={styles.colItem}>
            <FieldLabel label="LinkedIn" />
            <input style={styles.input} value={data.founder_linkedin} onChange={(e) => update("founder_linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div style={styles.colItem}>
            <FieldLabel label="Twitter / X" />
            <input style={styles.input} value={data.founder_twitter} onChange={(e) => update("founder_twitter", e.target.value)} placeholder="https://x.com/..." />
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeaderRow}>
          <div>
            <h2 style={styles.cardTitle}>Experience</h2>
            <p style={styles.cardSubtitle}>Previous roles and companies.</p>
          </div>
          <button style={styles.addBtn} onClick={addExperience}>
            <Plus size={13} />Add
          </button>
        </div>
        {data.founder_experience.length === 0 && <p style={styles.emptyText}>No experience added yet.</p>}
        {data.founder_experience.map((exp: ExperienceEntry) => (
          <div key={exp.id} style={styles.entryCard}>
            <div style={styles.twoCol}>
              <div style={styles.colItem}>
                <label style={styles.label}>Role</label>
                <input style={styles.input} value={exp.role} onChange={(e) => updateExperience(exp.id, "role", e.target.value)} placeholder="e.g. CTO" />
              </div>
              <div style={styles.colItem}>
                <label style={styles.label}>Company</label>
                <input style={styles.input} value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="e.g. Google" />
              </div>
            </div>
            <div style={styles.twoCol}>
              <div style={styles.colItem}>
                <label style={styles.label}>From</label>
                <input style={styles.input} value={exp.year_start} onChange={(e) => updateExperience(exp.id, "year_start", e.target.value)} placeholder="2020" />
              </div>
              <div style={styles.colItem}>
                <label style={styles.label}>To</label>
                <input style={styles.input} value={exp.year_end} onChange={(e) => updateExperience(exp.id, "year_end", e.target.value)} placeholder="Present" />
              </div>
            </div>
            <button style={styles.removeBtn} onClick={() => removeExperience(exp.id)}>
              <Trash2 size={12} />Remove
            </button>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeaderRow}>
          <div>
            <h2 style={styles.cardTitle}>Education</h2>
            <p style={styles.cardSubtitle}>Degrees and institutions.</p>
          </div>
          <button style={styles.addBtn} onClick={addEducation}>
            <Plus size={13} />Add
          </button>
        </div>
        {data.founder_education.length === 0 && <p style={styles.emptyText}>No education added yet.</p>}
        {data.founder_education.map((edu: EducationEntry) => (
          <div key={edu.id} style={styles.entryCard}>
            <label style={styles.label}>Degree</label>
            <input style={styles.input} value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} placeholder="e.g. BSc Computer Science" />
            <div style={styles.twoCol}>
              <div style={styles.colItem}>
                <label style={styles.label}>School</label>
                <input style={styles.input} value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} placeholder="e.g. University of Lagos" />
              </div>
              <div style={styles.colItem}>
                <label style={styles.label}>Year</label>
                <input style={styles.input} value={edu.year} onChange={(e) => updateEducation(edu.id, "year", e.target.value)} placeholder="e.g. 2019" />
              </div>
            </div>
            <button style={styles.removeBtn} onClick={() => removeEducation(edu.id)}>
              <Trash2 size={12} />Remove
            </button>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Achievements & Skills</h2>
        <p style={styles.cardSubtitle}>What makes you stand out?</p>

        <FieldLabel label="Achievements" tooltipKey="founder_achievements" />
        <textarea style={styles.textarea} value={data.founder_achievements} onChange={(e) => update("founder_achievements", e.target.value)} placeholder="e.g. Forbes 30 under 30, YC Alumni, TechCrunch featured" />

        <FieldLabel label="Previous Startups" />
        <textarea style={styles.textarea} value={data.founder_previous_startups} onChange={(e) => update("founder_previous_startups", e.target.value)} placeholder="e.g. Founded PayApp (acquired 2022)" />

        <FieldLabel label="Skills" tooltipKey="founder_skills" />
        <input style={styles.input} value={data.founder_skills} onChange={(e) => update("founder_skills", e.target.value)} placeholder="e.g. Product, Engineering, Fundraising, Sales" />
        <p style={styles.hint}>Separate skills with commas</p>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sections: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  cardSubtitle: { fontSize: "12px", color: "#aaaaaa", margin: "0 0 20px 0" },
  cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#111111" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "14px", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "14px", boxSizing: "border-box", backgroundColor: "#fafafa", minHeight: "96px", resize: "vertical", fontFamily: "inherit", color: "#111111", lineHeight: "1.6" },
  twoCol: { display: "flex", gap: "14px" },
  colItem: { flex: 1 },
  hint: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  logoUploadRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  photoCircle: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoInitial: { fontSize: "18px", fontWeight: "700", color: "#ffffff" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", marginBottom: "4px" },
  addBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", color: "#111111", backgroundColor: "#f5f5f5", border: "none", borderRadius: "8px", cursor: "pointer" },
  removeBtn: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#e53e3e", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "500", padding: "0" },
  entryCard: { backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "14px", marginBottom: "10px", border: "1px solid #f0f0f0" },
  emptyText: { fontSize: "13px", color: "#cccccc", textAlign: "center", padding: "20px 0", margin: "0" },
};