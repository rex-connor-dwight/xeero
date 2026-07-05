"use client";
import { usePermission } from "@/lib/usePermission";
import WaitlistView from "@/components/dashboard/WaitlistView";

export default function TeamWaitlistPage() {
  const hasPermission = usePermission("waitlist_email");
  if (!hasPermission) return null;
  return <WaitlistView />;
}