"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  LayoutDashboard, Users, Mail, FileText, Rocket, Bell, Heart, Crown, Lightbulb,
} from "lucide-react";
import DashboardShell, { type ShellNavItem } from "@/components/dashboard/shell/DashboardShell";

export default function TeamDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, teamProfile, founderProfile, loading, profileLoading, signOut } = useXeero();

  useEffect(() => {
    if (!loading && !profileLoading && !user) router.push("/auth");
    if (!loading && !profileLoading && user && !teamProfile) router.push("/dashboard");
  }, [loading, profileLoading, user, teamProfile]);

  if (loading || profileLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" }} />
      </div>
    );
  }

  if (!teamProfile) return null;

  const permissions: string[] = teamProfile.permissions || [];

  const navItems: ShellNavItem[] = [
    { label: "Home", icon: <LayoutDashboard size={18} />, path: "/team-dashboard" },
    ...(permissions.includes("waitlist_email") ? [{ label: "Waitlist", icon: <Mail size={18} />, path: "/team-dashboard/waitlist" }] : []),
    ...(permissions.includes("validate") ? [{ label: "Validate", icon: <Lightbulb size={18} />, path: "/team-dashboard/validate" }] : []),
    ...(permissions.includes("deck_upload") ? [{ label: "Pitch Deck", icon: <FileText size={18} />, path: "/team-dashboard/deck" }] : []),
    { label: "Team", icon: <Users size={18} />, path: "/team-dashboard/team" },
    ...(permissions.includes("funding") ? [{ label: "Funding", icon: <Rocket size={18} />, path: "/team-dashboard/funding" }] : []),
    { label: "Notifications", icon: <Bell size={18} />, path: "/team-dashboard/notifications" },
    ...(permissions.includes("view_stats") ? [{ label: "Supporters", icon: <Heart size={18} />, path: "/team-dashboard/supporters" }] : []),
    { label: "Services", icon: <Crown size={18} />, path: "/team-dashboard/services" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <DashboardShell
      navItems={navItems}
      sidebarLabel={founderProfile?.startup_name || "Xeero"}
      sidebarLogoUrl={founderProfile?.logo_url}
      onSignOut={handleSignOut}
      onSettingsClick={() => router.push("/team-dashboard/settings")}
      sidebarFooter={
        <div style={{ padding: "8px 12px", borderTop: "1px solid #f5f5f5", paddingTop: "12px" }}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" }}>{teamProfile.name}</p>
          <p style={{ fontSize: "11px", color: "#888888", margin: "0" }}>{teamProfile.role}</p>
        </div>
      }
      topBarRight={
        <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {teamProfile.role}
        </div>
      }
    >
      {children}
    </DashboardShell>
  );
}