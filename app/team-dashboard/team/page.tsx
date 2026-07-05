"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Users } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
};

export default function TeamDirectoryPage() {
  const { teamProfile, founderProfile, profileLoading } = useXeero();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!founderProfile) return;
    supabase
      .from("team_profiles")
      .select("id, name, role, photo_url")
      .eq("profile_id", founderProfile.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMembers(data || []);
        setLoading(false);
      });
  }, [founderProfile]);

  if (profileLoading || loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Users size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Team</h1>
          <p style={styles.headerSub}>
            Everyone working on {founderProfile?.startup_name}
          </p>
        </div>
      </div>

      {/* Founder */}
      <p style={styles.sectionLabel}>Founder</p>
      <div style={styles.membersList}>
        <div style={styles.memberRow}>
          <div style={styles.memberAvatar}>
            {founderProfile?.logo_url ? (
              <img src={founderProfile.logo_url} alt="" style={styles.memberPhoto} />
            ) : (
              <span style={styles.memberInitial}>
                {founderProfile?.founder_name?.[0]?.toUpperCase() || "F"}
              </span>
            )}
          </div>
          <div>
            <p style={styles.memberName}>{founderProfile?.founder_name}</p>
            <p style={styles.memberRole}>Founder</p>
          </div>
        </div>
      </div>

      {/* Team members */}
      <p style={styles.sectionLabel}>Team members</p>
      {members.length === 0 ? (
        <div style={styles.emptyCard}>
          <Users size={24} color="#cccccc" />
          <p style={styles.emptyText}>No other team members yet.</p>
        </div>
      ) : (
        <div style={styles.membersList}>
          {members.map((m) => (
            <div key={m.id} style={styles.memberRow}>
              <div style={styles.memberAvatar}>
                {m.photo_url ? (
                  <img src={m.photo_url} alt="" style={styles.memberPhoto} />
                ) : (
                  <span style={styles.memberInitial}>{m.name[0].toUpperCase()}</span>
                )}
                {m.id === teamProfile?.id && (
                  <div style={styles.youDot} />
                )}
              </div>
              <div>
                <p style={styles.memberName}>
                  {m.name} {m.id === teamProfile?.id && <span style={styles.youTag}>(You)</span>}
                </p>
                <p style={styles.memberRole}>{m.role}</p>
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
  page: { padding: "24px", maxWidth: "680px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  membersList: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden", marginBottom: "24px" },
  memberRow: { display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderBottom: "1px solid #f9f9f9" },
  memberAvatar: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", position: "relative" },
  memberPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  memberInitial: { fontSize: "15px", fontWeight: "700", color: "#666666" },
  memberName: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  memberRole: { fontSize: "12px", color: "#888888", margin: "0" },
  youTag: { fontSize: "11px", color: "#3182ce", fontWeight: "500" },
  youDot: { position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#38a169", border: "2px solid #ffffff" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "40px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center", marginBottom: "24px" },
  emptyText: { fontSize: "13px", color: "#cccccc", margin: "0" },
};