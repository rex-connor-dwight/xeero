"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Step1Identity from "@/components/onboarding/Step1Identity";
import Step2Problem from "@/components/onboarding/Step2Problem";
import Step3StageIndustry from "@/components/onboarding/Step3StageIndustry";
import Step4Traction from "@/components/onboarding/Step4Traction";
import Step5Founder from "@/components/onboarding/Step5Founder";
import Step6Slug from "@/components/onboarding/Step6Slug";

const TOTAL_STEPS = 6;

type ProfileData = {
  startup_name: string;
  tagline: string;
  problem: string;
  solution: string;
  stage: string;
  industry: string;
  business_model: string;
  traction: string;
  location: string;
  founder_name: string;
  founder_role: string;
  founder_bio: string;
  founder_linkedin: string;
  founder_twitter: string;
  slug: string;
};

async function saveProfile(data: ProfileData, userId: string) {
  const { error } = await supabase.from("profiles").upsert({ ...data, user_id: userId });
  return error;
}

async function checkSlugAvailable(slug: string) {
  const { data } = await supabase.from("profiles").select("slug").eq("slug", slug).single();
  return !data;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [data, setData] = useState<ProfileData>({
    startup_name: "", tagline: "", problem: "", solution: "", stage: "", industry: "",
    business_model: "", traction: "", location: "", founder_name: "", founder_role: "",
    founder_bio: "", founder_linkedin: "", founder_twitter: "", slug: "",
  });

  const update = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSlugCheck = async (slug: string) => {
    update("slug", slug);
    if (slug.length < 3) {
      setSlugAvailable(null);
      return;
    }
    const available = await checkSlugAvailable(slug);
    setSlugAvailable(available);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const err = await saveProfile(data, user.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Welcome email now fires here, once the founder has actually built something,
    // not immediately at signup before they've done anything.
    if (user.email) {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/welcome-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email: user.email }),
        }
      ).catch(() => {});
    }

    // router.replace (not push) so /onboarding is removed from history —
    // pressing back after this should not be able to return to onboarding.
    router.replace("/dashboard/edit");
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoOuter}>
              <div style={styles.logoInner} />
            </div>
          </div>
          <div style={styles.stepText}>Step {step} of {TOTAL_STEPS}</div>
        </div>

        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {step === 1 && <Step1Identity startupName={data.startup_name} tagline={data.tagline} onChange={update} />}
        {step === 2 && <Step2Problem problem={data.problem} solution={data.solution} onChange={update} />}
        {step === 3 && (
          <Step3StageIndustry
            stage={data.stage}
            industry={data.industry}
            businessModel={data.business_model}
            onChange={update}
          />
        )}
        {step === 4 && <Step4Traction traction={data.traction} location={data.location} onChange={update} />}
        {step === 5 && (
          <Step5Founder
            founderName={data.founder_name}
            founderRole={data.founder_role}
            founderBio={data.founder_bio}
            founderLinkedin={data.founder_linkedin}
            founderTwitter={data.founder_twitter}
            onChange={update}
          />
        )}
        {step === 6 && <Step6Slug slug={data.slug} slugAvailable={slugAvailable} onSlugChange={handleSlugCheck} />}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.navigation}>
          {step > 1 && (
            <button style={styles.backButton} onClick={handleBack}>← Back</button>
          )}
          {step < TOTAL_STEPS ? (
            <button style={styles.nextButton} onClick={handleNext}>Next →</button>
          ) : (
            <button
              style={{ ...styles.nextButton, opacity: slugAvailable ? 1 : 0.5 }}
              onClick={handleFinish}
              disabled={loading || !slugAvailable}
            >
              {loading ? "Saving..." : "Go to My Dashboard →"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "480px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  logoWrapper: { display: "flex", alignItems: "center" },
  logoOuter: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" },
  logoInner: { width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#111111" },
  stepText: { fontSize: "12px", color: "#999999", fontWeight: "500" },
  progressTrack: { width: "100%", height: "3px", backgroundColor: "#f0f0f0", borderRadius: "99px", marginBottom: "40px", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.3s ease" },
  navigation: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backButton: { padding: "12px 20px", fontSize: "14px", fontWeight: "500", color: "#666666", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" },
  nextButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", borderRadius: "8px", marginLeft: "auto" },
  error: { fontSize: "13px", color: "#e53e3e", marginBottom: "16px", textAlign: "center" },
};