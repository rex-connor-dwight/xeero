"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useXeero } from "@/lib/context";
import { LayoutDashboard, Users, Mail, FolderLock, LogOut, ChevronUp, Lightbulb, Rocket, Bell, Settings, Heart, FileText, Crown } from "lucide-react";

export default function TeamDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, teamProfile, founderProfile, loading, profileLoading, signOut } = useXeero();
  const [islandOpen, setIslandOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profileLoading && !user) router.push("/auth");
    if (!loading && !profileLoading && user && !teamProfile) router.push("/dashboard");
  }, [loading, profileLoading, user, teamProfile]);

  if (loading || profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (!teamProfile) return null;

  const permissions: string[] = teamProfile.permissions || [];

  const navItems = [
    { label: "Home", icon: <LayoutDashboard size={18} />, path: "/team-dashboard", always: true },
    { label: "Waitlist", icon: <Mail size={18} />, path: "/team-dashboard/waitlist", permission: "waitlist_email" },
    { label: "Validate", icon: <Lightbulb size={18} />, path: "/team-dashboard/validate", permission: "validate" },
    { label: "Pitch Deck", icon: <FileText size={18} />, path: "/team-dashboard/deck", permission: "deck_upload" },
    { label: "Team", icon: <Users size={18} />, path: "/team-dashboard/team", always: true },
    { label: "Funding", icon: <Rocket size={18} />, path: "/team-dashboard/funding", permission: "funding" },
    { label: "Notifications", icon: <Bell size={18} />, path: "/team-dashboard/notifications", always: true },
    { label: "Supporters", icon: <Heart size={18} />, path: "/team-dashboard/supporters", permission: "view_stats" },
    { label: "Services", icon: <Crown size={18} />, path: "/team-dashboard/services", always: true },
  ].filter((item) => item.always || permissions.includes(item.permission || ""));

  const isActive = (path: string) => {
    if (path === "/team-dashboard") return pathname === "/team-dashboard";
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <div style={styles.root}>

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.topBarLogo}><div style={styles.topBarLogoInner} /></div>
          <span style={styles.topBarBrand}>Xeero</span>
          <span style={styles.topBarSep}>·</span>
          <span style={styles.topBarStartup}>{founderProfile?.startup_name}</span>
        </div>
        <div style={styles.topBarRight}>
          <div style={styles.topBarRole}>{teamProfile.role}</div>
          <div style={{ position: "relative" }}>
            <button
              style={styles.topBarAvatar}
              onClick={() => setAvatarOpen(!avatarOpen)}
            >
              <span style={styles.topBarAvatarText}>
                {teamProfile.name?.[0]?.toUpperCase() || "T"}
              </span>
            </button>
            {avatarOpen && (
              <div style={styles.avatarDropdown}>
                <button
                  style={styles.avatarDropdownItem}
                  onClick={() => { router.push("/team-dashboard/settings"); setAvatarOpen(false); }}
                >
                  <Settings size={14} color="#666666" />
                  Settings
                </button>
                <div style={styles.avatarDropdownDivider} />
                <button
                  style={{ ...styles.avatarDropdownItem, color: "#e53e3e" }}
                  onClick={handleSignOut}
                >
                  <LogOut size={14} color="#e53e3e" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.body}>

        {/* Sidebar */}
        <div style={styles.sidebar} className="desktop-only">
          <div style={styles.sidebarTop}>
            <div style={styles.sidebarStartup}>
              <div style={styles.sidebarDot} />
              <span style={styles.sidebarStartupName}>{founderProfile?.startup_name}</span>
            </div>
            <nav style={styles.nav}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  style={{ ...styles.navItem, ...(isActive(item.path) ? styles.navItemActive : {}) }}
                  onClick={() => router.push(item.path)}
                >
                  <span style={{ ...styles.navIcon, color: isActive(item.path) ? "#111111" : "#aaaaaa" }}>
                    {item.icon}
                  </span>
                  <span style={{ ...styles.navLabel, color: isActive(item.path) ? "#111111" : "#888888", fontWeight: isActive(item.path) ? "600" : "400" }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          <div style={styles.sidebarBottom}>
            <div style={styles.memberInfo}>
              <p style={styles.memberName}>{teamProfile.name}</p>
              <p style={styles.memberRole}>{teamProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={styles.main}>{children}</div>
      </div>

      {/* Mobile island */}
      <div style={styles.island} className="mobile-only">
        <div style={{ ...styles.islandPill, ...(islandOpen ? styles.islandPillOpen : {}) }}>
          {!islandOpen ? (
            <div style={styles.islandCollapsed} onClick={() => setIslandOpen(true)}>
              <div style={styles.islandDot} />
              <span style={styles.islandLabel}>
                {navItems.find((n) => isActive(n.path))?.label || "Home"}
              </span>
              <ChevronUp size={14} color="rgba(255,255,255,0.6)" />
            </div>
          ) : (
            <div style={styles.islandExpanded}>
              <div style={styles.islandExpandedHeader}>
                <span style={styles.islandExpandedTitle}>Navigate</span>
                <button style={styles.islandCloseBtn} onClick={() => setIslandOpen(false)}>✕</button>
              </div>
              <div style={styles.islandGrid}>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    style={{ ...styles.islandTile, ...(isActive(item.path) ? styles.islandTileActive : {}) }}
                    onClick={() => { router.push(item.path); setIslandOpen(false); }}
                  >
                    <span style={{ color: isActive(item.path) ? "#ffffff" : "rgba(255,255,255,0.6)" }}>{item.icon}</span>
                    <span style={{ ...styles.islandTileLabel, color: isActive(item.path) ? "#ffffff" : "rgba(255,255,255,0.6)" }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  root: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  topBar: { backgroundColor: "#111111", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, flexShrink: 0 },
  topBarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  topBarLogo: { width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" },
  topBarLogoInner: { width: "13px", height: "13px", borderRadius: "50%", backgroundColor: "#ffffff" },
  topBarBrand: { fontSize: "16px", fontWeight: "700", color: "#ffffff" },
  topBarSep: { color: "rgba(255,255,255,0.3)", fontSize: "16px" },
  topBarStartup: { fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.6)" },
  topBarRight: { display: "flex", alignItems: "center", gap: "10px" },
  topBarRole: { fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.06em" },
  topBarAvatar: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" },
  topBarAvatarText: { fontSize: "13px", fontWeight: "700", color: "#ffffff" },
  body: { display: "flex", flex: 1 },
  sidebar: { width: "220px", backgroundColor: "#ffffff", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 12px", position: "sticky", top: "50px", height: "calc(100vh - 50px)", flexShrink: 0 },
  sidebarTop: { display: "flex", flexDirection: "column", gap: "8px" },
  sidebarStartup: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", marginBottom: "8px" },
  sidebarDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#111111", flexShrink: 0 },
  sidebarStartupName: { fontSize: "13px", fontWeight: "600", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  nav: { display: "flex", flexDirection: "column", gap: "2px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", backgroundColor: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" },
  navItemActive: { backgroundColor: "#f5f5f5" },
  navIcon: { display: "flex", alignItems: "center", flexShrink: 0 },
  navLabel: { fontSize: "13px" },
  sidebarBottom: { display: "flex", flexDirection: "column", gap: "2px", borderTop: "1px solid #f5f5f5", paddingTop: "12px" },
  memberInfo: { padding: "8px 12px" },
  memberName: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  memberRole: { fontSize: "11px", color: "#888888", margin: "0" },
  main: { flex: 1, minWidth: 0, overflowY: "auto" },
  island: { position: "fixed", top: "62px", left: "50%", transform: "translateX(-50%)", zIndex: 150, pointerEvents: "none" },
  islandPill: { backgroundColor: "#111111", borderRadius: "99px", padding: "10px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", minWidth: "160px", transition: "all 0.2s ease", pointerEvents: "auto" },
  islandPillOpen: { borderRadius: "20px", padding: "16px", minWidth: "280px" },
  islandCollapsed: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", justifyContent: "center" },
  islandDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff" },
  islandLabel: { fontSize: "13px", fontWeight: "600", color: "#ffffff" },
  islandExpanded: { display: "flex", flexDirection: "column", gap: "12px" },
  islandExpandedHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  islandExpandedTitle: { fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" },
  islandCloseBtn: { fontSize: "12px", color: "rgba(255,255,255,0.4)", backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "2px 6px" },
  islandGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" },
  islandTile: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 8px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" },
  islandTileActive: { backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" },
  islandTileLabel: { fontSize: "10px", fontWeight: "500", textAlign: "center" },
  avatarDropdown: { position: "absolute", top: "calc(100% + 8px)", right: 0, backgroundColor: "#ffffff", borderRadius: "12px", padding: "6px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0", minWidth: "160px", zIndex: 300 },
  avatarDropdownItem: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "9px 12px", fontSize: "13px", fontWeight: "500", color: "#333333", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", textAlign: "left" },
  avatarDropdownDivider: { height: "1px", backgroundColor: "#f5f5f5", margin: "4px 0" },
};