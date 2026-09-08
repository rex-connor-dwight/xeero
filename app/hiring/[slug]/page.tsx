"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, ExternalLink, DollarSign, Lock } from "lucide-react";
import ApplicationForm from "@/components/hiring/ApplicationForm";

export default function RoleApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const rawSlug = params.slug as string;
    // Format is {founder-slug}-{role-id} — role IDs are UUIDs (36 chars with hyphens),
    // so split off the last 36 characters as the ID and everything before the final
    // separating hyphen as the founder slug.
    const roleId = rawSlug.slice(-36);
    const founderSlug = rawSlug.slice(0, rawSlug.length - 37); // -37 to also drop the joining "-"

    if (!roleId || roleId.length !== 36) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    supabase
      .from("hiring_roles")
      .select("*, profiles(startup_name, slug, logo_url)")
      .eq("id", roleId)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data || data.profiles?.slug !== founderSlug) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setRole(data);

        const { data: qData } = await supabase
          .from("hiring_screening_questions")
          .select("*")
          .eq("role_id", roleId)
          .order("display_order", { ascending: true });

        setQuestions(qData || []);
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) {
    return <div style={styles.centeredPage}><div style={styles.loadingDot} /></div>;
  }

  if (notFound || !role) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.stateCard}>
          <Lock size={26} color="#cccccc" />
          <h1 style={styles.stateTitle}>Role not found</h1>
          <p style={styles.stateText}>This link may be incorrect or the role no longer exists.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const opensAt = new Date(role.opens_at);
  const closesAt = new Date(role.closes_at);
  const isScheduled = now < opensAt;
  const isClosed = now > closesAt;
  const isOpen = !isScheduled && !isClosed;

  if (isScheduled) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.stateCard}>
          <Clock size={26} color="#d69e2e" />
          <h1 style={styles.stateTitle}>Not open yet</h1>
          <p style={styles.stateText}>
            This role opens for applications on {opensAt.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.stateCard}>
          <Lock size={26} color="#cccccc" />
          <h1 style={styles.stateTitle}>This job application has been closed</h1>
          <p style={styles.stateText}>This role is no longer accepting applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.body}>
        <button style={styles.backBtn} onClick={() => router.push("/hiring")}>
          <ArrowLeft size={13} />All Roles
        </button>

        <div style={styles.roleCard}>
          <p style={styles.startupName}>{role.profiles?.startup_name}</p>
          <h1 style={styles.roleTitle}>{role.title}</h1>

          <div style={styles.tagRow}>
            {role.compensation_amount && (
              <span style={styles.tag}><DollarSign size={11} />{role.compensation_amount}</span>
            )}
            {role.is_equity_offered && <span style={styles.tag}>+ Equity</span>}
          </div>

          <p style={styles.description}>{role.description}</p>

          
            <a href={`https://xeero.me/${role.profiles?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.viewStartupLink}
          >
            View {role.profiles?.startup_name} on Xeero <ExternalLink size={12} />
          </a>
        </div>

        <ApplicationForm roleId={role.id} questions={questions} cutoffScore={role.cutoff_score} />
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  centeredPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", padding: "24px" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  stateCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "48px 32px", maxWidth: "400px", width: "100%", textAlign: "center", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  stateTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "16px 0 8px 0" },
  stateText: { fontSize: "14px", color: "#888888", lineHeight: "1.6", margin: "0" },
  body: { maxWidth: "560px", margin: "0 auto", padding: "32px 24px 80px 24px" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", padding: "0" },
  roleCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "16px" },
  startupName: { fontSize: "12px", fontWeight: "600", color: "#888888", margin: "0 0 6px 0" },
  roleTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 14px 0" },
  tagRow: { display: "flex", gap: "6px", marginBottom: "18px" },
  tag: { display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "3px 9px", borderRadius: "99px" },
  description: { fontSize: "14px", color: "#555555", lineHeight: "1.8", whiteSpace: "pre-wrap", margin: "0 0 18px 0" },
  viewStartupLink: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#3182ce", textDecoration: "none", fontWeight: "500" },
};