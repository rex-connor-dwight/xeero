"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { ALL_TABS, type Tab } from "@/lib/data/slugPage";
import { Eye, EyeOff } from "lucide-react";

export default function VisibilityToggles() {
  const { profile, updateProfileCache } = useXeero();
  const [saving, setSaving] = useState<Tab | null>(null);

  if (!profile) return null;

  const visible: Tab[] = profile.visible_tabs?.length
    ? profile.visible_tabs
    : ["overview", "team", "deck", "links", "dataroom"];

  const handleToggle = async (key: Tab) => {
    const isOn = visible.includes(key);
    if (isOn && visible.length === 1) return; // can't hide the last one

    const updated = isOn ? visible.filter((k) => k !== key) : [...visible, key];
    setSaving(key);

    const { error } = await supabase
      .from("profiles")
      .update({ visible_tabs: updated })
      .eq("id", profile.id);

    if (!error) updateProfileCache({ visible_tabs: updated } as any);
    setSaving(null);
  };

  return (
    <>
      <p style={styles.sectionLabel}>Profile Sections</p>
      <div style={styles.card}>
        <p style={styles.intro}>
          Choose which tabs visitors see on your public link. Turn off anything you're not ready to share.
        </p>
        {ALL_TABS.map((tab, i) => {
          const isOn = visible.includes(tab.key);
          const isLastOn = isOn && visible.length === 1;
          return (
            <div key={tab.key} style={{ ...styles.row, borderTop: i > 0 ? "1px solid #f5f5f5" : "none" }}>
              <div style={styles.rowLeft}>
                <div style={styles.rowIcon}>
                  {isOn ? <Eye size={14} color="#111111" /> : <EyeOff size={14} color="#bbbbbb" />}
                </div>
                <div>
                  <p style={styles.rowTitle}>{tab.label}</p>
                  <p style={styles.rowDesc}>{tab.description}</p>
                </div>
              </div>
              <button
                style={{
                  ...styles.toggle,
                  backgroundColor: isOn ? "#111111" : "#e5e5e5",
                  opacity: saving === tab.key ? 0.5 : isLastOn ? 0.4 : 1,
                  cursor: isLastOn ? "not-allowed" : "pointer",
                }}
                onClick={() => !isLastOn && handleToggle(tab.key)}
                disabled={saving === tab.key || isLastOn}
              >
                <div style={{ ...styles.toggleDot, transform: isOn ? "translateX(16px)" : "translateX(2px)" }} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "18px", marginBottom: "20px" },
  intro: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "0 0 16px 0" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", gap: "12px" },
  rowLeft: { display: "flex", alignItems: "center", gap: "12px" },
  rowIcon: { width: "30px", height: "30px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  rowDesc: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  toggle: { width: "38px", height: "22px", borderRadius: "99px", border: "none", position: "relative", flexShrink: 0, transition: "background-color 0.2s ease" },
  toggleDot: { width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#ffffff", position: "absolute", top: "2px", transition: "transform 0.2s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" },
};