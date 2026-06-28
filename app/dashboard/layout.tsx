"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  LayoutDashboard,
  User,
  Users,
  Bell,
  Settings,
  Plus,
  ChevronUp,
  Lightbulb,
  FolderLock,
  Heart,
  Rocket,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
};

// ── Nav Items ──────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  { label: "My Profile", icon: <User size={18} />, path: "/dashboard/edit" },
  { label: "Waitlist", icon: <Users size={18} />, path: "/dashboard/waitlist" },
  { label: "Validate", icon: <Lightbulb size={18} />, path: "/dashboard/validate" },
  { label: "Data Room", icon: <FolderLock size={18} />, path: "/dashboard/dataroom" },
  { label: "Notifications", icon: <Bell size={18} />, path: "/dashboard/notifications" },
  { label: "Supporters", icon: <Heart size={18} />, path: "/dashboard/supporters" },
  { label: "Funding", icon: <Rocket size={18} />, path: "/dashboard/funding" },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useXeero();
  const [islandOpen, setIslandOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user]);

  const handleNav = (path: string) => {
    router.push(path);
    setIslandOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={styles.root}>

      {/* ── Desktop Top Bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.topBarLogo}>
            <div style={styles.topBarLogoInner} />
          </div>
          <span style={styles.topBarBrand}>Xeero</span>
        </div>
        <div style={styles.topBarRight}>
          <button
            style={styles.topBarBtn}
            onClick={() => alert("Coming soon — Add another startup")}
          >
            <Plus size={13} />
            Add Startup
          </button>
          <button
            style={styles.topBarIconBtn}
            onClick={() => router.push("/dashboard/notifications")}
          >
            <Bell size={16} color="rgba(255,255,255,0.7)" />
          </button>
          <div style={styles.topBarAvatar}>
            <span style={styles.topBarAvatarText}>
              {profile?.founder_name?.[0]?.toUpperCase() || "F"}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.body}>

        {/* ── Desktop Sidebar ── */}
        <div style={styles.sidebar} className="desktop-only">
          <div style={styles.sidebarTop}>
            <div style={styles.sidebarStartup}>
              <div style={styles.sidebarStartupDot} />
              <span style={styles.sidebarStartupName}>
                {profile?.startup_name || "Xeero"}
              </span>
            </div>
            <nav style={styles.nav}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {}),
                  }}
                  onClick={() => handleNav(item.path)}
                >
                  <span style={{
                    ...styles.navIcon,
                    color: isActive(item.path) ? "#111111" : "#aaaaaa",
                  }}>
                    {item.icon}
                  </span>
                  <span style={{
                    ...styles.navLabel,
                    color: isActive(item.path) ? "#111111" : "#888888",
                    fontWeight: isActive(item.path) ? "600" : "400",
                  }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div style={styles.sidebarBottom}>
            <button
              style={styles.navItem}
              onClick={() => router.push("/dashboard/settings")}
            >
              <span style={styles.navIcon}>
                <Settings size={18} color="#aaaaaa" />
              </span>
              <span style={styles.navLabel}>Settings</span>
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
        <div style={{
          ...styles.islandPill,
          ...(islandOpen ? styles.islandPillOpen : {}),
        }}>
          {!islandOpen ? (
            <div style={styles.islandCollapsed} onClick={() => setIslandOpen(true)}>
              <div style={styles.islandDot} />
              <span style={styles.islandLabel}>
                {navItems.find((n) => isActive(n.path))?.label || "Dashboard"}
              </span>
              <ChevronUp size={14} color="rgba(255,255,255,0.6)" />
            </div>
          ) : (
            <div style={styles.islandExpanded}>
              <div style={styles.islandExpandedHeader}>
                <span style={styles.islandExpandedTitle}>Navigate</span>
                <button
                  style={styles.islandCloseBtn}
                  onClick={() => setIslandOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div style={styles.islandGrid}>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    style={{
                      ...styles.islandTile,
                      ...(isActive(item.path) ? styles.islandTileActive : {}),
                    }}
                    onClick={() => handleNav(item.path)}
                  >
                    <span style={{
                      color: isActive(item.path)
                        ? "#ffffff"
                        : "rgba(255,255,255,0.6)",
                    }}>
                      {item.icon}
                    </span>
                    <span style={{
                      ...styles.islandTileLabel,
                      color: isActive(item.path)
                        ? "#ffffff"
                        : "rgba(255,255,255,0.6)",
                    }}>
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

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  root: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  topBar: { backgroundColor: "#111111", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, flexShrink: 0 },
  topBarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  topBarLogo: { width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" },
  topBarLogoInner: { width: "13px", height: "13px", borderRadius: "50%", backgroundColor: "#ffffff" },
  topBarBrand: { fontSize: "16px", fontWeight: "700", color: "#ffffff" },
  topBarRight: { display: "flex", alignItems: "center", gap: "10px" },
  topBarBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.8)", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer" },
  topBarIconBtn: { width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  topBarAvatar: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" },
  topBarAvatarText: { fontSize: "13px", fontWeight: "700", color: "#ffffff" },
  body: { display: "flex", flex: 1 },
  sidebar: { width: "220px", backgroundColor: "#ffffff", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px 12px", position: "sticky", top: "50px", height: "calc(100vh - 50px)", flexShrink: 0 },
  sidebarTop: { display: "flex", flexDirection: "column", gap: "8px" },
  sidebarStartup: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", marginBottom: "8px" },
  sidebarStartupDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#111111", flexShrink: 0 },
  sidebarStartupName: { fontSize: "13px", fontWeight: "600", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  nav: { display: "flex", flexDirection: "column", gap: "2px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", backgroundColor: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background-color 0.15s ease" },
  navItemActive: { backgroundColor: "#f5f5f5" },
  navIcon: { display: "flex", alignItems: "center", flexShrink: 0 },
  navLabel: { fontSize: "13px", color: "#888888" },
  sidebarBottom: { display: "flex", flexDirection: "column", gap: "2px", borderTop: "1px solid #f5f5f5", paddingTop: "12px" },
  main: { flex: 1, minWidth: 0, overflowY: "auto" },
  island: { position: "fixed", top: "62px", left: "50%", transform: "translateX(-50%)", zIndex: 150, pointerEvents: "none" },
  islandPill: { backgroundColor: "#111111", borderRadius: "99px", padding: "10px 18px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", minWidth: "160px", transition: "all 0.2s ease", pointerEvents: "auto" },
  islandPillOpen: { borderRadius: "20px", padding: "16px", minWidth: "300px" },
  islandCollapsed: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", justifyContent: "center" },
  islandDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ffffff" },
  islandLabel: { fontSize: "13px", fontWeight: "600", color: "#ffffff" },
  islandExpanded: { display: "flex", flexDirection: "column", gap: "12px" },
  islandExpandedHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  islandExpandedTitle: { fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" },
  islandCloseBtn: { fontSize: "12px", color: "rgba(255,255,255,0.4)", backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "2px 6px" },
  islandGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" },
  islandTile: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 8px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" },
  islandTileActive: { backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" },
  islandTileLabel: { fontSize: "10px", fontWeight: "500", textAlign: "center" },
};