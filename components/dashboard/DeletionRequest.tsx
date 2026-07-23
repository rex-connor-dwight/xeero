"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { AlertTriangle, X, Clock } from "lucide-react";

export default function DeletionRequest() {
  const { profile } = useXeero();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingRequest, setPendingRequest] = useState<{ id: string; scheduled_for: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("account_deletion_requests")
      .select("id, scheduled_for")
      .eq("profile_id", profile.id)
      .eq("status", "pending")
      .single()
      .then(({ data }) => {
        setPendingRequest(data || null);
        setChecking(false);
      });
  }, [profile]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/request-account-deletion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ reason: reason || null }),
        }
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setPendingRequest({ id: "pending", scheduled_for: data.scheduled_for });
      setShowModal(false);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const handleCancel = async () => {
    if (!pendingRequest || !profile) return;
    setCancelling(true);
    await supabase
      .from("account_deletion_requests")
      .update({ status: "cancelled" })
      .eq("profile_id", profile.id)
      .eq("status", "pending");
    setPendingRequest(null);
    setCancelling(false);
  };

  if (checking) return null;

  if (pendingRequest) {
    return (
      <div style={{ ...styles.card, ...styles.pendingCard }}>
        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={{ ...styles.settingIcon, backgroundColor: "#fffbeb" }}>
              <Clock size={15} color="#d69e2e" />
            </div>
            <div>
              <p style={{ ...styles.settingTitle, color: "#92610a" }}>Account deletion scheduled</p>
              <p style={styles.settingValue}>
                Your account and all data will be permanently deleted on{" "}
                {new Date(pendingRequest.scheduled_for).toLocaleDateString("en-US", {
                  day: "numeric", month: "long", year: "numeric",
                })}. You can cancel this anytime before then.
              </p>
            </div>
          </div>
          <button style={styles.cancelBtn} onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Request"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ ...styles.card, ...styles.dangerCard }}>
        <div style={styles.settingRow}>
          <div style={styles.settingLeft}>
            <div style={{ ...styles.settingIcon, backgroundColor: "#fff5f5" }}>
              <AlertTriangle size={15} color="#e53e3e" />
            </div>
            <div>
              <p style={{ ...styles.settingTitle, color: "#e53e3e" }}>Delete account</p>
              <p style={styles.settingValue}>
                Request permanent deletion of your account and all associated data.
              </p>
            </div>
          </div>
          <button style={styles.deleteBtn} onClick={() => setShowModal(true)}>
            Request Deletion
          </button>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalCloseBtn} onClick={() => setShowModal(false)}>
              <X size={16} color="#888888" />
            </button>
            <div style={styles.modalIcon}>
              <AlertTriangle size={24} color="#e53e3e" />
            </div>
            <h2 style={styles.modalTitle}>Delete your account?</h2>
            <p style={styles.modalText}>
              This will permanently delete your profile, waitlist, data room, team members, and every
              record tied to your account. This cannot be undone once processed.
            </p>
            <p style={styles.modalText}>
              Your account will be deleted in <strong>30 days</strong>. Until then, you can log back in
              and cancel this request anytime.
            </p>

            <label style={styles.label}>Why are you leaving? (optional)</label>
            <textarea
              style={styles.textarea}
              placeholder="Helps us improve Xeero for other founders"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {error && <p style={styles.errorText}>{error}</p>}

            <div style={styles.modalActions}>
              <button style={styles.modalCancelBtn} onClick={() => setShowModal(false)}>
                Keep my account
              </button>
              <button
                style={{ ...styles.confirmDeleteBtn, opacity: submitting ? 0.6 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Confirm Deletion Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  dangerCard: { border: "1px solid #fed7d7", backgroundColor: "#fff5f5" },
  pendingCard: { border: "1px solid #fef08a", backgroundColor: "#fffbeb" },
  settingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", gap: "12px", flexWrap: "wrap" },
  settingLeft: { display: "flex", alignItems: "center", gap: "12px", flex: 1 },
  settingIcon: { width: "34px", height: "34px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  settingTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  settingValue: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.5" },
  deleteBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#e53e3e", backgroundColor: "#ffffff", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  cancelBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "600", color: "#92610a", backgroundColor: "#ffffff", border: "1px solid #fef08a", borderRadius: "8px", cursor: "pointer", flexShrink: 0 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px 28px", maxWidth: "420px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", position: "relative" },
  modalCloseBtn: { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", display: "flex" },
  modalIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#fff5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  modalTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 12px 0", textAlign: "center" },
  modalText: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0 0 14px 0" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit", color: "#111111", marginBottom: "16px" },
  errorText: { fontSize: "12px", color: "#e53e3e", margin: "0 0 12px 0" },
  modalActions: { display: "flex", gap: "8px" },
  modalCancelBtn: { flex: 1, padding: "12px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "none", borderRadius: "8px", cursor: "pointer" },
  confirmDeleteBtn: { flex: 1, padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#e53e3e", border: "none", borderRadius: "8px", cursor: "pointer" },
};