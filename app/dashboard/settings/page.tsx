"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useXeero } from "@/lib/context";
import { Settings, User, ExternalLink, AlertTriangle, Crown, Users, Check } from "lucide-react";
import AccountSettings from "@/components/dashboard/AccountSettings";
import VisibilityToggles from "@/components/dashboard/VisibilityToggles";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const TEAMS_FEATURES = [
  "Invite unlimited team members",
  "Role-based permissions per member",
  "Access to Xeero Services marketplace",
  "Priority support",
];

export default function SettingsPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useXeero();
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "success") {
      refreshProfile();
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, []);

  const isTeamsActive =
    profile?.plan_type === "teams" &&
    (!profile?.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  const handleUpgrade = async () => {
    if (!profile) return;
    setUpgrading(true);
    setUpgradeError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/initialize-teams-upgrade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ profile_id: profile.id, coupon_code: couponCode || undefined }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        setUpgradeError(data.error || "Something went wrong. Please try again.");
        setUpgrading(false);
        return;
      }

      if (data.free) {
        await refreshProfile();
        setShowUpgradeModal(false);
        setUpgrading(false);
        window.location.href = "/dashboard/settings?upgrade=success";
        return;
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: (await supabase.auth.getUser()).data.user?.email,
        amount: data.ngn_amount * 100,
        ref: data.reference,
        currency: "NGN",
        callback: () => {
          window.location.href = "/dashboard/settings?upgrade=success";
        },
        onClose: () => {
          setUpgrading(false);
        },
      });
      handler.openIframe();

    } catch {
      setUpgradeError("Something went wrong. Please try again.");
      setUpgrading(false);
    }
  };

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Settings size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Settings</h1>
          <p style={styles.headerSub}>Manage your account</p>
        </div>
      </div>

      <AccountSettings />
      <AccountSettings />
      <VisibilityToggles />

      {/* ── Billing / Xeero for Teams ── */}
      <p style={styles.sectionLabel}>Billing</p>
      {isTeamsActive ? (
        <div style={{ ...styles.card, ...styles.teamsActiveCard }}>
          <div style={styles.teamsActiveHeader}>
            <div style={styles.teamsActiveIcon}>
              <Crown size={18} color="#111111" />
            </div>
            <div>
              <p style={styles.teamsActiveTitle}>Xeero for Teams</p>
              <p style={styles.teamsActiveSub}>
                {profile?.plan_expires_at
                  ? `Renews ${new Date(profile.plan_expires_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`
                  : "Active"}
              </p>
            </div>
            <span style={styles.activeBadge}>Active</span>
          </div>
          <button style={styles.manageTeamBtn} onClick={() => router.push("/dashboard/team")}>
            <Users size={13} />
            Manage Team
          </button>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.teamsUpsellHeader}>
            <div style={styles.teamsUpsellIcon}>
              <Crown size={18} color="#111111" />
            </div>
            <div>
              <p style={styles.settingTitle}>Xeero for Teams</p>
              <p style={styles.settingValue}>Invite team members and unlock the Services marketplace</p>
            </div>
            <div style={styles.priceTag}>
              <span style={styles.priceAmount}>$29.99</span>
              <span style={styles.pricePeriod}>/year</span>
            </div>
          </div>

          <div style={styles.featuresList}>
            {TEAMS_FEATURES.map((feature) => (
              <div key={feature} style={styles.featureRow}>
                <Check size={13} color="#38a169" />
                <span style={styles.featureText}>{feature}</span>
              </div>
            ))}
          </div>

          <button style={styles.upgradeBtn} onClick={() => setShowUpgradeModal(true)}>
            Upgrade to Teams
          </button>
        </div>
      )}

      <p style={styles.sectionLabel}>Profile</p>
      <div style={styles.card}>
        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={styles.settingIcon}>
              <User size={15} color="#111111" />
            </div>
            <div>
              <p style={styles.settingTitle}>{profile?.startup_name || "Your startup"}</p>
              <p style={styles.settingValue}>
                {profile?.slug ? `xeero.me/${profile.slug}` : "No slug yet"}
              </p>
            </div>
          </div>
          <button style={styles.actionBtn} onClick={() => router.push("/dashboard/edit")}>
            <ExternalLink size={12} />
            Edit Profile
          </button>
        </div>
      </div>

      <p style={styles.sectionLabel}>Danger Zone</p>
      <div style={{ ...styles.card, ...styles.dangerCard }}>
        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={{ ...styles.settingIcon, backgroundColor: "#fff5f5" }}>
              <AlertTriangle size={15} color="#e53e3e" />
            </div>
            <div>
              <p style={{ ...styles.settingTitle, color: "#e53e3e" }}>Delete account</p>
              <p style={styles.settingValue}>
                To delete your account and all data, email us at{" "}
                <a href="mailto:hello@xeero.me" style={styles.dangerLink}>hello@xeero.me</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div style={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <Crown size={18} color="#111111" />
              <span style={styles.modalTitle}>Upgrade to Xeero for Teams</span>
            </div>

            <p style={styles.modalIntro}>You'll get:</p>
            <div style={styles.featuresList}>
              {TEAMS_FEATURES.map((feature) => (
                <div key={feature} style={styles.featureRow}>
                  <Check size={13} color="#38a169" />
                  <span style={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>

            <label style={styles.couponLabel}>Have a coupon code?</label>
            <input
              style={styles.couponInput}
              placeholder="Enter coupon code (optional)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />

            {upgradeError && <p style={styles.errorText}>{upgradeError}</p>}

            <div style={styles.modalActions}>
              <button style={styles.modalCancelBtn} onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </button>
              <button
                style={{ ...styles.upgradeBtn, opacity: upgrading ? 0.6 : 1 }}
                onClick={handleUpgrade}
                disabled={upgrading}
              >
                {upgrading ? "Processing..." : "Pay Now — $29.99/year"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "600px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px", marginBottom: "20px" },
  dangerCard: { border: "1px solid #fed7d7", backgroundColor: "#fff5f5", padding: "0" },
  settingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", gap: "12px", flexWrap: "wrap" },
  settingLeft: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
  settingIcon: { width: "34px", height: "34px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  settingTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  settingValue: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.5" },
  actionBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  dangerLink: { color: "#e53e3e", fontWeight: "500" },
  teamsUpsellHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  teamsUpsellIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  priceTag: { marginLeft: "auto", textAlign: "right", flexShrink: 0 },
  priceAmount: { fontSize: "20px", fontWeight: "700", color: "#111111" },
  pricePeriod: { fontSize: "12px", color: "#aaaaaa" },
  featuresList: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px", paddingLeft: "2px" },
  featureRow: { display: "flex", alignItems: "center", gap: "8px" },
  featureText: { fontSize: "13px", color: "#444444" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0 0 10px 0" },
  upgradeBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  teamsActiveCard: { backgroundColor: "#fffbf0", border: "1px solid #fef3c7" },
  teamsActiveHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  teamsActiveIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#ffffff", border: "1px solid #fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  teamsActiveTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  teamsActiveSub: { fontSize: "12px", color: "#a16207", margin: "0" },
  activeBadge: { marginLeft: "auto", fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "3px 10px", borderRadius: "99px", flexShrink: 0 },
  manageTeamBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "10px", fontSize: "13px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  modalHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
  modalTitle: { fontSize: "16px", fontWeight: "700", color: "#111111" },
  modalIntro: { fontSize: "12px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px 0" },
  couponLabel: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px" },
  couponInput: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111", marginBottom: "14px" },
  modalActions: { display: "flex", gap: "8px" },
  modalCancelBtn: { flex: 1, padding: "12px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "8px", cursor: "pointer" },
};