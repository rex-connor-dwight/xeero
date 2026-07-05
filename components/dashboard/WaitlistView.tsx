"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  Users,
  Search,
  Download,
  Mail,
  Clock,
  AlertCircle,
  Send,
  X,
  CheckCircle,
  ImagePlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import UpgradeGateModal from "@/components/dashboard/UpgradeGateModal";

type WaitlistEntry = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

type EmailHistory = {
  id: string;
  subject: string;
  sent_count: number;
  created_at: string;
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function exportCSV(entries: WaitlistEntry[], startupName: string) {
  const header = "Name,Email,Joined\n";
  const rows = entries
    .map((e) => `${e.name || ""},${e.email},${new Date(e.created_at).toLocaleDateString()}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${startupName}-waitlist.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WaitlistView() {
  const router = useRouter();
  const { profile, profileLoading, isTeamMember, founderProfile, isTeamsActive } = useXeero();

  const activeProfile = isTeamMember ? founderProfile : profile;

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [subject, setSubject] = useState("");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [sendError, setSendError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const isSendingRef = useRef(false);

  const canSend = subject && header && body;

  useEffect(() => {
    if (!activeProfile) return;

    supabase
      .from("waitlist")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setWaitlist(data || []);
        setWaitlistLoading(false);
      });

    supabase
      .from("waitlist_emails")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setEmailHistory(data || []));
  }, [activeProfile]);

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

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        setImageUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("email-assets")
        .getPublicUrl(path);

      setImageUrl(data.publicUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
    }

    setImageUploading(false);
  };

  const handleSend = async () => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    if (!canSend || isSendingRef.current || !activeProfile) return;
    isSendingRef.current = true;
    setSending(true);
    setSendError("");
    setSendResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/waitlist-broadcast`,
        { method: "OPTIONS", headers: { "Authorization": `Bearer ${session?.access_token}` } }
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/waitlist-broadcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            profile_id: activeProfile.id,
            subject,
            header,
            body,
            cta_label: ctaLabel || undefined,
            cta_url: ctaUrl || undefined,
            image_url: imageUrl || undefined,
            reply_to: replyTo || undefined,
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok || data.error) setSendError(data.error || "Something went wrong.");
      else {
        setSendResult(data);
        const { data: history } = await supabase
          .from("waitlist_emails")
          .select("*")
          .eq("profile_id", activeProfile.id)
          .order("created_at", { ascending: false });
        setEmailHistory(history || []);
      }
    } catch (err: any) {
      if (err.name === "AbortError") setSendError("Request timed out. Please try again.");
      else setSendError("Something went wrong. Please try again.");
    }
    setSending(false);
    isSendingRef.current = false;
  };

  const handleReset = () => {
    setSendResult(null);
    setSubject("");
    setHeader("");
    setBody("");
    setCtaLabel("");
    setCtaUrl("");
    setReplyTo("");
    setImageUrl("");
    setSendError("");
    setShowPreview(false);
  };

  const filtered = waitlist.filter(
    (e) =>
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.name && e.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (profileLoading || waitlistLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const startupName = activeProfile?.startup_name || "";

  return (
    <div style={styles.page}>
      {showGate && <UpgradeGateModal featureName="Waitlist Emailer" onClose={() => setShowGate(false)} />}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Users size={18} color="#111111" /></div>
          <div>
            <h1 style={styles.headerTitle}>Waitlist</h1>
            <p style={styles.headerSub}>
              {waitlist.length} {waitlist.length === 1 ? "person" : "people"} waiting for {startupName}
            </p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {waitlist.length > 0 && (
            <>
              <button style={styles.exportBtn} onClick={() => exportCSV(waitlist, startupName)}>
                <Download size={13} />Export
              </button>
              <button
                style={styles.emailBtn}
                onClick={() => { setShowComposer(!showComposer); setSendResult(null); }}
              >
                <Mail size={13} />Email Waitlist
              </button>
            </>
          )}
        </div>
      </div>

      {showComposer && (
        <div style={styles.composerCard}>
          <div style={styles.composerHeader}>
            <div style={styles.composerHeaderLeft}>
              <Mail size={16} color="#111111" />
              <p style={styles.composerTitle}>Email your waitlist</p>
              <span style={styles.composerCount}>{waitlist.length} recipients</span>
            </div>
            <button style={styles.composerCloseBtn} onClick={() => { setShowComposer(false); handleReset(); }}>
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
              <button style={styles.sendAnotherBtn} onClick={handleReset}>Send Another</button>
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
                  <button
                    style={styles.imageUploadBtn}
                    onClick={() => imageRef.current?.click()}
                    disabled={imageUploading}
                  >
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
                    onClick={handleSend}
                    disabled={!canSend || sending}
                  >
                    <Send size={13} />
                    {sending ? "Sending..." : `Send to ${waitlist.length} people`}
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
      )}

      {waitlist.length > 0 && (
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{waitlist.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {waitlist.filter((e) => new Date().getTime() - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length}
            </span>
            <span style={styles.statLabel}>This week</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>
              {waitlist.filter((e) => new Date().getTime() - new Date(e.created_at).getTime() < 24 * 60 * 60 * 1000).length}
            </span>
            <span style={styles.statLabel}>Today</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>{emailHistory.length}</span>
            <span style={styles.statLabel}>Emails sent</span>
          </div>
        </div>
      )}

      {emailHistory.length > 0 && (
        <div style={styles.historySection}>
          <button style={styles.historyToggle} onClick={() => setShowHistory(!showHistory)}>
            <Mail size={13} color="#888888" />
            <span style={styles.historyToggleText}>Email history ({emailHistory.length})</span>
            {showHistory ? <ChevronUp size={14} color="#888888" /> : <ChevronDown size={14} color="#888888" />}
          </button>
          {showHistory && (
            <div style={styles.historyList}>
              {emailHistory.map((h) => (
                <div key={h.id} style={styles.historyRow}>
                  <div style={styles.historyLeft}>
                    <div style={styles.historyIcon}><Mail size={12} color="#888888" /></div>
                    <div>
                      <p style={styles.historySubject}>{h.subject}</p>
                      <p style={styles.historyMeta}>{timeAgo(h.created_at)}</p>
                    </div>
                  </div>
                  <span style={styles.historySentCount}>{h.sent_count} sent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {waitlist.length > 0 && (
        <div style={styles.searchWrapper}>
          <Search size={14} color="#aaaaaa" style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {waitlist.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}><AlertCircle size={32} color="#e5e5e5" /></div>
          <h2 style={styles.emptyTitle}>No one here yet</h2>
          <p style={styles.emptyText}>Share your profile link to start building your waitlist.</p>
          {!isTeamMember && (
            <button style={styles.emptyBtn} onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No results for "{search}"</p>
        </div>
      ) : (
        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <span style={styles.listHeaderCell}>Person</span>
            <span style={styles.listHeaderCell}>Email</span>
            <span style={styles.listHeaderCell}>Joined</span>
          </div>
          {filtered.map((entry, i) => (
            <div key={entry.id} style={{ ...styles.listRow, backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
              <div style={styles.listRowLeft}>
                <div style={styles.listAvatar}>
                  <span style={styles.listAvatarText}>{(entry.name || entry.email)[0].toUpperCase()}</span>
                </div>
                <div>
                  <p style={styles.listName}>
                    {entry.name || <span style={styles.listNoName}>No name</span>}
                  </p>
                </div>
              </div>
              <div style={styles.listEmail}>
                <Mail size={12} color="#aaaaaa" />
                <span style={styles.listEmailText}>{entry.email}</span>
              </div>
              <div style={styles.listTime}>
                <Clock size={11} color="#cccccc" />
                <span style={styles.listTimeText}>{timeAgo(entry.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "860px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  exportBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  emailBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
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
  historySection: { marginBottom: "16px" },
  historyToggle: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#ffffff", border: "1px solid #f0f0f0", borderRadius: "10px", cursor: "pointer", width: "100%" },
  historyToggleText: { fontSize: "13px", fontWeight: "500", color: "#888888", flex: 1, textAlign: "left" },
  historyList: { backgroundColor: "#ffffff", borderRadius: "0 0 10px 10px", border: "1px solid #f0f0f0", borderTop: "none", overflow: "hidden" },
  historyRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f9f9f9" },
  historyLeft: { display: "flex", alignItems: "center", gap: "10px" },
  historyIcon: { width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  historySubject: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0 0 2px 0" },
  historyMeta: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  historySentCount: { fontSize: "12px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", padding: "3px 10px", borderRadius: "99px", border: "1px solid #c6f6d5", flexShrink: 0 },
  statsBar: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statItem: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#111111" },
  statLabel: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" },
  statDivider: { width: "1px", height: "32px", backgroundColor: "#f0f0f0" },
  searchWrapper: { position: "relative", marginBottom: "14px" },
  searchIcon: { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "11px 14px 11px 38px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box", color: "#111111" },
  listCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  listHeader: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", padding: "10px 18px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0" },
  listHeaderCell: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em" },
  listRow: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", padding: "13px 18px", alignItems: "center", borderBottom: "1px solid #f5f5f5" },
  listRowLeft: { display: "flex", alignItems: "center", gap: "10px" },
  listAvatar: { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  listAvatarText: { fontSize: "12px", fontWeight: "600", color: "#888888" },
  listName: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0" },
  listNoName: { color: "#cccccc", fontStyle: "italic", fontWeight: "400" },
  listEmail: { display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" },
  listEmailText: { fontSize: "12px", color: "#666666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  listTime: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  listTimeText: { fontSize: "11px", color: "#cccccc", whiteSpace: "nowrap" },
  emptyState: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "56px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  emptyIcon: { marginBottom: "12px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#cccccc", margin: "0 0 6px 0" },
  emptyText: { fontSize: "13px", color: "#dddddd", margin: "0 0 20px 0", lineHeight: "1.6", maxWidth: "240px" },
  emptyBtn: { padding: "9px 18px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "none", borderRadius: "8px", cursor: "pointer" },
};