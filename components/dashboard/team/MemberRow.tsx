"use client";

import { CheckCircle, Pencil, Trash2 } from "lucide-react";
import { ALL_PERMISSIONS } from "@/components/dashboard/team/InviteForm";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  permissions: string[];
  created_at: string;
};

export default function MemberRow({
  member,
  isEditing,
  editRole,
  setEditRole,
  editPermissions,
  toggleEditPermission,
  savingPermissions,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  member: TeamMember;
  isEditing: boolean;
  editRole: string;
  setEditRole: (v: string) => void;
  editPermissions: string[];
  toggleEditPermission: (key: string) => void;
  savingPermissions: boolean;
  onStartEdit: (member: TeamMember) => void;
  onCancelEdit: () => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={styles.memberRowWrapper}>
      <div style={styles.memberRow}>
        <div style={styles.memberAvatar}>
          {member.photo_url ? (
            <img src={member.photo_url} alt="" style={styles.memberPhoto} />
          ) : (
            <span style={styles.memberInitial}>{member.name[0].toUpperCase()}</span>
          )}
        </div>
        <div style={styles.memberInfo}>
          <p style={styles.memberName}>{member.name}</p>
          <p style={styles.memberRole}>{member.role}</p>
          <div style={styles.permissionTags}>
            {(member.permissions || []).length === 0 ? (
              <span style={styles.noPermissionTag}>No permissions assigned</span>
            ) : (
              (member.permissions || []).map((p) => (
                <span key={p} style={styles.permissionTag}>
                  {ALL_PERMISSIONS.find((a) => a.key === p)?.label || p}
                </span>
              ))
            )}
          </div>
        </div>
        <div style={styles.memberActions}>
          <button style={styles.editBtn} onClick={() => onStartEdit(member)}>
            <Pencil size={13} />
          </button>
          <button style={styles.deleteBtn} onClick={() => onDelete(member.id)}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div style={styles.editPanel}>
          <p style={styles.editPanelTitle}>Edit {member.name}</p>

          <label style={styles.editLabel}>Role title</label>
          <input
            style={styles.editInput}
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            placeholder="e.g. CTO, Dev Team, Legal Partner"
          />

          <label style={styles.editLabel}>Permissions</label>
          <div style={styles.permissionsGrid}>
            {ALL_PERMISSIONS.map((p) => (
              <button
                key={p.key}
                style={{ ...styles.permissionBtn, ...(editPermissions.includes(p.key) ? styles.permissionBtnActive : {}) }}
                onClick={() => toggleEditPermission(p.key)}
              >
                {editPermissions.includes(p.key) && <CheckCircle size={12} color="#38a169" />}
                {p.label}
              </button>
            ))}
          </div>

          <div style={styles.editPanelActions}>
            <button style={styles.cancelEditBtn} onClick={onCancelEdit}>Cancel</button>
            <button
              style={{ ...styles.saveBtn, opacity: savingPermissions ? 0.6 : 1 }}
              onClick={() => onSave(member.id)}
              disabled={savingPermissions}
            >
              {savingPermissions ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  memberRowWrapper: { borderBottom: "1px solid #f9f9f9" },
  memberRow: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px 18px" },
  memberAvatar: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  memberPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  memberInitial: { fontSize: "15px", fontWeight: "700", color: "#666666" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  memberRole: { fontSize: "12px", color: "#888888", margin: "0 0 8px 0" },
  permissionTags: { display: "flex", flexWrap: "wrap", gap: "4px" },
  permissionTag: { fontSize: "10px", fontWeight: "500", color: "#3182ce", backgroundColor: "#ebf8ff", padding: "2px 8px", borderRadius: "99px", border: "1px solid #bee3f8" },
  noPermissionTag: { fontSize: "10px", fontWeight: "500", color: "#aaaaaa", fontStyle: "italic" },
  memberActions: { display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 },
  editBtn: { width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111", flexShrink: 0 },
  deleteBtn: { width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e", flexShrink: 0 },
  editPanel: { padding: "16px 18px", backgroundColor: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "10px" },
  editPanelTitle: { fontSize: "12px", fontWeight: "600", color: "#666666", margin: "0" },
  editLabel: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block" },
  editInput: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box", color: "#111111" },
  permissionsGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  permissionBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", fontSize: "12px", fontWeight: "500", color: "#555555", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  permissionBtnActive: { backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", color: "#38a169" },
  editPanelActions: { display: "flex", gap: "8px", justifyContent: "flex-end" },
  cancelEditBtn: { padding: "9px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  saveBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};