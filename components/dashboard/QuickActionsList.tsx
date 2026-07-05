"use client";

import { useRouter } from "next/navigation";
import { Eye, FileText, Lightbulb, ArrowRight } from "lucide-react";

type Action = {
  key: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  path: string;
  permission?: string;
};

export default function QuickActionsList({
  isLive,
  isTeamMember,
  permissions,
}: {
  isLive: boolean;
  isTeamMember: boolean;
  permissions: string[];
}) {
  const router = useRouter();
  const base = isTeamMember ? "/team-dashboard" : "/dashboard";

  const allActions: Action[] = [
    { key: "preview", icon: <Eye size={16} color="#111111" />, title: "View Preview", sub: "See the public profile", path: "/preview" },
    { key: "deck", icon: <FileText size={16} color="#111111" />, title: "Pitch Deck", sub: "Upload or manage the deck", path: isTeamMember ? "/team-dashboard/deck" : "/dashboard/edit", permission: "deck_upload" },
    { key: "validate", icon: <Lightbulb size={16} color="#111111" />, title: "Validate Idea", sub: "Run a quick validation check", path: `${base}/validate`, permission: "validate" },
    {
      key: "funding",
      icon: <Lightbulb size={16} color="#111111" />,
      title: "Apply for Funding",
      sub: isLive ? "Submit for investor review" : "Publish the profile first",
      path: `${base}/funding`,
      permission: "funding",
    },
  ];

  const actions = allActions.filter((a) => {
    if (isTeamMember && a.permission && !permissions.includes(a.permission)) return false;
    return true;
  });

  const handleClick = (action: Action) => {
    if (action.key === "funding" && !isLive) {
      alert(isTeamMember ? "The profile needs to be published first." : "Publish your profile first to apply for funding.");
      return;
    }
    router.push(action.path);
  };

  return (
    <>
      <p style={styles.sectionLabel}>Quick Actions</p>
      <div style={styles.actionsCard}>
        {actions.map((action, i) => (
          <div key={action.key}>
            <button style={styles.actionRow} onClick={() => handleClick(action)}>
              <div style={styles.actionLeft}>
                <div style={styles.actionIcon}>{action.icon}</div>
                <div>
                  <p style={styles.actionTitle}>{action.title}</p>
                  <p style={styles.actionSub}>{action.sub}</p>
                </div>
              </div>
              <ArrowRight size={14} color="#cccccc" />
            </button>
            {i < actions.length - 1 && <div style={styles.actionDivider} />}
          </div>
        ))}
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  actionsCard: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "24px" },
  actionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", backgroundColor: "#ffffff", border: "none", cursor: "pointer", width: "100%", textAlign: "left" },
  actionLeft: { display: "flex", alignItems: "center", gap: "12px" },
  actionIcon: { width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actionTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  actionSub: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  actionDivider: { height: "1px", backgroundColor: "#f5f5f5", margin: "0 18px" },
};