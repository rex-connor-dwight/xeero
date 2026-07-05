"use client";

import { useXeero } from "@/lib/context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function usePermission(permission: string) {
  const { teamProfile, isTeamMember, loading, profileLoading } = useXeero();
  const router = useRouter();

  const hasPermission = !isTeamMember || (teamProfile?.permissions || []).includes(permission);

  useEffect(() => {
    if (!loading && !profileLoading && isTeamMember && !hasPermission) {
      router.push("/team-dashboard");
    }
  }, [loading, profileLoading, isTeamMember, hasPermission]);

  return hasPermission;
}