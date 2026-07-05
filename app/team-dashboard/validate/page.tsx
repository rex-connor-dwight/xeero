"use client";
import { usePermission } from "@/lib/usePermission";
import ValidateView from "@/components/dashboard/ValidateView";

export default function TeamValidatePage() {
  const hasPermission = usePermission("validate");
  if (!hasPermission) return null;
  return <ValidateView />;
}