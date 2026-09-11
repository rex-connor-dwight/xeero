"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Mail,
  Zap,
  Sparkles,
  Crown,
  Trash2,
  Calendar,
  Cpu,
  Gift,
  Ticket,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];
const SIDEBAR_COLLAPSE_KEY = "xeero_crm_sidebar_collapsed";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  { label: "Overview", icon: <LayoutDashboard size={16} />, path: "/crm" },
  { label: "Applications", icon: <FileText size={16} />, path: "/crm/applications" },
  { label: "Users", icon: <Users size={16} />, path: "/crm/users" },
  { label: "Finance", icon: <DollarSign size={16} />, path: "/crm/finance" },
  { label: "Affiliates", icon: <Gift size={16} />, path: "/crm/affiliates" },
  { label: "Broadcast", icon: <Mail size={16} />, path: "/crm/broadcast" },
  { label: "Pordware", icon: <Cpu size={16} />, path: "/crm/pordware" },
  { label: "Advisory", icon: <Calendar size={16} />, path: "/crm/advisory" },
  { label: "Venture Room", icon: <Ticket size={16} />, path: "/crm/venture-room" },
  { label: "Roadmap", icon: <Sparkles size={16} />, path: "/crm/roadmap" },
  { label: "Services", icon: <Crown size={16} />, path: "/crm/services" },
  { label: "Deletions", icon: <Trash2 size={16} />, path: "/crm/deletions" },
];

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useXeero();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email || ""))) {
      router.push("/");
    }
  }, [loading, user]);

  const isActive = (path: string) => {
    if (path === "/crm") return pathname === "/crm";
    return pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    router.push(path);
    setMobileNavOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) return null;

  const currentPage = navItems.find((n) => isActive(n.path))?.label || "CRM";

  return (
    <div style={styles.root}>

      {/* ── Sidebar ── */}
      <div style={{ ...styles.sidebar, width: collapsed ? "72px" : "220px" }} className="desktop-only">
        <div style={styles.sidebarTop}>
          <div style={styles.brand}>
            <img src="/xeeroLogoBlack.png" alt="Xeero" style={styles.brandLogo} />
            {!collapsed && <span style={styles.brandText}>Xeero CRM</span>}
          </div>
          {!collapsed && <div style={styles.brandSub}>Internal admin</div>}

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
                <span style={{
                  ...styles.navIcon,
                  color: isActive(item.path) ? "#ffffff" : "rgba(255,255,255,0.3)",
                }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{
                      ...styles.navLabel,
                      color: isActive(item.path) ? "#ffffff" : "rgba(255,255,255,0.4)",
                      fontWeight: isActive(item.path) ? "600" : "400",
                    }}>
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <ChevronRight size={12} color="rgba(255,255,255,0.3)" style={{ marginLeft: "auto" }} />
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div style={styles.sidebarBottom}>
          {!collapsed && (
            <div style={styles.adminRow}>
              <div style={styles.adminAvatar}>
                <span style={styles.adminAvatarText}>
                  {profile?.founder_name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div style={styles.adminInfo}>
                <p style={styles.adminName}>{profile?.founder_name || "Admin"}</p>
                <p style={styles.adminEmail}>{user?.email}</p>
              </div>
            </div>
          )}
          <button style={styles.signOutBtn} onClick={handleSignOut} title={collapsed ? "Sign out" : undefined}>
            <LogOut size={14} />
            {!collapsed && "Sign out"}
          </button>
          <button style={styles.collapseBtn} onClick={toggleCollapsed} title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>

      {/* ── Mobile Top Bar ── */}
      <div style={styles.mobileBar} className="mobile-only">
        <div style={styles.mobileBrand}>
          <img src="/xeeroLogoBlack.png" alt="Xeero" style={styles.mobileBrandLogo} />
          <span style={styles.mobileBrandText}>Xeero CRM</span>
        </div>
        <button
          style={styles.mobileNavBtn}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <span style={styles.mobileNavBtnText}>{currentPage}</span>
          <ChevronRight size={14} color="rgba(255,255,255,0.5)" style={{ transform: mobileNavOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* ── Mobile Nav Dropdown ── */}
      {mobileNavOpen && (
        <div style={styles.mobileNav} className="mobile-only">
          {navItems.map((item) => (
            <button
              key={item.path}
              style={{
                ...styles.mobileNavItem,
                ...(isActive(item.path) ? styles.mobileNavItemActive : {}),
              }}
              onClick={() => handleNav(item.path)}
            >
              <span style={{ color: isActive(item.path) ? "#111111" : "#888888" }}>
                {item.icon}
              </span>
              <span style={{ fontSize: "14px", fontWeight: isActive(item.path) ? "600" : "400", color: isActive(item.path) ? "#111111" : "#888888" }}>
                {item.label}
              </span>
            </button>
          ))}
          <div style={styles.mobileNavDivider} />
          <button style={styles.mobileSignOut} onClick={handleSignOut}>
            <LogOut size={14} color="#e53e3e" />
            <span style={{ fontSize: "14px", color: "#e53e3e" }}>Sign out</span>
          </button>
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={styles.main}>
        {children}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  root: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  sidebar: { backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width 0.2s ease" },
  sidebarTop: { display: "flex", flexDirection: "column", gap: "20px" },
  brand: { display: "flex", alignItems: "center", gap: "8px" },
  brandLogo: { width: "18px", height: "18px", objectFit: "contain", flexShrink: 0 },
  brandText: { fontSize: "14px", fontWeight: "700", color: "#ffffff" },
  brandSub: { fontSize: "11px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" },
  nav: { display: "flex", flexDirection: "column", gap: "2px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" },
  navItemCollapsed: { justifyContent: "center", padding: "10px" },
  navItemActive: { backgroundColor: "rgba(255,255,255,0.08)" },
  navIcon: { display: "flex", alignItems: "center", flexShrink: 0 },
  navLabel: { fontSize: "13px" },
  sidebarBottom: { display: "flex", flexDirection: "column", gap: "8px" },
  adminRow: { display: "flex", alignItems: "center", gap: "10px", padding: "12px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "10px" },
  adminAvatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  adminAvatarText: { fontSize: "12px", fontWeight: "700", color: "#ffffff" },
  adminInfo: { flex: 1, overflow: "hidden" },
  adminName: { fontSize: "12px", fontWeight: "600", color: "#ffffff", margin: "0 0 1px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  adminEmail: { fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  signOutBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "9px 12px", fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.3)", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", cursor: "pointer", width: "100%" },
  collapseBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "9px 12px", fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.3)", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", cursor: "pointer", width: "100%" },
  mobileBar: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, backgroundColor: "#0a0a0a", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  mobileBrand: { display: "flex", alignItems: "center", gap: "8px" },
  mobileBrandLogo: { width: "18px", height: "18px", objectFit: "contain" },
  mobileBrandText: { fontSize: "14px", fontWeight: "700", color: "#ffffff" },
  mobileNavBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", cursor: "pointer" },
  mobileNavBtnText: { fontSize: "12px", fontWeight: "600", color: "#ffffff" },
  mobileNav: { position: "fixed", top: "48px", left: 0, right: 0, zIndex: 199, backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0", padding: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", maxHeight: "80vh", overflowY: "auto" },
  mobileNavItem: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" },
  mobileNavItemActive: { backgroundColor: "#f5f5f5" },
  mobileNavDivider: { height: "1px", backgroundColor: "#f5f5f5", margin: "4px 0" },
  mobileSignOut: { display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px 16px", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" },
  main: { flex: 1, minWidth: 0, overflowY: "auto", paddingTop: "0" },
};