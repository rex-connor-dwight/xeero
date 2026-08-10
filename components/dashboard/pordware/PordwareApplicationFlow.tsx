"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { ArrowLeft, CheckCircle } from "lucide-react";
import PordwareStep1 from "@/components/dashboard/pordware/PordwareStep1";
import PordwareStep2 from "@/components/dashboard/pordware/PordwareStep2";
import PordwareStep3 from "@/components/dashboard/pordware/PordwareStep3";
import PordwareStep4 from "@/components/dashboard/pordware/PordwareStep4";
import PordwareStep5 from "@/components/dashboard/pordware/PordwareStep5";
import PordwareStep6 from "@/components/dashboard/pordware/PordwareStep6";
import PordwareStep7 from "@/components/dashboard/pordware/PordwareStep7";
import PordwareStep8 from "@/components/dashboard/pordware/PordwareStep8";
import PordwareStep9 from "@/components/dashboard/pordware/PordwareStep9";
import PordwareTermsGate from "@/components/dashboard/pordware/PordwareTermsGate";

const TOTAL_STEPS = 9;

export default function PordwareApplicationFlow({ onClose }: { onClose: () => void }) {
  const { profile, isTeamMember, founderProfile } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!activeProfile) return;
    supabase
      .from("pordware_applications")
      .select("*")
      .eq("profile_id", activeProfile.id)
      .eq("status", "draft")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Failed to load draft application:", error);
        setApplication(data || null);
        setLoading(false);
      });
  }, [activeProfile]);

  const saveStep = async (stepData: Record<string, any>, nextStep: number) => {
    if (!activeProfile) return;
    setSaving(true);

    if (!application) {
      const { data, error } = await supabase
        .from("pordware_applications")
        .insert({
          profile_id: activeProfile.id,
          current_step: nextStep,
          ...stepData,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error("Failed to create application:", error);
      } else if (data) {
        setApplication(data);
      }
    } else {
      const { data, error } = await supabase
        .from("pordware_applications")
        .update({
          current_step: nextStep,
          updated_at: new Date().toISOString(),
          ...stepData,
        })
        .eq("id", application.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Failed to update application:", error);
      } else if (data) {
        setApplication(data);
      }
    }

    setSaving(false);
  };

  const handleSubmit = async (stepData: Record<string, any>) => {
    if (!application) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("pordware_applications")
      .update({
        ...stepData,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Failed to submit application:", error);
    } else if (data) {
      setApplication(data);
      setSubmitted(true);
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>;
  }

  if (submitted) {
    return (
      <div style={styles.card}>
        <div style={styles.successIcon}><CheckCircle size={26} color="#38a169" /></div>
        <h2 style={styles.successTitle}>Application submitted</h2>
        <p style={styles.successText}>
          We'll review your application and follow up within a few business days.
        </p>
        <button style={styles.doneBtn} onClick={onClose}>Back to Funding</button>
      </div>
    );
  }

  if (!application?.terms_acknowledged) {
    return (
      <PordwareTermsGate
        onClose={onClose}
        onAcknowledge={() => saveStep({ terms_acknowledged: true }, application?.current_step || 1)}
      />
    );
  }

  const currentStep = application?.current_step || 1;

  return (
    <div>
      <button style={styles.backBtn} onClick={onClose}>
        <ArrowLeft size={13} />Back
      </button>

      <div style={styles.progressRow}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(currentStep / TOTAL_STEPS) * 100}%` }} />
        </div>
        <span style={styles.progressText}>Step {currentStep} of {TOTAL_STEPS}</span>
      </div>

      {currentStep === 1 && (
        <PordwareStep1
          activeProfile={activeProfile}
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 2)}
        />
      )}
      {currentStep === 2 && (
        <PordwareStep2
          activeProfile={activeProfile}
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 3)}
          onBack={() => saveStep({}, 1)}
        />
      )}
      {currentStep === 3 && (
        <PordwareStep3
          activeProfile={activeProfile}
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 4)}
          onBack={() => saveStep({}, 2)}
        />
      )}
      {currentStep === 4 && (
        <PordwareStep4
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 5)}
          onBack={() => saveStep({}, 3)}
        />
      )}
      {currentStep === 5 && (
        <PordwareStep5
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 6)}
          onBack={() => saveStep({}, 4)}
        />
      )}
      {currentStep === 6 && (
        <PordwareStep6
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 7)}
          onBack={() => saveStep({}, 5)}
        />
      )}
      {currentStep === 7 && (
        <PordwareStep7
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 8)}
          onBack={() => saveStep({}, 6)}
        />
      )}
      {currentStep === 8 && (
        <PordwareStep8
          activeProfile={activeProfile}
          application={application}
          saving={saving}
          onNext={(data) => saveStep(data, 9)}
          onBack={() => saveStep({}, 7)}
        />
      )}
      {currentStep === 9 && (
        <PordwareStep9
          application={application}
          saving={saving}
          onSubmit={handleSubmit}
          onBack={() => saveStep({}, 8)}
        />
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  loadingWrap: { display: "flex", justifyContent: "center", padding: "60px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "16px", padding: "0" },
  progressRow: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" },
  progressBar: { width: "100%", height: "5px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.4s ease" },
  progressText: { fontSize: "11px", color: "#aaaaaa", fontWeight: "500" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px 32px", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  successIcon: { width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" },
  successTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  successText: { fontSize: "13px", color: "#666666", lineHeight: "1.6", margin: "0 0 24px 0" },
  doneBtn: { padding: "11px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};