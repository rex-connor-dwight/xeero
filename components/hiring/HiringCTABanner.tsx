"use client";

import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Briefcase, ArrowRight } from "lucide-react";

export default function HiringCTABanner() {
  const router = useRouter();
  const { user, profile } = useXeero();

  const handleClick = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (!profile?.is_live) {
      router.push("/payment");
      return;
    }
    router.push("/dashboard/hiring");
  };

  return (
    <button style={styles.banner} onClick={handleClick}>
      <div style={styles.left}>
        <Briefcase size={16} color="#ffffff" />
        <span style={styles.text}>Hiring for your own startup? List a role here.</span>
      </div>
      <ArrowRight size={14} color="#ffffff" />
    </button>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  banner: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: "700px", margin: "0 auto 24px auto", padding: "13px 20px", backgroundColor: "#111111", border: "none", borderRadius: "12px", cursor: "pointer" },
  left: { display: "flex", alignItems: "center", gap: "10px" },
  text: { fontSize: "13px", fontWeight: "500", color: "#ffffff" },
};