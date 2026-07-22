"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Users, Plus } from "lucide-react";
import UpgradeGateModal from "@/components/dashboard/UpgradeGateModal";
import InviteForm, { ROLE_PERMISSIONS } from "@/components/dashboard/team/InviteForm";
import MemberRow from "@/components/dashboard/team/MemberRow";
import PendingInvites from "@/components/dashboard/team/PendingInvites";

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
  const [customRoleLabel, setCustomRoleLabel] = useState("");
  const [invitePermissions, setInvitePermissions] = useState<string[]>(ROLE_PERMISSIONS["CMO"]);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Edit member
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
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
    if (role !== "Custom") setCustomRoleLabel("");
  };

  const togglePermission = (key: string) => {
    setInvitePermissions((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]);
  };

  const handleSendInvite = async () => {
    if (!isTeamsActive) { setShowGate(true); return; }
    if (!inviteEmail || !inviteRole || !profile) return;

    const finalRole = inviteRole === "Custom" ? customRoleLabel.trim() : inviteRole;
    if (!finalRole) return;

    setInviteSending(true);
    setInviteError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-team-invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
          body: JSON.stringify({ profile_id: profile.id, email: inviteEmail, role: finalRole, permissions: invitePermissions }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        setInviteError(data.error || "Something went wrong.");
      } else {
        setInviteSuccess(true);
        setInviteEmail("");
        setInviteRole("CMO");
        setCustomRoleLabel("");
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
    if (!isTeamsActive) { setShowGate(true); return; }
    await supabase.from("team_profiles").delete().eq("id", id);
    await fetchData();
  };

  const handleDeleteInvite = async (id: string) => {
    if (!isTeamsActive) { setShowGate(true); return; }
    await supabase.from("team_invites").delete().eq("id", id);
    await fetchData();
  };

  const startEditingMember = (member: TeamMember) => {
    if (!isTeamsActive) { setShowGate(true); return; }
    setEditingMemberId(member.id);
    setEditRole(member.role);
    setEditPermissions(member.permissions || []);
  };

  const toggleEditPermission = (key: string) => {
    setEditPermissions((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]);
  };

  const handleSaveMember = async (memberId: string) => {
    if (!isTeamsActive) { setShowGate(true); return; }
    if (!editRole.trim()) return;
    setSavingPermissions(true);
    await supabase
      .from("team_profiles")
      .update({ role: editRole.trim(), permissions: editPermissions })
      .eq("id", memberId);
    await fetchData();
    setSavingPermissions(false);
    setEditingMemberId(null);
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
        <button style={styles.inviteBtn} onClick={() => setShowInviteForm(!showInviteForm)}>
          <Plus size={14} />Invite
        </button>
      </div>

      {showInviteForm && (
        <InviteForm
          onClose={() => setShowInviteForm(false)}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteRole={inviteRole}
          onRoleChange={handleRoleChange}
          customRoleLabel={customRoleLabel}
          setCustomRoleLabel={setCustomRoleLabel}
          invitePermissions={invitePermissions}
          togglePermission={togglePermission}
          inviteError={inviteError}
          inviteSuccess={inviteSuccess}
          inviteSending={inviteSending}
          onSend={handleSendInvite}
        />
      )}

      <p style={styles.sectionLabel}>Active members</p>
      {members.length === 0 ? (
        <div style={styles.emptyCard}>
          <Users size={24} color="#cccccc" />
          <p style={styles.emptyText}>No team members yet. Invite someone to get started.</p>
        </div>
      ) : (
        <div style={styles.membersList}>
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isEditing={editingMemberId === m.id}
              editRole={editRole}
              setEditRole={setEditRole}
              editPermissions={editPermissions}
              toggleEditPermission={toggleEditPermission}
              savingPermissions={savingPermissions}
              onStartEdit={startEditingMember}
              onCancelEdit={() => setEditingMemberId(null)}
              onSave={handleSaveMember}
              onDelete={handleDeleteMember}
            />
          ))}
        </div>
      )}

      <PendingInvites invites={pendingInvites} onDelete={handleDeleteInvite} />
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
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "40px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center", marginBottom: "24px" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
  membersList: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", marginBottom: "24px" },
};