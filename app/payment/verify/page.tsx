"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useXeero } from "@/lib/context";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useXeero();

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      router.push("/dashboard");
      return;
    }
    // Give webhook time to fire then refresh
    setTimeout(async () => {
      await refreshProfile();
      router.push("/dashboard?payment=success");
    }, 3000);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      gap: "12px",
    }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" }} />
      <p style={{ fontSize: "14px", color: "#888888", margin: "0" }}>
        Activating your profile...
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" }} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}