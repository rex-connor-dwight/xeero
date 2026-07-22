"use client";

import { CheckCircle, Send, X } from "lucide-react";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  "CMO": ["waitlist_email", "view_stats"],
  "CTO": ["data_room", "deck_upload", "view_stats"],
  "COO": ["waitlist_email", "data_room", "view_stats"],
  "Co-founder": ["waitlist_email", "data_room", "deck_upload", "view_stats"],
  "Custom": [],
};

const ALL_PERMISSIONS = [
  { key: "waitlist_email", label: "Waitlist Emailer" },
  { key: "data_room", label: "Data Room" },
  { key: "deck_upload", label: "Deck Upload" },
  { key: "view_stats", label: "View Stats" },
  { key: "validate", label: "Validation" },
  { key: "funding", label: "Funding" },
];

export { ROLE_PERMISSIONS, ALL_PERMISSIONS };

export default function InviteForm({
  onClose,
  inviteEmail, setInviteEmail,
  inviteRole, onRoleChange,
  customRoleLabel, setCustomRoleLabel,
  invitePermissions, togglePermission,
  inviteError, inviteSuccess, inviteSending,
  onSend,
}: {
  onClose: () => void;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteRole: string;
  onRoleChange: (v: string) => void;
  customRoleLabel: string;
  setCustomRoleLabel: (v: string) => void;
  invitePermissions: string[];
  togglePermission: (key: string) => void;
  inviteError: string;
  inviteSuccess: boolean;
  inviteSending: boolean;
  onSend: () => void;
}) {
  const canSend = inviteEmail && inviteRole && (inviteRole !== "Custom" || customRoleLabel.trim()) && !inviteSending;

  return (
    <div style={styles.inviteCard}>
      <div style={styles.inviteCardHeader}>
        <p style={styles.inviteCardTitle}>Invite a team member</p>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={16} color="#888888" />
        </button>
      </div>

      {inviteSuccess && (
        <div style={styles.successBanner}>
          <CheckCircle size={14} color="#38a169" />
          <span>Invite sent successfully.</span>
        </div>
      )}

      <label style={styles.label}>Email address</label>
      <input
        style={styles.input}
        type="email"
        placeholder="teammate@email.com"
        value={inviteEmail}
        onChange={(e) => setInviteEmail(e.target.value)}
      />

      <label style={styles.label}>Role</label>
      <select style={styles.select} value={inviteRole} onChange={(e) => onRoleChange(e.target.value)}>
        {Object.keys(ROLE_PERMISSIONS).map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {inviteRole === "Custom" && (
        <>
          <label style={styles.label}>Custom role title</label>
          <input
            style={styles.input}
            placeholder="e.g. Dev Team, Legal Partner, Growth Advisor"
            value={customRoleLabel}
            onChange={(e) => setCustomRoleLabel(e.target.value)}
          />
        </>
      )}

      <label style={styles.label}>Permissions</label>
      <div style={styles.permissionsGrid}>
        {ALL_PERMISSIONS.map((p) => (
          <button
            key={p.key}
            style={{ ...styles.permissionBtn, ...(invitePermissions.includes(p.key) ? styles.permissionBtnActive : {}) }}
            onClick={() => togglePermission(p.key)}
          >
            {invitePermissions.includes(p.key) && <CheckCircle size={12} color="#38a169" />}
            {p.label}
          </button>
        ))}
      </div>

      {inviteError && <p style={styles.errorText}>{inviteError}</p>}

      <button
        style={{ ...styles.sendBtn, opacity: canSend ? 1 : 0.5 }}
        onClick={onSend}
        disabled={!canSend}
      >
        <Send size={13} />
        {inviteSending ? "Sending..." : "Send Invite"}
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  inviteCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" },
  inviteCardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  inviteCardTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" },
  successBanner: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "8px", fontSize: "13px", color: "#38a169", fontWeight: "500" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111", appearance: "none" },
  permissionsGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  permissionBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", fontSize: "12px", fontWeight: "500", color: "#555555", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  permissionBtnActive: { backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", color: "#38a169" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0" },
  sendBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};