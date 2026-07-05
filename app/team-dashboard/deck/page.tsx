"use client";
import { usePermission } from "@/lib/usePermission";
import DeckUploadView from "@/components/dashboard/DeckUploadView";

export default function TeamDeckPage() {
  const hasPermission = usePermission("deck_upload");
  if (!hasPermission) return null;
  return <DeckUploadView />;
}