"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Settings, User, Save, CheckCircle, Upload } from "lucide-react";
import AccountSettings from "@/components/dashboard/AccountSettings";

async function uploadPhoto(userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("logos").getPublicUrl(path);
  return data.publicUrl;
}

export default function TeamSettingsPage() {
  const { teamProfile, founderProfile, user, refreshProfile } = useXeero();
  const [name, setName] = useState(teamProfile?.name || "");
  const [bio, setBio] = useState(teamProfile?.bio || "");
  const [linkedin, setLinkedin] = useState(teamProfile?.linkedin_url || "");
  const [twitter, setTwitter] = useState(teamProfile?.twitter_url || "");
  const [photoUrl, setPhotoUrl] = useState(teamProfile?.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const url = await uploadPhoto(user.id, file);
    if (url) setPhotoUrl(url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!teamProfile) return;
    setSaving(true);
    await supabase
      .from("team_profiles")
      .update({
        name,
        bio: bio || null,
        linkedin_url: linkedin || null,
        twitter_url: twitter || null,
        photo_url: photoUrl || null,
      })
      .eq("id", teamProfile.id);
    await refreshProfile();
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!teamProfile) return null;

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Settings size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Settings</h1>
          <p style={styles.headerSub}>Manage your account and profile</p>
        </div>
      </div>

      <AccountSettings />

      <p style={styles.sectionLabel}>My Profile</p>
      <div style={styles.card}>
        <div style={styles.roleRow}>
          <div style={styles.settingIcon}>
            <User size={15} color="#111111" />
          </div>
          <div>
            <p style={styles.settingTitle}>{teamProfile.role} at {founderProfile?.startup_name}</p>
            <p style={styles.settingValue}>Your role is set by the founder and can't be changed here.</p>
          </div>
        </div>

        <div style={styles.formBody}>

          <div style={styles.photoRow}>
            <div style={styles.photoCircle}>
              {photoUrl ? (
                <img src={photoUrl} alt="photo" style={styles.photoImg} />
              ) : (
                <span style={styles.photoInitial}>{name?.[0]?.toUpperCase() || "T"}</span>
              )}
            </div>
            <div>
              <button style={styles.uploadBtn} onClick={() => photoRef.current?.click()} disabled={uploading}>
                <Upload size={13} />{uploading ? "Uploading..." : "Upload Photo"}
              </button>
              <p style={styles.hint}>PNG or JPG, max 2MB</p>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            </div>
          </div>

          <label style={styles.label}>Full name</label>
          <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />

          <label style={styles.label}>Bio</label>
          <textarea style={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about yourself" />

          <label style={styles.label}>LinkedIn</label>
          <input style={styles.input} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />

          <label style={styles.label}>Twitter / X</label>
          <input style={styles.input} value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." />

          <button
            style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? <><CheckCircle size={13} />Saved</> : <><Save size={13} />{saving ? "Saving..." : "Save Changes"}</>}
          </button>
        </div>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "600px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "18px", marginBottom: "20px" },
  roleRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "18px", borderBottom: "1px solid #f5f5f5" },
  settingIcon: { width: "34px", height: "34px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  settingTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  settingValue: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.5" },
  formBody: { display: "flex", flexDirection: "column", gap: "4px" },
  photoRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" },
  photoCircle: { width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoInitial: { fontSize: "18px", fontWeight: "700", color: "#666666" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", marginBottom: "4px" },
  hint: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginTop: "8px", marginBottom: "4px" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "80px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111" },
  saveBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "12px" },
};