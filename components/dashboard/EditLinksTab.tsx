"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  FaInstagram, FaXTwitter, FaLinkedin, FaFacebook, FaYoutube,
  FaEnvelope, FaApple, FaGooglePlay,
  FaCalendarDays, FaRocket, FaNewspaper, FaLink,
} from "react-icons/fa6";
import { Plus, Trash2 } from "lucide-react";

type CustomLink = { id: string; label: string; url: string };

const ICON_ONLY_FIELDS = [
  { key: "instagram", icon: <FaInstagram size={14} />, label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "x", icon: <FaXTwitter size={14} />, label: "X (Twitter)", placeholder: "https://x.com/..." },
  { key: "linkedin", icon: <FaLinkedin size={14} />, label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
  { key: "facebook", icon: <FaFacebook size={14} />, label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "youtube", icon: <FaYoutube size={14} />, label: "YouTube", placeholder: "https://youtube.com/@..." },
  { key: "email", icon: <FaEnvelope size={14} />, label: "Contact email", placeholder: "hello@yourstartup.com" },
  { key: "appstore", icon: <FaApple size={14} />, label: "App Store", placeholder: "https://apps.apple.com/..." },
  { key: "playstore", icon: <FaGooglePlay size={14} />, label: "Play Store", placeholder: "https://play.google.com/..." },
];

const TEXT_FIELDS = [
  { key: "calendly", icon: <FaCalendarDays size={14} />, label: "Book a call", defaultText: "Book a call" },
  { key: "producthunt", icon: <FaRocket size={14} />, label: "Product Hunt", defaultText: "See us on Product Hunt" },
  { key: "newsletter", icon: <FaNewspaper size={14} />, label: "Newsletter", defaultText: "Read our newsletter" },
  { key: "press", icon: <FaNewspaper size={14} />, label: "Press / As seen in", defaultText: "As seen in the press" },
];

export default function EditLinksTab({
  data,
  update,
}: {
  data: any;
  update: (field: string, value: any) => void;
}) {
  const { profile } = useXeero();
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("profile_custom_links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("display_order", { ascending: true })
      .then(({ data }) => setCustomLinks(data || []));
  }, [profile]);

  const handleAddCustomLink = async () => {
    if (!newLabel || !newUrl || !profile) return;
    setAdding(true);
    const { data: inserted } = await supabase
      .from("profile_custom_links")
      .insert({
        profile_id: profile.id,
        label: newLabel,
        url: newUrl,
        display_order: customLinks.length,
      })
      .select()
      .single();

    if (inserted) {
      setCustomLinks((prev) => [...prev, inserted]);
      setNewLabel("");
      setNewUrl("");
    }
    setAdding(false);
  };

  const handleRemoveCustomLink = async (id: string) => {
    await supabase.from("profile_custom_links").delete().eq("id", id);
    setCustomLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div style={styles.sections}>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Social & Contact</h2>
        <p style={styles.cardSubtitle}>These show as icons only, at the top of your Links section.</p>

        {ICON_ONLY_FIELDS.map((field) => (
          <div key={field.key} style={styles.fieldRow}>
            <div style={styles.fieldIcon}>{field.icon}</div>
            <div style={styles.fieldBody}>
              <label style={styles.label}>{field.label}</label>
              <input
                style={styles.input}
                placeholder={field.placeholder}
                value={data[`link_${field.key}`] || ""}
                onChange={(e) => update(`link_${field.key}`, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Featured Links</h2>
        <p style={styles.cardSubtitle}>These show as text capsules people can read before clicking.</p>

        {TEXT_FIELDS.map((field) => (
          <div key={field.key} style={styles.fieldGroup}>
            <div style={styles.fieldGroupHeader}>
              <span style={styles.fieldIcon}>{field.icon}</span>
              <span style={styles.fieldGroupLabel}>{field.label}</span>
            </div>
            <label style={styles.label}>Link</label>
            <input
              style={styles.input}
              placeholder="https://..."
              value={data[`link_${field.key}`] || ""}
              onChange={(e) => update(`link_${field.key}`, e.target.value)}
            />
            <label style={{ ...styles.label, marginTop: "10px" }}>Button text</label>
            <input
              style={styles.input}
              placeholder={field.defaultText}
              value={data[`link_${field.key}_text`] || ""}
              onChange={(e) => update(`link_${field.key}_text`, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Custom Links</h2>
        <p style={styles.cardSubtitle}>Add as many additional links as you want — course sign-ups, waitlists, anything.</p>

        {customLinks.length > 0 && (
          <div style={styles.customList}>
            {customLinks.map((link) => (
              <div key={link.id} style={styles.customRow}>
                <div style={styles.customIcon}><FaLink size={13} /></div>
                <div style={styles.customBody}>
                  <p style={styles.customLabel}>{link.label}</p>
                  <p style={styles.customUrl}>{link.url}</p>
                </div>
                <button style={styles.removeBtn} onClick={() => handleRemoveCustomLink(link.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.addRow}>
          <input
            style={{ ...styles.input, marginBottom: "8px" }}
            placeholder="Link text, e.g. Sign up for our masterclass"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <input
            style={{ ...styles.input, marginBottom: "8px" }}
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            style={{ ...styles.addBtn, opacity: newLabel && newUrl && !adding ? 1 : 0.5 }}
            onClick={handleAddCustomLink}
            disabled={!newLabel || !newUrl || adding}
          >
            <Plus size={13} />
            {adding ? "Adding..." : "Add Link"}
          </button>
        </div>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sections: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  cardSubtitle: { fontSize: "12px", color: "#aaaaaa", margin: "0 0 20px 0", lineHeight: "1.6" },
  fieldRow: { display: "flex", gap: "12px", marginBottom: "16px" },
  fieldIcon: { width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "20px", color: "#111111" },
  fieldBody: { flex: 1 },
  label: { fontSize: "12px", fontWeight: "500", color: "#888888", display: "block", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111" },
  fieldGroup: { paddingBottom: "18px", marginBottom: "18px", borderBottom: "1px solid #f5f5f5" },
  fieldGroupHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  fieldGroupLabel: { fontSize: "13px", fontWeight: "600", color: "#111111" },
  customList: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" },
  customRow: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", backgroundColor: "#f9f9f9", borderRadius: "10px", border: "1px solid #f0f0f0" },
  customIcon: { width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#111111" },
  customBody: { flex: 1, minWidth: 0 },
  customLabel: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  customUrl: { fontSize: "11px", color: "#aaaaaa", margin: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  removeBtn: { width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e", flexShrink: 0 },
  addRow: { paddingTop: "4px" },
  addBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "11px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};