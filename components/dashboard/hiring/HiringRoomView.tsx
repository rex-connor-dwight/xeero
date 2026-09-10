"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Briefcase, Plus, ExternalLink, Pencil, Trash2, Copy, CheckCircle } from "lucide-react";
import HiringIntroModal from "@/components/hiring/HiringIntroModal";
import RoleCreateForm from "@/components/dashboard/hiring/RoleCreateForm";
import RoleBoard from "@/components/dashboard/hiring/RoleBoard";

const INTRO_SEEN_KEY = "xeero_hiring_intro_seen";

export default function HiringRoomView() {
  const { profile, isTeamMember, founderProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRoles = async () => {
    if (!activeProfile) return;
    const { data } = await supabase
      .from("hiring_roles")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false });

    const rolesList = data || [];

    // Get application counts for all roles in one query rather than one per role
    if (rolesList.length > 0) {
      const { data: counts } = await supabase
        .from("hiring_applications")
        .select("role_id")
        .in("role_id", rolesList.map((r) => r.id));

      const countMap: Record<string, number> = {};
      (counts || []).forEach((c) => {
        countMap[c.role_id] = (countMap[c.role_id] || 0) + 1;
      });

      setRoles(rolesList.map((r) => ({ ...r, applicant_count: countMap[r.id] || 0 })));
    } else {
      setRoles([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, [activeProfile]);

  const handleOpenRoleClick = () => {
    if (!localStorage.getItem(INTRO_SEEN_KEY)) {
      setShowIntro(true);
    } else {
      setCreating(true);
    }
  };

  const handleIntroClose = () => {
    localStorage.setItem(INTRO_SEEN_KEY, "true");
    setShowIntro(false);
    setCreating(true);
  };

  const handleCopyLink = (roleId: string) => {
    if (!activeProfile) return;
    const link = `https://xeero.me/hiring/${activeProfile.slug}-${roleId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(roleId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleStatus = (role: any) => {
    const now = new Date();
    const isScheduled = now < new Date(role.opens_at);
    const isClosed = now > new Date(role.closes_at);
    return isScheduled ? "scheduled" : isClosed ? "closed" : "open";
  };

  const handleDelete = async (roleId: string) => {
    await supabase.from("hiring_roles").delete().eq("id", roleId);
    setConfirmingDeleteId(null);
    await fetchRoles();
  };

  if (loading) return <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>;

  if (selectedRoleId) {
    const role = roles.find((r) => r.id === selectedRoleId);
    return (
      <div>
        <button style={styles.backBtn} onClick={() => setSelectedRoleId(null)}>← All Roles</button>
        <RoleBoard roleId={selectedRoleId} roleTitle={role?.title || "Role"} />
      </div>
    );
  }

  if ((creating || editingRole) && activeProfile) {
    return (
      <RoleCreateForm
        profileId={activeProfile.id}
        founderSlug={activeProfile.slug}
        existingRole={editingRole}
        onClose={() => { setCreating(false); setEditingRole(null); }}
        onCreated={() => { setCreating(false); setEditingRole(null); fetchRoles(); }}
      />
    );
  }

  return (
    <div>
      {showIntro && <HiringIntroModal onClose={handleIntroClose} />}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Briefcase size={18} color="#111111" /></div>
          <div>
            <p style={styles.headerTitle}>Hiring Room</p>
            <p style={styles.headerSub}>{roles.length} role{roles.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button style={styles.openRoleBtn} onClick={handleOpenRoleClick}>
          <Plus size={13} />Open a Role
        </button>
      </div>

      {roles.length === 0 ? (
        <div style={styles.emptyCard}>
          <Briefcase size={24} color="#cccccc" />
          <p style={styles.emptyText}>No roles yet. Open one to start receiving applications.</p>
        </div>
      ) : (
        <div style={styles.rolesList}>
          {roles.map((role) => {
            const status = getRoleStatus(role);
            const statusLabel = status === "scheduled" ? "Scheduled" : status === "closed" ? "Closed" : "Open";
            const statusColor = status === "scheduled" ? "#d69e2e" : status === "closed" ? "#888888" : "#38a169";
            const canEdit = status === "scheduled";

            return (
              <div key={role.id} style={styles.roleRow}>
                 <div style={styles.roleMain} onClick={() => setSelectedRoleId(role.id)}>
                  <div>
                    <p style={styles.roleTitle}>{role.title}</p>
                    <p style={styles.roleMeta}>
                      {statusLabel} · {role.applicant_count} applicant{role.applicant_count !== 1 ? "s" : ""}
                    </p>
                    <p style={styles.roleDates}>
                      Posted {new Date(role.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      {" · "}
                      {status === "closed" ? "Closed " : "Deadline: "}
                      {new Date(role.closes_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span style={{ ...styles.statusDot, backgroundColor: statusColor }} />
                </div>

                <div style={styles.roleActions}>
                  <button style={styles.actionBtn} onClick={() => handleCopyLink(role.id)} title="Copy link">
                    {copiedId === role.id ? <CheckCircle size={13} color="#38a169" /> : <Copy size={13} color="#888888" />}
                  </button>
                  {canEdit && (
                    <button style={styles.actionBtn} onClick={() => setEditingRole(role)} title="Edit">
                      <Pencil size={13} color="#888888" />
                    </button>
                  )}

                  {confirmingDeleteId === role.id ? (
                    <div style={styles.confirmRow}>
                      <span style={styles.confirmText}>
                        Delete permanently? {role.applicant_count > 0
                          ? `This removes all ${role.applicant_count} application${role.applicant_count !== 1 ? "s" : ""}, CVs, and answers.`
                          : ""}
                      </span>
                      <button style={styles.confirmYesBtn} onClick={() => handleDelete(role.id)}>Yes, delete</button>
                      <button style={styles.confirmNoBtn} onClick={() => setConfirmingDeleteId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button style={styles.actionBtn} onClick={() => setConfirmingDeleteId(role.id)} title="Delete">
                      <Trash2 size={13} color="#e53e3e" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <a href="https://xeero.me/hiring" target="_blank" rel="noopener noreferrer" style={styles.directoryLink}>
        View public Hiring Room <ExternalLink size={12} />
      </a>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  loadingWrap: { display: "flex", justifyContent: "center", padding: "40px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "16px", padding: "0" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "12px", color: "#888888", margin: "0" },
  openRoleBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "36px 24px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
  rolesList: { display: "flex", flexDirection: "column", gap: "8px" },
  roleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "14px 16px", gap: "10px", flexWrap: "wrap" },
  roleMain: { display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, cursor: "pointer", gap: "10px", minWidth: "140px" },
  roleTitle: { fontSize: "13px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  roleMeta: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  roleDates: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  roleActions: { display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 },
  actionBtn: { width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f9f9f9", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  confirmRow: { display: "flex", alignItems: "center", gap: "6px" },
  confirmText: { fontSize: "11px", color: "#888888", fontWeight: "500", whiteSpace: "nowrap" },
  confirmYesBtn: { padding: "6px 10px", fontSize: "11px", fontWeight: "600", color: "#ffffff", backgroundColor: "#e53e3e", border: "none", borderRadius: "6px", cursor: "pointer" },
  confirmNoBtn: { padding: "6px 10px", fontSize: "11px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "6px", cursor: "pointer" },
  directoryLink: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#3182ce", textDecoration: "none", marginTop: "16px" },
};