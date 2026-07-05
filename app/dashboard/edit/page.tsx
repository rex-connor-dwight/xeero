"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Save, Eye } from "lucide-react";
import EditStartupTab from "@/components/dashboard/EditStartupTab";
import EditFounderTab from "@/components/dashboard/EditFounderTab";

type EditTab = "startup" | "founder";

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

async function uploadFile(bucket: string, userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return null;
  if (bucket === "logos") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  return path;
}

async function saveProfileToDb(data: any, userId: string) {
  const { error } = await supabase.from("profiles").update({ ...data }).eq("user_id", userId);
  return error;
}

export default function EditPage() {
  const router = useRouter();
  const { user, profile: contextProfile, profileLoading, updateProfileCache } = useXeero();
  const [activeTab, setActiveTab] = useState<EditTab>("startup");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [data, setData] = useState<any>({
    startup_name: "", tagline: "", problem: "", solution: "", stage: "", industry: "",
    business_model: "", traction: "", location: "", website: "", year_founded: "",
    team_size: "", funding_goal: "", funding_stage: "", logo_url: "", deck_url: "",
    founder_name: "", founder_role: "", founder_bio: "", founder_linkedin: "",
    founder_twitter: "", founder_photo_url: "", founder_achievements: "",
    founder_previous_startups: "", founder_skills: "", founder_experience: [], founder_education: [],
  });

  useEffect(() => {
    if (!contextProfile) return;
    setData({
      startup_name: contextProfile.startup_name || "",
      tagline: contextProfile.tagline || "",
      problem: contextProfile.problem || "",
      solution: contextProfile.solution || "",
      stage: contextProfile.stage ? contextProfile.stage.charAt(0).toUpperCase() + contextProfile.stage.slice(1) : "",
      industry: contextProfile.industry
        ? contextProfile.industry === "saas" ? "SaaS"
        : contextProfile.industry === "ai" ? "AI"
        : contextProfile.industry === "ecommerce" ? "E-commerce"
        : contextProfile.industry.charAt(0).toUpperCase() + contextProfile.industry.slice(1)
        : "",
      business_model: contextProfile.business_model || "",
      traction: contextProfile.traction || "",
      location: contextProfile.location || "",
      website: contextProfile.website || "",
      year_founded: contextProfile.year_founded || "",
      team_size: contextProfile.team_size || "",
      funding_goal: contextProfile.funding_goal || "",
      funding_stage: contextProfile.funding_stage || "",
      logo_url: contextProfile.logo_url || "",
      deck_url: contextProfile.deck_url || "",
      founder_name: contextProfile.founder_name || "",
      founder_role: contextProfile.founder_role || "",
      founder_bio: contextProfile.founder_bio || "",
      founder_linkedin: contextProfile.founder_linkedin || "",
      founder_twitter: contextProfile.founder_twitter || "",
      founder_photo_url: contextProfile.founder_photo_url || "",
      founder_achievements: contextProfile.founder_achievements || "",
      founder_previous_startups: contextProfile.founder_previous_startups || "",
      founder_skills: contextProfile.founder_skills || "",
      founder_experience: contextProfile.founder_experience || [],
      founder_education: contextProfile.founder_education || [],
    });
  }, [contextProfile]);

  const update = useCallback((field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    const error = await saveProfileToDb(data, user.id);
    if (!error) {
      setSaved(true);
      updateProfileCache(data);
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const url = await uploadFile("logos", user.id, file);
    if (url) update("logo_url", url);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const url = await uploadFile("logos", user.id, file);
    if (url) update("founder_photo_url", url);
  };

  const handleDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = await uploadFile("decks", user.id, file);
    if (path) update("deck_url", path);
  };

  const addExperience = () => update("founder_experience", [...data.founder_experience, { id: generateId(), role: "", company: "", year_start: "", year_end: "" }]);
  const updateExperience = (id: string, field: string, value: string) => update("founder_experience", data.founder_experience.map((e: any) => e.id === id ? { ...e, [field]: value } : e));
  const removeExperience = (id: string) => update("founder_experience", data.founder_experience.filter((e: any) => e.id !== id));

  const addEducation = () => update("founder_education", [...data.founder_education, { id: generateId(), degree: "", school: "", year: "" }]);
  const updateEducation = (id: string, field: string, value: string) => update("founder_education", data.founder_education.map((e: any) => e.id === id ? { ...e, [field]: value } : e));
  const removeEducation = (id: string) => update("founder_education", data.founder_education.filter((e: any) => e.id !== id));

  if (profileLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>

      <div style={styles.actionBar}>
        <div style={styles.actionBarLeft}>
          <span style={styles.actionBarTitle}>Edit Profile</span>
          {saved && <span style={styles.savedBadge}>✓ Saved</span>}
        </div>
        <div style={styles.actionBarRight}>
          <button style={styles.previewBtn} onClick={() => router.push("/preview")}>
            <Eye size={13} />Preview
          </button>
          <button style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
            <Save size={13} />{saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div style={styles.tabsBar}>
        {(["startup", "founder"] as EditTab[]).map((tab) => (
          <button key={tab} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
            {tab === "startup" ? "Startup" : "Founder CV"}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "startup" && (
          <EditStartupTab
            data={data}
            update={update}
            onLogoUpload={handleLogoUpload}
            onDeckUpload={handleDeckUpload}
          />
        )}
        {activeTab === "founder" && (
          <EditFounderTab
            data={data}
            update={update}
            onPhotoUpload={handlePhotoUpload}
            addExperience={addExperience}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
            addEducation={addEducation}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
          />
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  actionBar: { backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: "50px", zIndex: 100 },
  actionBarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  actionBarTitle: { fontSize: "14px", fontWeight: "600", color: "#111111" },
  savedBadge: { fontSize: "12px", color: "#38a169", fontWeight: "500", backgroundColor: "#f0fff4", padding: "2px 8px", borderRadius: "99px", border: "1px solid #c6f6d5" },
  actionBarRight: { display: "flex", gap: "8px", alignItems: "center" },
  previewBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  saveBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  tabsBar: { backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0", display: "flex", padding: "0 24px", position: "sticky", top: "98px", zIndex: 90 },
  tab: { padding: "13px 20px", fontSize: "13px", fontWeight: "500", color: "#aaaaaa", backgroundColor: "transparent", border: "none", borderBottom: "2px solid transparent", cursor: "pointer" },
  tabActive: { color: "#111111", borderBottom: "2px solid #111111", fontWeight: "600" },
  content: { maxWidth: "680px", margin: "0 auto", padding: "24px" },
};