"use client";

import { useRef } from "react";
import { Mail, X, Send, CheckCircle, ImagePlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function WaitlistComposer({
  waitlistCount,
  startupName,
  subject, setSubject,
  header, setHeader,
  body, setBody,
  ctaLabel, setCtaLabel,
  ctaUrl, setCtaUrl,
  replyTo, setReplyTo,
  imageUrl, setImageUrl,
  imageUploading, setImageUploading,
  sending,
  sendError,
  sendResult,
  showPreview, setShowPreview,
  onClose,
  onSend,
  onReset,
}: any) {
  const imageRef = useRef<HTMLInputElement>(null);
  const canSend = subject && header && body;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `waitlist-emails/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("email-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!uploadError) {
        const { data } = supabase.storage.from("email-assets").getPublicUrl(path);
        setImageUrl(data.publicUrl);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
    setImageUploading(false);
  };

  return (
    <div style={styles.composerCard}>
      <div style={styles.composerHeader}>
        <div style={styles.composerHeaderLeft}>
          <Mail size={16} color="#111111" />
          <p style={styles.composerTitle}>Email your waitlist</p>
          <span style={styles.composerCount}>{waitlistCount} recipients</span>
        </div>
        <button style={styles.composerCloseBtn} onClick={onClose}>
          <X size={16} color="#888888" />
        </button>
      </div>

      {sendResult ? (
        <div style={styles.successState}>
          <div style={styles.successIcon}><CheckCircle size={28} color="#38a169" /></div>
          <h3 style={styles.successTitle}>Email sent!</h3>
          <p style={styles.successText}>
            Delivered to <strong>{sendResult.sent}</strong> subscribers across <strong>{sendResult.batches}</strong> batch{sendResult.batches !== 1 ? "es" : ""}.
          </p>
          {sendResult.failed > 0 && <p style={styles.failedText}>{sendResult.failed} failed.</p>}
          <button style={styles.sendAnotherBtn} onClick={onReset}>Send Another</button>
        </div>
      ) : (
        <div style={styles.composerBody}>
          <div style={styles.composerLeft}>
            {imageUrl ? (
              <div style={styles.imagePreviewWrapper}>
                <img src={imageUrl} alt="" style={styles.imagePreview} />
                <button style={styles.imageRemoveBtn} onClick={() => setImageUrl("")}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button style={styles.imageUploadBtn} onClick={() => imageRef.current?.click()} disabled={imageUploading}>
                <ImagePlus size={14} color="#888888" />
                <span>{imageUploading ? "Uploading..." : "Add header image (optional)"}</span>
              </button>
            )}
            <input ref={imageRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style={{ display: "none" }} onChange={handleImageUpload} />

            <label style={styles.fieldLabel}>Subject line</label>
            <input style={styles.input} placeholder="e.g. We just hit a big milestone" value={subject} onChange={(e) => setSubject(e.target.value)} />

            <label style={styles.fieldLabel}>Header</label>
            <input style={styles.input} placeholder="e.g. Something exciting is happening." value={header} onChange={(e) => setHeader(e.target.value)} />

            <label style={styles.fieldLabel}>Body</label>
            <textarea style={styles.textarea} placeholder="Write your message to your waitlist..." value={body} onChange={(e) => setBody(e.target.value)} />

            <label style={styles.fieldLabel}>Reply-to email (optional)</label>
            <input style={styles.input} placeholder="e.g. hello@yourstartup.com" type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />

            <label style={styles.fieldLabel}>CTA Button (optional)</label>
            <div style={styles.twoCol}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="Button label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
              <input style={{ ...styles.input, flex: 2 }} placeholder="https://..." value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
            </div>

            {sendError && <p style={styles.errorText}>{sendError}</p>}

            <div style={styles.composerActions}>
              <button style={styles.previewToggleBtn} onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
              <button
                style={{ ...styles.sendBtn, opacity: canSend && !sending ? 1 : 0.5, pointerEvents: sending ? "none" : "auto" }}
                onClick={onSend}
                disabled={!canSend || sending}
              >
                <Send size={13} />
                {sending ? "Sending..." : `Send to ${waitlistCount} people`}
              </button>
            </div>

            {sending && (
              <div style={styles.sendingNote}>
                <div style={styles.sendingDot} />
                <p style={styles.sendingText}>Sending in batches. May take a moment.</p>
              </div>
            )}
          </div>

          {showPreview && (
            <div style={styles.composerRight}>
              <p style={styles.previewLabel}>Preview</p>
              <div style={styles.previewCard}>
                <div style={styles.previewMeta}>
                  <p style={styles.previewMetaRow}><strong>From:</strong> {startupName} via Xeero &lt;waitlist@xeero.me&gt;</p>
                  <p style={styles.previewMetaRow}><strong>Subject:</strong> {subject || "—"}</p>
                  {replyTo && <p style={styles.previewMetaRow}><strong>Reply-to:</strong> {replyTo}</p>}
                </div>
                {imageUrl ? (
                  <div style={styles.previewImageWrapper}>
                    <img src={imageUrl} alt="" style={styles.previewImage} />
                  </div>
                ) : (
                  <div style={styles.previewGradientBar} />
                )}
                <div style={styles.previewBody}>
                  <p style={styles.previewFrom}>From {startupName}</p>
                  {header && <h3 style={styles.previewHeader}>{header}</h3>}
                  {body && <p style={styles.previewBodyText}>{body}</p>}
                  {ctaLabel && ctaUrl && <span style={styles.previewCtaBtn}>{ctaLabel} →</span>}
                  <div style={styles.previewFooter}>
                    <p style={styles.previewFooterText}>
                      You're receiving this because you signed up to the {startupName} waitlist on Xeero.
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
  composerCard: { backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "20px", overflow: "hidden" },
  composerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0f0f0" },
  composerHeaderLeft: { display: "flex", alignItems: "center", gap: "10px" },
  composerTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0" },
  composerCount: { fontSize: "11px", fontWeight: "600", color: "#888888", backgroundColor: "#f5f5f5", padding: "2px 8px", borderRadius: "99px" },
  composerCloseBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" },
  composerBody: { display: "flex", gap: "24px", padding: "20px", alignItems: "flex-start" },
  composerLeft: { flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
  composerRight: { width: "300px", flexShrink: 0 },
  fieldLabel: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "120px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.7", color: "#111111" },
  twoCol: { display: "flex", gap: "8px" },
  imageUploadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", fontSize: "13px", color: "#888888", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "10px", cursor: "pointer", width: "100%", justifyContent: "center" },
  imagePreviewWrapper: { position: "relative", borderRadius: "10px", overflow: "hidden" },
  imagePreview: { width: "100%", display: "block", maxHeight: "160px", objectFit: "cover" },
  imageRemoveBtn: { position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" },
  errorText: { fontSize: "13px", color: "#e53e3e", margin: "0" },
  composerActions: { display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end" },
  previewToggleBtn: { padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  sendBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  sendingNote: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fef08a" },
  sendingDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#d69e2e", flexShrink: 0 },
  sendingText: { fontSize: "12px", color: "#d69e2e", margin: "0" },
  successState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 32px", textAlign: "center", gap: "10px" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0" },
  successText: { fontSize: "14px", color: "#666666", margin: "0", lineHeight: "1.6" },
  failedText: { fontSize: "12px", color: "#e53e3e", margin: "0" },
  sendAnotherBtn: { padding: "9px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "8px" },
  previewLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" },
  previewCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  previewMeta: { padding: "10px 14px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "3px" },
  previewMetaRow: { fontSize: "11px", color: "#888888", margin: "0" },
  previewImageWrapper: { width: "100%", maxHeight: "160px", overflow: "hidden" },
  previewImage: { width: "100%", display: "block", objectFit: "cover", maxHeight: "160px" },
  previewGradientBar: { width: "100%", height: "6px", background: "linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%)" },
  previewBody: { padding: "20px 16px" },
  previewFrom: { fontSize: "11px", color: "#aaaaaa", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600" },
  previewHeader: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0 0 10px 0", lineHeight: "1.3" },
  previewBodyText: { fontSize: "12px", color: "#555555", lineHeight: "1.8", margin: "0 0 16px 0", whiteSpace: "pre-wrap" },
  previewCtaBtn: { display: "inline-block", padding: "8px 16px", backgroundColor: "#111111", color: "#ffffff", fontSize: "12px", fontWeight: "600", borderRadius: "6px", marginBottom: "16px" },
  previewFooter: { paddingTop: "14px", borderTop: "1px solid #f0f0f0" },
  previewFooterText: { fontSize: "10px", color: "#cccccc", margin: "0", lineHeight: "1.6" },
};