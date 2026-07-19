"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FaInstagram, FaXTwitter, FaLinkedin, FaFacebook, FaYoutube,
  FaEnvelope, FaApple, FaGooglePlay,
  FaCalendarDays, FaRocket, FaNewspaper, FaLink,
} from "react-icons/fa6";
import type { Profile } from "@/lib/data/slugPage";

type CustomLink = { id: string; label: string; url: string };

const ICON_ONLY: { key: string; icon: React.ReactNode; getHref: (v: string) => string }[] = [
  { key: "instagram", icon: <FaInstagram size={18} />, getHref: (v) => v },
  { key: "x", icon: <FaXTwitter size={18} />, getHref: (v) => v },
  { key: "linkedin", icon: <FaLinkedin size={18} />, getHref: (v) => v },
  { key: "facebook", icon: <FaFacebook size={18} />, getHref: (v) => v },
  { key: "youtube", icon: <FaYoutube size={18} />, getHref: (v) => v },
  { key: "email", icon: <FaEnvelope size={18} />, getHref: (v) => `mailto:${v}` },
  { key: "appstore", icon: <FaApple size={18} />, getHref: (v) => v },
  { key: "playstore", icon: <FaGooglePlay size={18} />, getHref: (v) => v },
];

const TEXT_CAPSULES: { key: string; icon: React.ReactNode; defaultLabel: string }[] = [
  { key: "calendly", icon: <FaCalendarDays size={14} />, defaultLabel: "Book a call" },
  { key: "producthunt", icon: <FaRocket size={14} />, defaultLabel: "See us on Product Hunt" },
  { key: "newsletter", icon: <FaNewspaper size={14} />, defaultLabel: "Read our newsletter" },
  { key: "press", icon: <FaNewspaper size={14} />, defaultLabel: "As seen in the press" },
];

export default function LinksTab({ profile }: { profile: Profile }) {
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  useEffect(() => {
    supabase
      .from("profile_custom_links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("display_order", { ascending: true })
      .then(({ data }) => setCustomLinks(data || []));
  }, [profile.id]);

  const iconRow = ICON_ONLY.map((item) => ({
    ...item,
    url: (profile as any)[`link_${item.key}`],
  })).filter((item) => item.url);

  const textCapsules = TEXT_CAPSULES.map((item) => {
    const url = (profile as any)[`link_${item.key}`];
    const text = (profile as any)[`link_${item.key}_text`];
    return { ...item, url, label: text || item.defaultLabel };
  }).filter((item) => item.url);

  const hasAnything = iconRow.length > 0 || textCapsules.length > 0 || customLinks.length > 0;
  if (!hasAnything) return null;

  return (
    <div style={styles.card}>

      {iconRow.length > 0 && (
        <div style={styles.iconRow}>
          {iconRow.map((item) => (
            
            <a  key={item.key}
              href={item.getHref(item.url)}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.iconBtn}
            >
              {item.icon}
            </a>
          ))}
        </div>
      )}

      {(textCapsules.length > 0 || customLinks.length > 0) && (
        <div style={styles.capsuleList}>
          {textCapsules.map((item) => (
            
            <a  key={item.key}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.capsule}
            >
              <span style={styles.capsuleIcon}>{item.icon}</span>
              <span style={styles.capsuleLabel}>{item.label}</span>
            </a>
          ))}

          {customLinks.map((link) => (
            
            <a  key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.capsule}
            >
              <span style={styles.capsuleIcon}><FaLink size={14} /></span>
              <span style={styles.capsuleLabel}>{link.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "30px 20px" },
  iconRow: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginBottom: "18px" },
  iconBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", color: "#111111", textDecoration: "none", flexShrink: 0 },
  capsuleList: { display: "flex", flexDirection: "column", gap: "14px", paddingTop: "24px " },
  capsule: { display: "flex", alignItems: "center", gap: "10px", padding: "13px 18px", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "12px", textDecoration: "none", width: "100%", boxSizing: "border-box" },
  capsuleIcon: { display: "flex", alignItems: "center", color: "#111111", flexShrink: 0 },
  capsuleLabel: { fontSize: "13px", fontWeight: "500", color: "#111111" },
};