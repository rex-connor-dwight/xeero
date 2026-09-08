"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Briefcase, MapPin, DollarSign, Building2 } from "lucide-react";

type OpenRole = {
  id: string;
  title: string;
  description: string;
  compensation_amount: string | null;
  compensation_currency: string | null;
  is_equity_offered: boolean;
  closes_at: string;
  profiles: { startup_name: string; slug: string; logo_url: string | null } | null;
};

export default function HiringDirectoryPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from("hiring_roles")
      .select("id, title, description, compensation_amount, compensation_currency, is_equity_offered, closes_at, profiles(startup_name, slug, logo_url)")
      .lte("opens_at", now)
      .gte("closes_at", now)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRoles((data as any) || []);
        setLoading(false);
      });
  }, []);

  const handleOpenRole = (role: OpenRole) => {
    if (!role.profiles) return;
    router.push(`/hiring/${role.profiles.slug}-${role.id}`);
  };

  return (
    <div style={styles.page}>

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.eyebrow}>Hiring Room</span>
          <h1 style={styles.headline}>Open roles at startups building on Xeero</h1>
          <p style={styles.subhead}>Real teams, real roles, hiring right now.</p>
        </div>
      </div>

      <div style={styles.body}>
        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>
        ) : roles.length === 0 ? (
          <div style={styles.emptyCard}>
            <Briefcase size={28} color="#cccccc" />
            <p style={styles.emptyText}>No open roles right now. Check back soon.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {roles.map((role) => (
              <button key={role.id} style={styles.card} onClick={() => handleOpenRole(role)}>
                <div style={styles.cardHeader}>
                  <div style={styles.logoCircle}>
                    {role.profiles?.logo_url ? (
                      <img src={role.profiles.logo_url} alt="" style={styles.logoImg} />
                    ) : (
                      <Building2 size={16} color="#aaaaaa" />
                    )}
                  </div>
                  <div>
                    <p style={styles.startupName}>{role.profiles?.startup_name || "Unknown"}</p>
                  </div>
                </div>

                <h3 style={styles.roleTitle}>{role.title}</h3>
                <p style={styles.roleDesc}>{role.description.slice(0, 110)}{role.description.length > 110 ? "..." : ""}</p>

                <div style={styles.tagRow}>
                  {role.compensation_amount && (
                    <span style={styles.tag}><DollarSign size={11} />{role.compensation_amount}</span>
                  )}
                  {role.is_equity_offered && <span style={styles.tag}>+ Equity</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  hero: { background: "linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)", padding: "70px 24px 50px 24px" },
  heroContent: { maxWidth: "600px", margin: "0 auto", textAlign: "center" },
  eyebrow: { display: "inline-block", fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" },
  headline: { fontSize: "28px", fontWeight: "800", color: "#ffffff", lineHeight: "1.3", margin: "0 0 10px 0", letterSpacing: "-0.01em" },
  subhead: { fontSize: "14px", color: "rgba(255,255,255,0.55)", margin: "0" },
  body: { maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px 24px" },
  loadingWrap: { display: "flex", justifyContent: "center", padding: "60px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "56px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" },
  card: { textAlign: "left", backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px" },
  logoCircle: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  startupName: { fontSize: "12px", fontWeight: "600", color: "#888888", margin: "0" },
  roleTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0" },
  roleDesc: { fontSize: "12px", color: "#999999", lineHeight: "1.6", margin: "0" },
  tagRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
  tag: { display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: "600", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", padding: "3px 9px", borderRadius: "99px" },
};