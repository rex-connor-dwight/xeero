"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Lock, LogOut, Mail, CheckCircle } from "lucide-react";

export default function AccountSettings() {
  const router = useRouter();
  const { user, signOut } = useXeero();
  const [passwordSent, setPasswordSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setPasswordLoading(true);
    setPasswordError("");
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      setPasswordError("Something went wrong. Please try again.");
    } else {
      setPasswordSent(true);
    }
    setPasswordLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <>
      <p style={styles.sectionLabel}>Account</p>
      <div style={styles.card}>

        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={styles.settingIcon}>
              <Mail size={15} color="#111111" />
            </div>
            <div>
              <p style={styles.settingTitle}>Email address</p>
              <p style={styles.settingValue}>{user?.email || "—"}</p>
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={styles.settingIcon}>
              <Lock size={15} color="#111111" />
            </div>
            <div>
              <p style={styles.settingTitle}>Password</p>
              <p style={styles.settingValue}>
                Send a password reset link to your email
              </p>
            </div>
          </div>
          {passwordSent ? (
            <div style={styles.sentBadge}>
              <CheckCircle size={13} color="#38a169" />
              <span style={styles.sentText}>Sent</span>
            </div>
          ) : (
            <button
              style={styles.actionBtn}
              onClick={handlePasswordReset}
              disabled={passwordLoading}
            >
              {passwordLoading ? "Sending..." : "Reset Password"}
            </button>
          )}
        </div>
        {passwordError && <p style={styles.errorText}>{passwordError}</p>}

      </div>

      <p style={styles.sectionLabel}>Session</p>
      <div style={styles.card}>
        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={styles.settingIcon}>
              <LogOut size={15} color="#111111" />
            </div>
            <div>
              <p style={styles.settingTitle}>Sign out</p>
              <p style={styles.settingValue}>
                Sign out of your Xeero account on this device
              </p>
            </div>
          </div>
          {!confirmSignOut ? (
            <button style={styles.signOutBtn} onClick={() => setConfirmSignOut(true)}>
              Sign Out
            </button>
          ) : (
            <div style={styles.confirmRow}>
              <span style={styles.confirmText}>Are you sure?</span>
              <button style={styles.confirmYesBtn} onClick={handleSignOut}>
                Yes, sign out
              </button>
              <button style={styles.confirmNoBtn} onClick={() => setConfirmSignOut(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "20px" },
  settingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", gap: "12px", flexWrap: "wrap" },
  settingLeft: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
  settingIcon: { width: "34px", height: "34px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  settingTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  settingValue: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.5" },
  divider: { height: "1px", backgroundColor: "#f5f5f5", margin: "0 18px" },
  actionBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  signOutBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#e53e3e", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  sentBadge: { display: "flex", alignItems: "center", gap: "5px" },
  sentText: { fontSize: "12px", color: "#38a169", fontWeight: "500" },
  errorText: { fontSize: "12px", color: "#e53e3e", padding: "0 18px 12px 18px", margin: "0" },
  confirmRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" },
  confirmText: { fontSize: "12px", color: "#888888", fontWeight: "500" },
  confirmYesBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#e53e3e", border: "none", borderRadius: "8px", cursor: "pointer" },
  confirmNoBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
};