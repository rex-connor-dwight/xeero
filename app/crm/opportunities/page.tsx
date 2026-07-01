"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Plus,
  ImagePlus,
  X,
  Send,
  CheckCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Opportunity = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  cta_label: string;
  cta_url: string;
  start_date: string;
  end_date: string;
  target: string;
  published: boolean;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isExpired(endDate: string) {
  return new Date(endDate) < new Date();
}

export default function OpportunitiesPage() {
  const { user, loading } = useXeero();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [target, setTarget] = useState("all");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });
    setOpportunities(data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) {
      fetchData();
    }
  }, [loading, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const ext = file.name.split(".").pop();
    const path = `opportunities/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("email-assets")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("email-assets").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setImageUploading(false);
  };

  const handleSaveDraft = async () => {
    if (!title || !description || !ctaLabel || !ctaUrl || !startDate || !endDate) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setFormError("");

    const { error } = await supabase.from("opportunities").insert({
      title,
      description,
      image_url: imageUrl || null,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      target,
      published: false,
    });

    if (error) {
      setFormError("Something went wrong. Please try again.");
    } else {
      resetForm();
      setShowForm(false);
      await fetchData();
    }
    setSaving(false);
  };

  const handlePublish = async (opp: Opportunity) => {
    setPublishing(opp.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Warm up
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-opportunity`,
        { method: "OPTIONS", headers: { "Authorization": `Bearer ${session?.access_token}` } }
      ).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-opportunity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ opportunity_id: opp.id }),
        }
      );
      const data = await res.json();
      if (data.success) await fetchData();
    } catch {
      // silent
    }
    setPublishing(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("opportunities").delete().eq("id", id);
    await fetchData();
    setDeleting(null);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setCtaLabel("");
    setCtaUrl("");
    setStartDate("");
    setEndDate("");
    setTarget("all");
    setFormError("");
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const active = opportunities.filter((o) => !isExpired(o.end_date));
  const expired = opportunities.filter((o) => isExpired(o.end_date));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Opportunities</h1>
          <p style={styles.sub}>Funding opportunities, pitch competitions and investor events for founders.</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchData}>
            <RefreshCw size={13} />
          </button>
          <button style={styles.createBtn} onClick={() => { setShowForm(!showForm); resetForm(); }}>
            <Plus size={14} />
            New Opportunity
          </button>
        </div>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <p style={styles.formTitle}>New Opportunity</p>
            <button style={styles.formCloseBtn} onClick={() => { setShowForm(false); resetForm(); }}>
              <X size={16} color="#888888" />
            </button>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formLeft}>

              {/* Image */}
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
                  <ImagePlus size={16} color="#888888" />
                  <span>{imageUploading ? "Uploading..." : "Upload header image"}</span>
                </button>
              )}
              <input ref={imageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

              <label style={styles.label}>Title <span style={styles.req}>*</span></label>
              <input style={styles.input} placeholder="e.g. Tony Elumelu Foundation Grant 2025" value={title} onChange={(e) => setTitle(e.target.value)} />

              <label style={styles.label}>Description <span style={styles.req}>*</span></label>
              <textarea
                style={styles.textarea}
                placeholder="Describe the opportunity. Who is it for? What do they get? What's required to apply?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div style={styles.twoCol}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>CTA Label <span style={styles.req}>*</span></label>
                  <input style={styles.input} placeholder="e.g. Apply Now" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>CTA URL <span style={styles.req}>*</span></label>
                  <input style={styles.input} placeholder="https://..." value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
                </div>
              </div>

              <div style={styles.twoCol}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Start Date <span style={styles.req}>*</span></label>
                  <input style={styles.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>End Date <span style={styles.req}>*</span></label>
                  <input style={styles.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <label style={styles.label}>Target Audience</label>
              <select style={styles.select} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="all">All Founders</option>
                <option value="live">Live Profiles Only</option>
                <option value="draft">Draft Profiles Only</option>
              </select>

              {formError && <p style={styles.errorText}>{formError}</p>}

              <div style={styles.formActions}>
                <button
                  style={{ ...styles.saveDraftBtn, opacity: saving ? 0.6 : 1 }}
                  onClick={handleSaveDraft}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save as Draft"}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div style={styles.formRight}>
              <p style={styles.previewLabel}>Notification Preview</p>
              <div style={styles.previewCard}>
                {imageUrl ? (
                  <img src={imageUrl} alt="" style={styles.previewImage} />
                ) : (
                  <div style={styles.previewGradient} />
                )}
                <div style={styles.previewBody}>
                  <div style={styles.previewBadge}>
                    <span style={styles.previewBadgeText}>New Opportunity</span>
                  </div>
                  <h3 style={styles.previewTitle}>{title || "Opportunity title"}</h3>
                  <p style={styles.previewDesc}>{description || "Description will appear here..."}</p>
                  {endDate && (
                    <div style={styles.previewDeadline}>
                      <p style={styles.previewDeadlineText}>
                        Deadline: {new Date(endDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  )}
                  {ctaLabel && (
                    <div style={styles.previewCta}>
                      <span style={styles.previewCtaBtn}>{ctaLabel} →</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Opportunities ── */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Active ({active.length})</p>
        {active.length === 0 && (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No active opportunities. Create one above.</p>
          </div>
        )}
        {active.map((opp) => (
          <div key={opp.id} style={styles.oppCard}>
            {opp.image_url && (
              <img src={opp.image_url} alt="" style={styles.oppImage} />
            )}
            <div style={styles.oppBody}>
              <div style={styles.oppTop}>
                <div style={styles.oppLeft}>
                  <div style={styles.oppTitleRow}>
                    <p style={styles.oppTitle}>{opp.title}</p>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: opp.published ? "#f0fff4" : "#fffbeb",
                      color: opp.published ? "#38a169" : "#d69e2e",
                      border: `1px solid ${opp.published ? "#c6f6d5" : "#fef08a"}`,
                    }}>
                      {opp.published ? "Published" : "Draft"}
                    </span>
                    <span style={styles.targetBadge}>{opp.target}</span>
                  </div>
                  <p style={styles.oppDesc}>{opp.description.slice(0, 120)}{opp.description.length > 120 ? "..." : ""}</p>
                  <p style={styles.oppMeta}>
                    {formatDate(opp.start_date)} → {formatDate(opp.end_date)}
                  </p>
                </div>
                <div style={styles.oppActions}>
                  <a href={opp.cta_url} target="_blank" rel="noopener noreferrer" style={styles.iconBtn}>
                    <ExternalLink size={13} color="#888888" />
                  </a>
                  {!opp.published && (
                    <button
                      style={{ ...styles.publishBtn, opacity: publishing === opp.id ? 0.6 : 1 }}
                      onClick={() => handlePublish(opp)}
                      disabled={publishing === opp.id}
                    >
                      <Send size={13} />
                      {publishing === opp.id ? "Publishing..." : "Publish"}
                    </button>
                  )}
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(opp.id)}
                    disabled={deleting === opp.id}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Expired ── */}
      {expired.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Expired ({expired.length})</p>
          {expired.map((opp) => (
            <div key={opp.id} style={{ ...styles.oppCard, opacity: 0.5 }}>
              <div style={styles.oppBody}>
                <div style={styles.oppTop}>
                  <div style={styles.oppLeft}>
                    <p style={styles.oppTitle}>{opp.title}</p>
                    <p style={styles.oppMeta}>Ended {formatDate(opp.end_date)}</p>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(opp.id)}
                    disabled={deleting === opp.id}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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
  page: { padding: "32px", maxWidth: "1000px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  refreshBtn: { width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  createBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  formCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "24px" },
  formHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  formTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0" },
  formCloseBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" },
  formGrid: { display: "flex", gap: "24px", alignItems: "flex-start" },
  formLeft: { flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
  formRight: { width: "300px", flexShrink: 0 },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block" },
  req: { color: "#e53e3e" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "120px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.7", color: "#111111" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111", appearance: "none" },
  twoCol: { display: "flex", gap: "10px" },
  imageUploadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "14px", fontSize: "13px", color: "#888888", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "10px", cursor: "pointer", width: "100%", justifyContent: "center" },
  imagePreviewWrapper: { position: "relative", borderRadius: "10px", overflow: "hidden" },
  imagePreview: { width: "100%", display: "block", maxHeight: "160px", objectFit: "cover" },
  imageRemoveBtn: { position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" },
  errorText: { fontSize: "13px", color: "#e53e3e", margin: "0" },
  formActions: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  saveDraftBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  previewLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px 0" },
  previewCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  previewImage: { width: "100%", display: "block", maxHeight: "140px", objectFit: "cover" },
  previewGradient: { width: "100%", height: "6px", background: "linear-gradient(135deg,#111111 0%,#1a1a2e 50%,#16213e 100%)" },
  previewBody: { padding: "16px" },
  previewBadge: { display: "inline-block", padding: "3px 10px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "99px", marginBottom: "10px" },
  previewBadgeText: { fontSize: "10px", fontWeight: "600", color: "#38a169", textTransform: "uppercase", letterSpacing: "0.08em" },
  previewTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0", lineHeight: "1.3" },
  previewDesc: { fontSize: "12px", color: "#555555", lineHeight: "1.7", margin: "0 0 12px 0" },
  previewDeadline: { padding: "8px 12px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "6px", marginBottom: "12px" },
  previewDeadlineText: { fontSize: "11px", color: "#d69e2e", fontWeight: "600", margin: "0" },
  previewCta: { marginTop: "4px" },
  previewCtaBtn: { display: "inline-block", padding: "8px 16px", backgroundColor: "#111111", color: "#ffffff", fontSize: "12px", fontWeight: "600", borderRadius: "6px" },
  section: { marginBottom: "24px" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px 0" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #f0f0f0", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  oppCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  oppImage: { width: "100%", height: "100px", objectFit: "cover", display: "block" },
  oppBody: { padding: "16px 20px" },
  oppTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" },
  oppLeft: { flex: 1 },
  oppTitleRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" },
  oppTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0" },
  statusBadge: { fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "99px" },
  targetBadge: { fontSize: "10px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", padding: "2px 8px", borderRadius: "99px", border: "1px solid #eeeeee", textTransform: "capitalize" },
  oppDesc: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0 0 6px 0" },
  oppMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  oppActions: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  iconBtn: { width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" },
  publishBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#38a169", border: "none", borderRadius: "6px", cursor: "pointer" },
  deleteBtn: { width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e" },
};