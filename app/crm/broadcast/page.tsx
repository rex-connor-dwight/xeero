"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Send,
  Users,
  User,
  CheckCircle,
  RefreshCw,
  FileText,
  FolderOpen,
  ImagePlus,
  X,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Segment = "all" | "live" | "draft" | "no_deck" | "no_dataroom" | "single";

const SEGMENTS = [
  { key: "all" as Segment, label: "All Founders", sub: "Everyone with an account", icon: <Users size={14} /> },
  { key: "live" as Segment, label: "Live Profiles", sub: "Have published their profile", icon: <CheckCircle size={14} /> },
  { key: "draft" as Segment, label: "Draft Profiles", sub: "Haven't gone live yet", icon: <RefreshCw size={14} /> },
  { key: "no_deck" as Segment, label: "No Pitch Deck", sub: "Live but no deck uploaded", icon: <FileText size={14} /> },
  { key: "no_dataroom" as Segment, label: "No Data Room", sub: "No completed documents", icon: <FolderOpen size={14} /> },
  { key: "single" as Segment, label: "Single Recipient", sub: "One specific person", icon: <User size={14} /> },
];

export default function BroadcastPage() {
  const { user, loading } = useXeero();
  const [segment, setSegment] = useState<Segment>("all");
  const [singleEmail, setSingleEmail] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subject, setSubject] = useState("");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const canSend = subject && header && body && (segment !== "single" || singleEmail);

  // ── Debounced autocomplete ──
  useEffect(() => {
    if (segment !== "single" || singleEmail.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/crm-users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
        }
      );
      const data = await res.json();
      const q = singleEmail.toLowerCase();
      const matched = (data.profiles || [])
        .filter((p: any) =>
          p.founder_name?.toLowerCase().includes(q) ||
          p.startup_name?.toLowerCase().includes(q)
        )
        .slice(0, 6);
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    }, 300);
  }, [singleEmail, segment]);

  // ── Close suggestions on outside click ──
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Image upload ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("email-assets")
      .upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("email-assets").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setImageUploading(false);
  };

  // ── Send ──
  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/crm-broadcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            segment,
            single_email: singleEmail || undefined,
            subject,
            header,
            body,
            cta_label: ctaLabel || undefined,
            cta_url: ctaUrl || undefined,
            image_url: imageUrl || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.error) setError(data.error || "Something went wrong.");
      else setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSending(false);
  };

  const handleReset = () => {
    setResult(null);
    setSubject("");
    setHeader("");
    setBody("");
    setCtaLabel("");
    setCtaUrl("");
    setImageUrl("");
    setSingleEmail("");
    setSegment("all");
    setError("");
  };

  if (loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>Broadcast</h1>
          <p style={styles.sub}>Send targeted emails to founders on Xeero.</p>
        </div>
      </div>

      {result ? (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <CheckCircle size={28} color="#38a169" />
          </div>
          <h2 style={styles.successTitle}>Broadcast sent</h2>
          <p style={styles.successText}>
            Delivered to <strong>{result.sent}</strong> recipient{result.sent !== 1 ? "s" : ""} across <strong>{result.batches}</strong> batch{result.batches !== 1 ? "es" : ""}.
          </p>
          {result.failed > 0 && (
            <p style={styles.failedText}>{result.failed} failed to deliver.</p>
          )}
          <button style={styles.resetBtn} onClick={handleReset}>
            Send Another
          </button>
        </div>
      ) : (
        <div style={styles.layout}>

          {/* ── Left: Compose ── */}
          <div style={styles.compose}>

            {/* Recipients */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Recipients</p>
              <div style={styles.segmentGrid}>
                {SEGMENTS.map((s) => (
                  <button
                    key={s.key}
                    style={{
                      ...styles.segmentCard,
                      ...(segment === s.key ? styles.segmentCardActive : {}),
                    }}
                    onClick={() => setSegment(s.key)}
                  >
                    <span style={{
                      color: segment === s.key ? "#111111" : "#aaaaaa",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}>
                      {s.icon}
                    </span>
                    <div>
                      <p style={{
                        ...styles.segmentLabel,
                        color: segment === s.key ? "#111111" : "#555555",
                        fontWeight: segment === s.key ? "600" : "500",
                      }}>
                        {s.label}
                      </p>
                      <p style={styles.segmentSub}>{s.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              {segment === "single" && (
                <div style={{ position: "relative" }} ref={suggestionsRef}>
                  <input
                    style={styles.input}
                    placeholder="Search by founder name or startup..."
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  />
                  {showSuggestions && (
                    <div style={styles.suggestions}>
                      {suggestions.map((s: any, i: number) => (
                        <button
                          key={i}
                          style={styles.suggestionItem}
                          onClick={() => {
                            setSingleEmail(s.founder_name || s.startup_name);
                            setShowSuggestions(false);
                          }}
                        >
                          <div style={styles.suggestionAvatar}>
                            <span style={styles.suggestionAvatarText}>
                              {s.startup_name?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p style={styles.suggestionName}>{s.founder_name}</p>
                            <p style={styles.suggestionSub}>{s.startup_name} · xeero.me/{s.slug}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Header Image */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Header Image (optional)</p>
              {imageUrl ? (
                <div style={styles.imagePreviewWrapper}>
                  <img src={imageUrl} alt="header" style={styles.imagePreview} />
                  <button style={styles.imageRemoveBtn} onClick={() => setImageUrl("")}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  style={styles.imageUploadBtn}
                  onClick={() => imageRef.current?.click()}
                  disabled={imageUploading}
                >
                  <ImagePlus size={14} color="#888888" />
                  <span>{imageUploading ? "Uploading..." : "Upload header image"}</span>
                </button>
              )}
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <p style={styles.imageHint}>Recommended: 1200×400px PNG or JPG. Appears at top of email.</p>
            </div>

            {/* Compose */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Compose</p>

              <label style={styles.label}>Subject line</label>
              <input
                style={styles.input}
                placeholder="e.g. A new feature just dropped on Xeero"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <label style={styles.label}>Header</label>
              <input
                style={styles.input}
                placeholder="e.g. Something big just landed."
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              />

              <label style={styles.label}>Body</label>
              <textarea
                style={styles.textarea}
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* CTA */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Call to Action (optional)</p>
              <div style={styles.twoCol}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Button label</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Check it out"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Button URL</label>
                  <input
                    style={styles.input}
                    placeholder="https://xeero.me/..."
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <p style={styles.errorText}>{error}</p>}

            <div style={styles.sendRow}>
              <button
                style={styles.previewToggleBtn}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                style={{
                  ...styles.sendBtn,
                  opacity: canSend && !sending ? 1 : 0.5,
                }}
                onClick={handleSend}
                disabled={!canSend || sending}
              >
                <Send size={14} />
                {sending ? "Sending..." : "Send Broadcast"}
              </button>
            </div>

            {sending && (
              <div style={styles.sendingNote}>
                <div style={styles.sendingDot} />
                <p style={styles.sendingText}>
                  Sending in batches of 50 with 500ms delays. May take a moment for large audiences.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Preview ── */}
          {showPreview && (
            <div style={styles.preview}>
              <p style={styles.previewLabel}>Email Preview</p>
              <div style={styles.previewCard}>

                {/* Meta bar */}
                <div style={styles.previewMeta}>
                  <p style={styles.previewMetaRow}>
                    <strong>From:</strong> Connor at Xeero &lt;connor@xeero.me&gt;
                  </p>
                  <p style={styles.previewMetaRow}>
                    <strong>Subject:</strong> {subject || "—"}
                  </p>
                </div>

                {/* Image */}
                {imageUrl ? (
                  <div style={styles.previewImageWrapper}>
                    <img src={imageUrl} alt="" style={styles.previewImage} />
                  </div>
                ) : (
                  <div style={styles.previewGradientBar} />
                )}

                {/* Body */}
                <div style={styles.previewBody}>
                  {header && (
                    <h2 style={styles.previewHeader}>{header}</h2>
                  )}
                  {body && (
                    <p style={styles.previewBodyText}>{body}</p>
                  )}
                  {ctaLabel && ctaUrl && (
                    <div style={{ marginBottom: "24px" }}>
                      <span style={styles.previewCtaBtn}>{ctaLabel} →</span>
                    </div>
                  )}
                  <div style={styles.previewFooter}>
                    <p style={styles.previewFooterText}>
                      You're receiving this because you have an account on Xeero. · xeero.me
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "32px", maxWidth: "1200px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  pageHeader: { marginBottom: "28px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  compose: { flex: 1, minWidth: "340px", display: "flex", flexDirection: "column", gap: "14px" },
  section: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0" },
  segmentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
  segmentCard: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "10px", cursor: "pointer", textAlign: "left" },
  segmentCardActive: { backgroundColor: "#f5f5f5", border: "1px solid #111111" },
  segmentLabel: { fontSize: "12px", margin: "0 0 1px 0" },
  segmentSub: { fontSize: "10px", color: "#aaaaaa", margin: "0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", marginBottom: "4px", display: "block" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "140px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.7", color: "#111111" },
  twoCol: { display: "flex", gap: "12px" },
  suggestions: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #f0f0f0", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden" },
  suggestionItem: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 14px", backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid #f9f9f9" },
  suggestionAvatar: { width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  suggestionAvatarText: { fontSize: "12px", fontWeight: "700", color: "#666666" },
  suggestionName: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 1px 0" },
  suggestionSub: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  imageUploadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", fontSize: "13px", color: "#888888", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "10px", cursor: "pointer", width: "100%", justifyContent: "center" },
  imagePreviewWrapper: { position: "relative", borderRadius: "10px", overflow: "hidden" },
  imagePreview: { width: "100%", display: "block", maxHeight: "180px", objectFit: "cover", borderRadius: "10px" },
  imageRemoveBtn: { position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" },
  imageHint: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  sendRow: { display: "flex", gap: "10px", alignItems: "center", justifyContent: "flex-end" },
  previewToggleBtn: { padding: "9px 16px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  sendBtn: { display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  errorText: { fontSize: "13px", color: "#e53e3e", margin: "0" },
  sendingNote: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fef08a" },
  sendingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d69e2e", flexShrink: 0, marginTop: "4px" },
  sendingText: { fontSize: "12px", color: "#d69e2e", margin: "0", lineHeight: "1.6" },
  preview: { width: "380px", flexShrink: 0, position: "sticky", top: "32px" },
  previewLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px 0" },
  previewCard: { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  previewMeta: { padding: "12px 16px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "3px" },
  previewMetaRow: { fontSize: "11px", color: "#888888", margin: "0" },
  previewImageWrapper: { width: "100%", maxHeight: "200px", overflow: "hidden" },
  previewImage: { width: "100%", display: "block", objectFit: "cover", maxHeight: "200px" },
  previewGradientBar: { width: "100%", height: "6px", background: "linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%)" },
  previewBody: { padding: "24px 20px" },
  previewHeader: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 12px 0", lineHeight: "1.3" },
  previewBodyText: { fontSize: "13px", color: "#555555", lineHeight: "1.8", margin: "0 0 20px 0", whiteSpace: "pre-wrap" },
  previewCtaBtn: { display: "inline-block", padding: "10px 20px", backgroundColor: "#111111", color: "#ffffff", fontSize: "13px", fontWeight: "600", borderRadius: "8px" },
  previewFooter: { marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" },
  previewFooterText: { fontSize: "11px", color: "#cccccc", margin: "0" },
  successCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "56px 32px", textAlign: "center", border: "1px solid #f0f0f0", maxWidth: "480px" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  successTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  successText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 8px 0" },
  failedText: { fontSize: "13px", color: "#e53e3e", margin: "0 0 24px 0" },
  resetBtn: { padding: "10px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};