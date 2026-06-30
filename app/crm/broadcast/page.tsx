"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Send,
  Users,
  User,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Segment = "all" | "live" | "draft" | "single";

const SEGMENTS = [
  { key: "all" as Segment, label: "All Founders", sub: "Everyone with an account on Xeero", icon: <Users size={16} /> },
  { key: "live" as Segment, label: "Live Profiles", sub: "Founders who have published their profile", icon: <CheckCircle size={16} /> },
  { key: "draft" as Segment, label: "Draft Profiles", sub: "Founders who haven't gone live yet", icon: <RefreshCw size={16} /> },
  { key: "single" as Segment, label: "Single Recipient", sub: "Send to one specific email address", icon: <User size={16} /> },
];

export default function BroadcastPage() {
  const { user, loading } = useXeero();
  const [segment, setSegment] = useState<Segment>("all");
  const [singleEmail, setSingleEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const canSend = subject && header && body && (segment !== "single" || singleEmail);

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
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setSending(false);
  };

  if (loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Broadcast</h1>
          <p style={styles.sub}>Send emails to founders on Xeero.</p>
        </div>
      </div>

      {result ? (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <CheckCircle size={28} color="#38a169" />
          </div>
          <h2 style={styles.successTitle}>Broadcast sent</h2>
          <p style={styles.successText}>
            Your email was delivered to {result.sent} recipient{result.sent !== 1 ? "s" : ""} across {result.batches} batch{result.batches !== 1 ? "es" : ""}.
          </p>
          {result.failed > 0 && (
            <p style={styles.failedText}>{result.failed} failed to send.</p>
          )}
          <button
            style={styles.resetBtn}
            onClick={() => {
              setResult(null);
              setSubject("");
              setHeader("");
              setBody("");
              setCtaLabel("");
              setCtaUrl("");
              setSingleEmail("");
              setSegment("all");
            }}
          >
            Send Another
          </button>
        </div>
      ) : (
        <div style={styles.layout}>

          {/* ── Left: Compose ── */}
          <div style={styles.compose}>

            {/* Segment */}
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
                      ...styles.segmentIcon,
                      color: segment === s.key ? "#111111" : "#aaaaaa",
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
                <input
                  style={styles.input}
                  placeholder="recipient@email.com"
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                />
              )}
            </div>

            {/* Compose */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Compose</p>

              <label style={styles.label}>Subject line</label>
              <input
                style={styles.input}
                placeholder="e.g. A new feature just dropped"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <label style={styles.label}>Email header</label>
              <input
                style={styles.input}
                placeholder="e.g. Something big just landed on Xeero."
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
                style={styles.previewBtn}
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
                  Sending in batches of 50 with 500ms delays. This may take a moment for large audiences.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Preview ── */}
          {showPreview && (
            <div style={styles.preview}>
              <p style={styles.previewLabel}>Email Preview</p>
              <div style={styles.previewCard}>
                <div style={styles.previewMeta}>
                  <p style={styles.previewMetaRow}><strong>From:</strong> Connor at Xeero &lt;connor@xeero.me&gt;</p>
                  <p style={styles.previewMetaRow}><strong>Subject:</strong> {subject || "—"}</p>
                </div>
                <div style={styles.previewBody}>
                  <div style={styles.previewBrand}>
                    <div style={styles.previewBrandDot} />
                    <span style={styles.previewBrandText}>Xeero</span>
                  </div>
                  {header && <h2 style={styles.previewHeader}>{header}</h2>}
                  {body && <p style={styles.previewBodyText}>{body}</p>}
                  {ctaLabel && ctaUrl && (
                    <div style={styles.previewCta}>
                      <span style={styles.previewCtaBtn}>{ctaLabel}</span>
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
  page: { padding: "32px", maxWidth: "1100px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { marginBottom: "28px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" },
  compose: { flex: 1, minWidth: "320px", display: "flex", flexDirection: "column", gap: "16px" },
  section: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0" },
  segmentGrid: { display: "flex", flexDirection: "column", gap: "6px" },
  segmentCard: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "10px", cursor: "pointer", textAlign: "left" },
  segmentCardActive: { backgroundColor: "#f5f5f5", border: "1px solid #111111" },
  segmentIcon: { flexShrink: 0, marginTop: "2px" },
  segmentLabel: { fontSize: "13px", margin: "0 0 1px 0" },
  segmentSub: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", marginBottom: "4px", display: "block" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "140px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.7", color: "#111111" },
  twoCol: { display: "flex", gap: "12px" },
  sendRow: { display: "flex", gap: "10px", alignItems: "center", justifyContent: "flex-end" },
  previewBtn: { padding: "9px 16px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  sendBtn: { display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  errorText: { fontSize: "13px", color: "#e53e3e", margin: "0" },
  sendingNote: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fef08a" },
  sendingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d69e2e", flexShrink: 0, marginTop: "4px" },
  sendingText: { fontSize: "12px", color: "#d69e2e", margin: "0", lineHeight: "1.6" },
  preview: { width: "360px", flexShrink: 0 },
  previewLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px 0" },
  previewCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  previewMeta: { padding: "12px 16px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "4px" },
  previewMetaRow: { fontSize: "11px", color: "#888888", margin: "0" },
  previewBody: { padding: "24px 20px" },
  previewBrand: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" },
  previewBrandDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#111111" },
  previewBrandText: { fontSize: "13px", fontWeight: "700", color: "#111111" },
  previewHeader: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 12px 0", lineHeight: "1.3" },
  previewBodyText: { fontSize: "13px", color: "#555555", lineHeight: "1.8", margin: "0 0 20px 0", whiteSpace: "pre-wrap" },
  previewCta: { marginBottom: "24px" },
  previewCtaBtn: { display: "inline-block", padding: "10px 20px", backgroundColor: "#111111", color: "#ffffff", fontSize: "13px", fontWeight: "600", borderRadius: "8px" },
  previewFooter: { paddingTop: "16px", borderTop: "1px solid #f0f0f0" },
  previewFooterText: { fontSize: "11px", color: "#cccccc", margin: "0" },
  successCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "56px 32px", textAlign: "center", border: "1px solid #f0f0f0", maxWidth: "480px" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  successTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  successText: { fontSize: "14px", color: "#666666", lineHeight: "1.6", margin: "0 0 8px 0" },
  failedText: { fontSize: "13px", color: "#e53e3e", margin: "0 0 24px 0" },
  resetBtn: { padding: "10px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};