"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronUp, ChevronLeft, ChevronRight, LogOut, Settings } from "lucide-react";

export type ShellNavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
};

const SIDEBAR_COLLAPSE_KEY = "xeero_sidebar_collapsed";

function vibrate() {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
}

export default function DashboardShell({
  navItems,
  sidebarLabel,
  sidebarLogoUrl,
  sidebarFooter,
  topBarRight,
  onSignOut,
  onSettingsClick,
  children,
}: {
  navItems: ShellNavItem[];
  sidebarLabel: string;
  sidebarLogoUrl?: string | null;
  sidebarFooter?: React.ReactNode;
  topBarRight: React.ReactNode;
  onSignOut: () => void;
  onSettingsClick: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [islandOpen, setIslandOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
  };

  const isActive = (path: string) => {
    if (path === navItems[0]?.path) return pathname === path;
    return pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    vibrate();
    router.push(path);
    setIslandOpen(false);
  };

  return (
    <div style={styles.root}>

      {/* ── Top Bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <img src="/xeeroLogoBlack.png" alt="Xeero" style={styles.topBarLogo} />
          <span style={styles.topBarBrand}>Xeero</span>
        </div>
        <div style={styles.topBarRight}>
          {topBarRight}
          <div style={{ position: "relative" }}>
            <button
              style={styles.topBarAvatar}
              onClick={() => { vibrate(); setAvatarOpen(!avatarOpen); }}
            >
              <span style={styles.topBarAvatarText}>{sidebarLabel[0]?.toUpperCase() || "X"}</span>
            </button>
            {avatarOpen && (
              <div style={styles.avatarDropdown}>
                <button
                  style={styles.avatarDropdownItem}
                  onClick={() => { vibrate(); onSettingsClick(); setAvatarOpen(false); }}
                >
                  <Settings size={14} color="#666666" />
                  Settings
                </button>
                <div style={styles.avatarDropdownDivider} />
                <button
                  style={{ ...styles.avatarDropdownItem, color: "#e53e3e" }}
                  onClick={onSignOut}
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

        {/* ── Desktop Sidebar ── */}
        <div style={{ ...styles.sidebar, width: collapsed ? "72px" : "220px" }} className="desktop-only">
          <div style={styles.sidebarTop}>
            <div style={styles.sidebarStartup}>
              {sidebarLogoUrl ? (
                <img src={sidebarLogoUrl} alt="" style={styles.sidebarStartupLogo} />
              ) : (
                <div style={styles.sidebarStartupPlaceholder} />
              )}
              {!collapsed && <span style={styles.sidebarStartupName}>{sidebarLabel}</span>}
            </div>
            <nav style={styles.nav}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  style={{
                    ...styles.navItem,
                    ...(collapsed ? styles.navItemCollapsed : {}),
                    ...(isActive(item.path) ? styles.navItemActive : {}),
                  }}
                  onClick={() => handleNav(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <span style={{ ...styles.navIcon, color: isActive(item.path) ? "#111111" : "#aaaaaa" }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{
                      ...styles.navLabel,
                      color: isActive(item.path) ? "#111111" : "#888888",
                      fontWeight: isActive(item.path) ? "600" : "400",
                    }}>
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div style={styles.sidebarBottomWrap}>
            {!collapsed && sidebarFooter}
            <button style={styles.collapseBtn} onClick={toggleCollapsed} title={collapsed ? "Expand" : "Collapse"}>
              {collapsed ? <ChevronRight size={15} color="#888888" /> : <ChevronLeft size={15} color="#888888" />}
              {!collapsed && <span style={styles.collapseBtnLabel}>Collapse</span>}
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={styles.main} className="mobile-content-offset">
          {children}
        </div>

      </div>

      {/* ── Mobile Dynamic Island ── */}
      <div style={styles.island} className="mobile-only">
        <div style={{ ...styles.islandPill, ...(islandOpen ? styles.islandPillOpen : {}) }}>
          {!islandOpen ? (
            <div style={styles.islandCollapsed} onClick={() => { vibrate(); setIslandOpen(true); }}>
              <div style={styles.islandDot} />
              <span style={styles.islandLabel}>
                {navItems.find((n) => isActive(n.path))?.label || navItems[0]?.label}
              </span>
              <ChevronUp size={14} color="rgba(255,255,255,0.6)" />
            </div>
          ) : (
            <div style={styles.islandExpanded}>
              <div style={styles.islandExpandedHeader}>
                <span style={styles.islandExpandedTitle}>Navigate</span>
                <button style={styles.islandCloseBtn} onClick={() => { vibrate(); setIslandOpen(false); }}>✕</button>
              </div>
              <div style={styles.islandGrid}>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    style={{ ...styles.islandTile, ...(isActive(item.path) ? styles.islandTileActive : {}) }}
                    onClick={() => handleNav(item.path)}
                  >
                    <span style={{ color: isActive(item.path) ? "#ffffff" : "rgba(255,255,255,0.6)" }}>
                      {item.icon}
                    </span>
                    <span style={{ ...styles.islandTileLabel, color: isActive(item.path) ? "#ffffff" : "rgba(255,255,255,0.6)" }}>
                      {item.label}
                    </span>
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
  topBar: { backgroundColor: "#111111", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, flexShrink: 0 },
  topBarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  topBarLogo: { width: "22px", height: "22px", objectFit: "contain" },
  topBarBrand: { fontSize: "16px", fontWeight: "700", color: "#ffffff" },
  topBarRight: { display: "flex", alignItems: "center", gap: "10px" },
  topBarAvatar: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" },
  topBarAvatarText: { fontSize: "13px", fontWeight: "700", color: "#ffffff" },
  body: { display: "flex", flex: 1 },
  sidebar: { backgroundColor: "#ffffff", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 12px", position: "sticky", top: "50px", height: "calc(100vh - 50px)", flexShrink: 0, transition: "width 0.2s ease" },
  sidebarTop: { display: "flex", flexDirection: "column", gap: "8px" },
  sidebarStartup: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", marginBottom: "8px" },
  sidebarStartupLogo: { width: "22px", height: "22px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 },
  sidebarStartupPlaceholder: { width: "22px", height: "22px", borderRadius: "6px", border: "2px solid #e5e5e5", flexShrink: 0 },
  sidebarStartupName: { fontSize: "13px", fontWeight: "600", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  nav: { display: "flex", flexDirection: "column", gap: "2px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", backgroundColor: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background-color 0.15s ease" },
  navItemCollapsed: { justifyContent: "center", padding: "9px" },
  navItemActive: { backgroundColor: "#f5f5f5" },
  navIcon: { display: "flex", alignItems: "center", flexShrink: 0 },
  navLabel: { fontSize: "13px" },
  sidebarBottomWrap: { display: "flex", flexDirection: "column", gap: "8px" },
  collapseBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", backgroundColor: "transparent", border: "1px solid #f0f0f0", cursor: "pointer", justifyContent: "center" },
  collapseBtnLabel: { fontSize: "12px", color: "#888888", fontWeight: "500" },
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