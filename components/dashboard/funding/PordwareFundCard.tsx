"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Cpu, ArrowRight, Clock, CheckCircle, XCircle, Rocket } from "lucide-react";
import PordwareApplicationFlow from "@/components/dashboard/pordware/PordwareApplicationFlow";

const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  submitted: { label: "Submitted — awaiting review", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8", icon: <Clock size={13} /> },
  under_review: { label: "Under Review", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a", icon: <Clock size={13} /> },
  shortlisted: { label: "Shortlisted", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8", icon: <Clock size={13} /> },
  technical_assessment: { label: "Technical Assessment in Progress", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a", icon: <Clock size={13} /> },
  due_diligence: { label: "Due Diligence", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a", icon: <Clock size={13} /> },
  approved: { label: "Approved", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5", icon: <CheckCircle size={13} /> },
  rejected: { label: "Not Approved", color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7", icon: <XCircle size={13} /> },
  waitlisted: { label: "Waitlisted", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a", icon: <Clock size={13} /> },
  development_in_progress: { label: "Development in Progress", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8", icon: <Rocket size={13} /> },
  completed: { label: "Completed", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5", icon: <CheckCircle size={13} /> },
};

export default function PordwareFundCard() {
  const { profile, isTeamMember, founderProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  const [applying, setApplying] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);

  useEffect(() => {
    if (!activeProfile) return;
    supabase
      .from("pordware_applications")
      .select("id, status, current_step, startup_name")
      .eq("profile_id", activeProfile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setExistingApplication(data || null);
        setLoadingApplication(false);
      });
  }, [activeProfile]);

  if (applying) {
    return <PordwareApplicationFlow onClose={() => setApplying(false)} />;
  }

  if (loadingApplication) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  const isDraft = existingApplication?.status === "draft";
  const isSubmittedOrBeyond = existingApplication && !isDraft;

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.headerIcon}><Cpu size={18} color="#111111" /></div>
        <div>
          <h2 style={styles.title}>Pordware Technology Fund</h2>
          <p style={styles.subtitle}>Build the technology your validated business needs.</p>
        </div>
      </div>

      <p style={styles.body}>
        Pordware commits between $20,000 and $50,000 in technology development to selected startups
        that have already validated their problem and are ready to build the technology layer to scale.
        You contribute a portion of the development cost, Pordware covers the approved balance.
      </p>

      {!existingApplication && (
        <>
          <p style={styles.notFor}>
            This isn't for a first idea, and it isn't free development credit. It's for founders who've
            already proven demand and need technology to remove the bottleneck.
          </p>
          <button style={styles.applyBtn} onClick={() => setApplying(true)}>
            Apply for the Technology Fund
            <ArrowRight size={14} />
          </button>
        </>
      )}

      {isDraft && (
        <>
          <p style={styles.draftNote}>
            You started this application (Step {existingApplication.current_step} of 9) but haven't submitted it yet.
          </p>
          <button style={styles.applyBtn} onClick={() => setApplying(true)}>
            Continue Your Application
            <ArrowRight size={14} />
          </button>
        </>
      )}

      {isSubmittedOrBeyond && (
        <div style={{
          ...styles.statusBox,
          backgroundColor: STATUS_DISPLAY[existingApplication.status]?.bg || "#f5f5f5",
          border: `1px solid ${STATUS_DISPLAY[existingApplication.status]?.border || "#eeeeee"}`,
        }}>
          <span style={{ color: STATUS_DISPLAY[existingApplication.status]?.color || "#888888" }}>
            {STATUS_DISPLAY[existingApplication.status]?.icon}
          </span>
          <div>
            <p style={{ ...styles.statusLabel, color: STATUS_DISPLAY[existingApplication.status]?.color || "#888888" }}>
              {STATUS_DISPLAY[existingApplication.status]?.label || existingApplication.status}
            </p>
            <p style={styles.statusSub}>
              {existingApplication.startup_name || "Your application"} is currently at this stage. We'll notify you by email as it progresses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc", margin: "0 auto" },
  headerRow: { display: "flex", gap: "14px", marginBottom: "16px" },
  headerIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  subtitle: { fontSize: "12px", color: "#888888", margin: "0" },
  body: { fontSize: "13px", color: "#555555", lineHeight: "1.7", margin: "0 0 12px 0" },
  notFor: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "0 0 20px 0", fontStyle: "italic" },
  draftNote: { fontSize: "12px", color: "#d69e2e", lineHeight: "1.6", margin: "0 0 16px 0", fontWeight: "500" },
  applyBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  statusBox: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "16px 18px", borderRadius: "12px" },
  statusLabel: { fontSize: "13px", fontWeight: "700", margin: "0 0 4px 0" },
  statusSub: { fontSize: "12px", color: "#888888", margin: "0", lineHeight: "1.6" },
};