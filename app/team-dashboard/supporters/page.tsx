"use client";
import { usePermission } from "@/lib/usePermission";
import SupportersView from "@/components/dashboard/SupportersView";

export default function TeamSupportersPage() {
  const hasPermission = usePermission("view_stats");
  if (!hasPermission) return null;
  return <SupportersView />;
}