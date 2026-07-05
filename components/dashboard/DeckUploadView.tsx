"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { FileText, Upload } from "lucide-react";
import DeckPreview from "@/components/dashboard/DeckPreview";

async function uploadDeckFile(userId: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("decks").upload(path, file, { upsert: true });
  if (error) return null;
  return path;
}

export default function DeckUploadView() {
  const { founderProfile, profileLoading, refreshProfile } = useXeero();
  const [deckUrl, setDeckUrl] = useState(founderProfile?.deck_url || "");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const deckRef = useRef<HTMLInputElement>(null);

  const handleDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !founderProfile) return;
    setUploading(true);
    setSaved(false);

    const path = await uploadDeckFile(founderProfile.user_id, file);
    if (path) {
      await supabase
        .from("profiles")
        .update({ deck_url: path })
        .eq("id", founderProfile.id);
      setDeckUrl(path);
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 3000);
    }
    setUploading(false);
  };

  if (profileLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <FileText size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Pitch Deck</h1>
          <p style={styles.headerSub}>Upload or replace the pitch deck for {founderProfile?.startup_name}</p>
        </div>
      </div>

      <div style={styles.card}>
        {deckUrl ? (
          <div style={styles.deckUploadedRow}>
            <span style={styles.deckUploadedText}>✓ Deck uploaded</span>
            <button style={styles.uploadBtn} onClick={() => deckRef.current?.click()} disabled={uploading}>
              <Upload size={13} />{uploading ? "Uploading..." : "Replace"}
            </button>
          </div>
        ) : (
          <button style={styles.uploadBtn} onClick={() => deckRef.current?.click()} disabled={uploading}>
            <Upload size={13} />{uploading ? "Uploading..." : "Upload PDF"}
          </button>
        )}
        {saved && <p style={styles.savedText}>✓ Saved</p>}
        <input ref={deckRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleDeckUpload} />
        {deckUrl && <DeckPreview deckUrl={deckUrl} />}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "600px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  deckUploadedRow: { display: "flex", alignItems: "center", gap: "10px" },
  deckUploadedText: { fontSize: "13px", color: "#38a169", fontWeight: "500" },
  savedText: { fontSize: "12px", color: "#38a169", margin: "8px 0 0 0" },
};