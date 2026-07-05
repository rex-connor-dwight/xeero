"use client";
import { usePermission } from "@/lib/usePermission";
import FundingView from "@/components/dashboard/FundingView";

export default function TeamFundingPage() {
  const hasPermission = usePermission("funding");
  if (!hasPermission) return null;
  return <FundingView />;
}