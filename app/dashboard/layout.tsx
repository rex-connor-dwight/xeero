"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import {
  LayoutDashboard, User, Users, Bell, Plus, Lightbulb,
  FolderLock, Heart, Rocket, Crown,
} from "lucide-react";
import DashboardShell, { type ShellNavItem } from "@/components/dashboard/shell/DashboardShell";

const navItems: ShellNavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  { label: "My Profile", icon: <User size={18} />, path: "/dashboard/edit" },
  { label: "Team", icon: <Users size={18} />, path: "/dashboard/team" },
  { label: "Waitlist", icon: <Users size={18} />, path: "/dashboard/waitlist" },
  { label: "Validate", icon: <Lightbulb size={18} />, path: "/dashboard/validate" },
  { label: "Data Room", icon: <FolderLock size={18} />, path: "/dashboard/dataroom" },
  { label: "Notifications", icon: <Bell size={18} />, path: "/dashboard/notifications" },
  { label: "Supporters", icon: <Heart size={18} />, path: "/dashboard/supporters" },
  { label: "Funding", icon: <Rocket size={18} />, path: "/dashboard/funding" },
  { label: "Services", icon: <Crown size={18} />, path: "/dashboard/services" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading, signOut, isTeamMember } = useXeero();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }
    if (!loading && user && isTeamMember) {
      router.push("/team-dashboard");
    }
  }, [loading, user, isTeamMember]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("profile_id", profile.id)
      .eq("read", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" }} />
      </div>
    );
  }

  if (!user || isTeamMember) return null;

  return (
    <DashboardShell
      navItems={navItems}
      sidebarLabel={profile?.startup_name || "Xeero"}
      sidebarLogoUrl={profile?.logo_url}
      onSignOut={handleSignOut}
      onSettingsClick={() => router.push("/dashboard/settings")}
      topBarRight={
        <>
          <button
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.8)", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer" }}
            onClick={() => alert("Coming soon — Add another startup")}
          >
            <Plus size={13} />
            Add Startup
          </button>
          <button
            style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
            onClick={() => { router.push("/dashboard/notifications"); setUnreadCount(0); }}
          >
            <Bell size={16} color="rgba(255,255,255,0.7)" />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px", width: "16px", height: "16px",
                borderRadius: "50%", backgroundColor: "#e53e3e", fontSize: "9px", fontWeight: "700",
                color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #111111",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}