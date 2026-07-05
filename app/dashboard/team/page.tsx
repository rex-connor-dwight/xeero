"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Users,
  Plus,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  X,
  Send,
  Pencil,
} from "lucide-react";
import UpgradeGateModal from "@/components/dashboard/UpgradeGateModal";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  permissions: string[];
  created_at: string;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  accepted: boolean;
  expires_at: string;
  created_at: string;
};

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

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TeamPage() {
  const { profile, profileLoading, isTeamsActive } = useXeero();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showGate, setShowGate] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("CMO");
  const [invitePermissions, setInvitePermissions] = useState<string[]>(ROLE_PERMISSIONS["CMO"]);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Reassign permissions
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);

    const [membersRes, invitesRes] = await Promise.all([
      supabase.from("team_profiles").select("*").eq("profile_id", profile.id).order("created_at", { ascending: true }),
      supabase.from("team_invites").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }),
    ]);

    setMembers(membersRes.data || []);
    setInvites(invitesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const handleRoleChange = (role: string) => {
    setInviteRole(role);
    setInvitePermissions(ROLE_PERMISSIONS[role] || []);
  };

  const togglePermission = (key: string) => {
    setInvitePermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSendInvite = async () => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    if (!inviteEmail || !inviteRole || !profile) return;
    setInviteSending(true);
    setInviteError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-team-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            profile_id: profile.id,
            email: inviteEmail,
            role: inviteRole,
            permissions: invitePermissions,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        setInviteError(data.error || "Something went wrong.");
      } else {
        setInviteSuccess(true);
        setInviteEmail("");
        setInviteRole("CMO");
        setInvitePermissions(ROLE_PERMISSIONS["CMO"]);
        await fetchData();
        setTimeout(() => setInviteSuccess(false), 4000);
      }
    } catch {
      setInviteError("Something went wrong. Please try again.");
    }
    setInviteSending(false);
  };

  const handleDeleteMember = async (id: string) => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    await supabase.from("team_profiles").delete().eq("id", id);
    await fetchData();
  };

  const handleDeleteInvite = async (id: string) => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    await supabase.from("team_invites").delete().eq("id", id);
    await fetchData();
  };

  const startEditingPermissions = (member: TeamMember) => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    setEditingMemberId(member.id);
    setEditPermissions(member.permissions || []);
  };

  const toggleEditPermission = (key: string) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async (memberId: string) => {
    if (!isTeamsActive) {
      setShowGate(true);
      return;
    }
    setSavingPermissions(true);
    await supabase
      .from("team_profiles")
      .update({ permissions: editPermissions })
      .eq("id", memberId);
    await fetchData();
    setSavingPermissions(false);
    setEditingMemberId(null);
  };

  const handleShowInviteForm = () => {
    setShowInviteForm(!showInviteForm);
  };

  if (profileLoading || loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const pendingInvites = invites.filter((i) => !i.accepted);

  return (
    <div style={styles.page}>
      {showGate && <UpgradeGateModal featureName="Team Management" onClose={() => setShowGate(false)} />}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Users size={18} color="#111111" /></div>
          <div>
            <h1 style={styles.headerTitle}>Team</h1>
            <p style={styles.headerSub}>{members.length} member{members.length !== 1 ? "s" : ""} · {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button style={styles.inviteBtn} onClick={handleShowInviteForm}>
          <Plus size={14} />Invite
        </button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div style={styles.inviteCard}>
          <div style={styles.inviteCardHeader}>
            <p style={styles.inviteCardTitle}>Invite a team member</p>
            <button style={styles.closeBtn} onClick={() => setShowInviteForm(false)}>
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
          <select
            style={styles.select}
            value={inviteRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {Object.keys(ROLE_PERMISSIONS).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label style={styles.label}>Permissions</label>
          <div style={styles.permissionsGrid}>
            {ALL_PERMISSIONS.map((p) => (
              <button
                key={p.key}
                style={{
                  ...styles.permissionBtn,
                  ...(invitePermissions.includes(p.key) ? styles.permissionBtnActive : {}),
                }}
                onClick={() => togglePermission(p.key)}
              >
                {invitePermissions.includes(p.key) && <CheckCircle size={12} color="#38a169" />}
                {p.label}
              </button>
            ))}
          </div>

          {inviteError && <p style={styles.errorText}>{inviteError}</p>}

          <button
            style={{ ...styles.sendBtn, opacity: inviteEmail && inviteRole && !inviteSending ? 1 : 0.5 }}
            onClick={handleSendInvite}
            disabled={!inviteEmail || !inviteRole || inviteSending}
          >
            <Send size={13} />
            {inviteSending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      )}

      {/* Active members */}
      <p style={styles.sectionLabel}>Active members</p>
      {members.length === 0 ? (
        <div style={styles.emptyCard}>
          <Users size={24} color="#cccccc" />
          <p style={styles.emptyText}>No team members yet. Invite someone to get started.</p>
        </div>
      ) : (
        <div style={styles.membersList}>
          {members.map((m) => (
            <div key={m.id} style={styles.memberRowWrapper}>
              <div style={styles.memberRow}>
                <div style={styles.memberAvatar}>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" style={styles.memberPhoto} />
                  ) : (
                    <span style={styles.memberInitial}>{m.name[0].toUpperCase()}</span>
                  )}
                </div>
                <div style={styles.memberInfo}>
                  <p style={styles.memberName}>{m.name}</p>
                  <p style={styles.memberRole}>{m.role}</p>
                  <div style={styles.permissionTags}>
                    {(m.permissions || []).length === 0 ? (
                      <span style={styles.noPermissionTag}>No permissions assigned</span>
                    ) : (
                      (m.permissions || []).map((p) => (
                        <span key={p} style={styles.permissionTag}>
                          {ALL_PERMISSIONS.find((a) => a.key === p)?.label || p}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div style={styles.memberActions}>
                  <button
                    style={styles.editBtn}
                    onClick={() => startEditingPermissions(m)}
                  >
                    <Pencil size={13} />
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteMember(m.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Reassign permissions editor */}
              {editingMemberId === m.id && (
                <div style={styles.editPanel}>
                  <p style={styles.editPanelTitle}>Reassign permissions for {m.name}</p>
                  <div style={styles.permissionsGrid}>
                    {ALL_PERMISSIONS.map((p) => (
                      <button
                        key={p.key}
                        style={{
                          ...styles.permissionBtn,
                          ...(editPermissions.includes(p.key) ? styles.permissionBtnActive : {}),
                        }}
                        onClick={() => toggleEditPermission(p.key)}
                      >
                        {editPermissions.includes(p.key) && <CheckCircle size={12} color="#38a169" />}
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={styles.editPanelActions}>
                    <button
                      style={styles.cancelEditBtn}
                      onClick={() => setEditingMemberId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      style={{ ...styles.sendBtn, opacity: savingPermissions ? 0.6 : 1 }}
                      onClick={() => handleSavePermissions(m.id)}
                      disabled={savingPermissions}
                    >
                      {savingPermissions ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <>
          <p style={styles.sectionLabel}>Pending invites</p>
          <div style={styles.membersList}>
            {pendingInvites.map((inv) => (
              <div key={inv.id} style={styles.memberRow}>
                <div style={{ ...styles.memberAvatar, backgroundColor: "#fffbeb" }}>
                  <Mail size={16} color="#d69e2e" />
                </div>
                <div style={styles.memberInfo}>
                  <p style={styles.memberName}>{inv.email}</p>
                  <p style={styles.memberRole}>{inv.role}</p>
                  <div style={styles.inviteStatus}>
                    <Clock size={11} color="#d69e2e" />
                    <span style={styles.inviteStatusText}>
                      Sent {timeAgo(inv.created_at)} · expires {new Date(inv.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button style={styles.deleteBtn} onClick={() => handleDeleteInvite(inv.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  inviteBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
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
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "40px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center", marginBottom: "24px" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
  membersList: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", marginBottom: "24px" },
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
  editPanel: { padding: "16px 18px", backgroundColor: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "12px" },
  editPanelTitle: { fontSize: "12px", fontWeight: "600", color: "#666666", margin: "0" },
  editPanelActions: { display: "flex", gap: "8px", justifyContent: "flex-end" },
  cancelEditBtn: { padding: "9px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  inviteStatus: { display: "flex", alignItems: "center", gap: "4px" },
  inviteStatusText: { fontSize: "11px", color: "#d69e2e" },
  deleteBtn: { width: "32px", height: "32px", borderRadius: "6px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e", flexShrink: 0 },
};