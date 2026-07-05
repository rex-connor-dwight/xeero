"use client";

import { useRouter } from "next/navigation";
import { Crown, X } from "lucide-react";

export default function UpgradeGateModal({
  featureName,
  onClose,
}: {
  featureName: string;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <X size={16} color="#888888" />
        </button>
        <div style={styles.icon}>
          <Crown size={24} color="#aaaaaa" />
        </div>
        <h2 style={styles.title}>{featureName} is a Xeero for Teams feature</h2>
        <p style={styles.text}>
          Upgrade to Xeero for Teams to unlock this and everything else that comes with it — team seats, permissions, and the Services marketplace.
        </p>
        <button style={styles.upgradeBtn} onClick={() => router.push("/dashboard/settings")}>
          Upgrade to Teams — $29.99/year
        </button>
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px 28px", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", position: "relative" },
  closeBtn: { position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", display: "flex" },
  icon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  title: { fontSize: "17px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  text: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0 0 20px 0" },
  upgradeBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
};