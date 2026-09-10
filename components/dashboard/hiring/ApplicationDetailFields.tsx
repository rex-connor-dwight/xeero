"use client";

import { FileText, Download, X, AlertCircle, ExternalLink, Globe, Link2, Briefcase, Eye } from "lucide-react";

type Application = {
  cv_url: string | null;
  cv_link: string | null;
  cover_letter_url: string | null;
  cover_letter_link: string | null;
  portfolio_link: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  twitter_url: string | null;
};

function isPreviewable(url: string) {
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

function AttachmentCard({
  icon,
  label,
  sublabel,
  isFile,
  loading,
  previewable,
  onPreview,
  onDownload,
  downloading,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  isFile: boolean;
  loading?: boolean;
  previewable?: boolean;
  onPreview?: () => void;
  onDownload?: () => void;
  downloading?: boolean;
  href?: string;
}) {
  if (loading) {
    return (
      <div style={styles.attachmentCard}>
        <div style={styles.attachmentIcon}>{icon}</div>
        <div style={styles.attachmentInfo}>
          <p style={styles.attachmentLabel}>{label}</p>
          <p style={styles.attachmentSub}>Loading...</p>
        </div>
      </div>
    );
  }

  if (isFile) {
    return (
      <div style={styles.attachmentCard}>
        <div style={styles.attachmentIcon}>{icon}</div>
        <div style={styles.attachmentInfo}>
          <p style={styles.attachmentLabel}>{label}</p>
          <p style={styles.attachmentSub}>{sublabel}</p>
        </div>
        <div style={styles.attachmentActions}>
          {previewable ? (
            <button style={styles.iconBtn} onClick={onPreview} title="Preview">
              <Eye size={14} color="#3182ce" />
            </button>
          ) : (
            <AlertCircle size={14} color="#d69e2e" />
          )}
          <button style={styles.iconBtn} onClick={onDownload} disabled={downloading} title="Download">
            <Download size={14} color={downloading ? "#cccccc" : "#888888"} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={styles.attachmentCardLink}>
      <div style={styles.attachmentIcon}>{icon}</div>
      <div style={styles.attachmentInfo}>
        <p style={styles.attachmentLabel}>{label}</p>
        <p style={styles.attachmentSub}>{sublabel}</p>
      </div>
      <ExternalLink size={14} color="#bbbbbb" />
    </a>
  );
}

export default function ApplicationDetailFields({
  app,
  cvSignedUrl,
  coverSignedUrl,
  onPreviewCv,
  onDownloadCv,
  onPreviewCover,
  onDownloadCover,
  downloadingCv,
  downloadingCover,
}: {
  app: Application;
  cvSignedUrl: string | null;
  coverSignedUrl: string | null;
  onPreviewCv: () => void;
  onDownloadCv: () => void;
  onPreviewCover: () => void;
  onDownloadCover: () => void;
  downloadingCv: boolean;
  downloadingCover: boolean;
}) {
  const cvPreviewable = app.cv_url ? isPreviewable(app.cv_url) : false;
  const coverPreviewable = app.cover_letter_url ? isPreviewable(app.cover_letter_url) : false;

  const hasSocials = app.portfolio_link || app.linkedin_url || app.website_url || app.twitter_url;

  return (
    <div style={styles.wrap}>
      {app.cv_url ? (
        <AttachmentCard
          icon={<FileText size={15} color="#3182ce" />}
          label="CV / Resume"
          sublabel={cvSignedUrl ? "Uploaded file" : "Loading..."}
          isFile
          loading={!cvSignedUrl}
          previewable={cvPreviewable}
          onPreview={onPreviewCv}
          onDownload={onDownloadCv}
          downloading={downloadingCv}
        />
      ) : app.cv_link ? (
        <AttachmentCard
          icon={<Link2 size={15} color="#3182ce" />}
          label="CV / Resume"
          sublabel="Shared as a link"
          isFile={false}
          href={app.cv_link}
        />
      ) : (
        <div style={styles.noAttachment}>No CV attached</div>
      )}

      {app.cover_letter_url ? (
        <AttachmentCard
          icon={<FileText size={15} color="#3182ce" />}
          label="Cover Letter"
          sublabel={coverSignedUrl ? "Uploaded file" : "Loading..."}
          isFile
          loading={!coverSignedUrl}
          previewable={coverPreviewable}
          onPreview={onPreviewCover}
          onDownload={onDownloadCover}
          downloading={downloadingCover}
        />
      ) : app.cover_letter_link ? (
        <AttachmentCard
          icon={<Link2 size={15} color="#3182ce" />}
          label="Cover Letter"
          sublabel="Shared as a link"
          isFile={false}
          href={app.cover_letter_link}
        />
      ) : null}

      {hasSocials && (
        <div style={styles.socialsGrid}>
          {app.portfolio_link && (
            <a href={app.portfolio_link} target="_blank" rel="noopener noreferrer" style={styles.socialChip}>
              <Briefcase size={13} color="#888888" /><span>Portfolio</span><ExternalLink size={10} color="#cccccc" />
            </a>
          )}
          {app.linkedin_url && (
            <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" style={styles.socialChip}>
              <Link2 size={13} color="#888888" /><span>LinkedIn</span><ExternalLink size={10} color="#cccccc" />
            </a>
          )}
          {app.website_url && (
            <a href={app.website_url} target="_blank" rel="noopener noreferrer" style={styles.socialChip}>
              <Globe size={13} color="#888888" /><span>Website / GitHub</span><ExternalLink size={10} color="#cccccc" />
            </a>
          )}
          {app.twitter_url && (
            <a href={app.twitter_url} target="_blank" rel="noopener noreferrer" style={styles.socialChip}>
              <Link2 size={13} color="#888888" /><span>Twitter / X</span><ExternalLink size={10} color="#cccccc" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  wrap: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" },
  attachmentCard: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "10px" },
  attachmentCardLink: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "10px", textDecoration: "none", cursor: "pointer" },
  attachmentIcon: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ebf8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  attachmentInfo: { flex: 1, minWidth: 0 },
  attachmentLabel: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  attachmentSub: { fontSize: "11px", color: "#999999", margin: "0" },
  attachmentActions: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  iconBtn: { width: "28px", height: "28px", borderRadius: "7px", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  noAttachment: { fontSize: "12px", color: "#bbbbbb", padding: "4px 0" },
  socialsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px", marginTop: "2px" },
  socialChip: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#555555", textDecoration: "none", padding: "8px 10px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "8px" },
};