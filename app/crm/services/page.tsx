"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Building2, Landmark, Scale, Crown } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

const SERVICE_CARDS = [
  {
    key: "incorporation",
    name: "Incorporate Now, Pay Later",
    icon: <Building2 size={20} color="#111111" />,
    route: "/crm/services/incorporation",
    table: "incorporation_requests",
    pendingFilter: { status: "pending_review" },
    live: true,
  },
  {
    key: "banking",
    name: "Corporate Bank Account Setup",
    icon: <Landmark size={20} color="#111111" />,
    route: null,
    table: null,
    live: false,
  },
  {
    key: "legal",
    name: "Legal Essentials",
    icon: <Scale size={20} color="#111111" />,
    route: null,
    table: null,
    live: false,
  },
];

export default function CrmServicesPage() {
  const router = useRouter();
  const { user, loading } = useXeero();
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading || !user || !ADMIN_EMAILS.includes(user.email || "")) return;

    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const service of SERVICE_CARDS) {
        if (!service.live || !service.table) continue;
        const { count } = await supabase
          .from(service.table)
          .select("*", { count: "exact", head: true })
          .eq("status", service.pendingFilter?.status);
        counts[service.key] = count || 0;
      }
      setPendingCounts(counts);
      setDataLoading(false);
    };

    fetchCounts();
  }, [loading, user]);

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Crown size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Services</h1>
          <p style={styles.headerSub}>Manage requests across every Xeero for Teams service.</p>
        </div>
      </div>

      <div style={styles.grid}>
        {SERVICE_CARDS.map((service) => (
          <button
            key={service.key}
            style={{ ...styles.card, ...(service.live ? {} : styles.cardDisabled) }}
            onClick={() => service.route && router.push(service.route)}
            disabled={!service.live}
          >
            <div style={styles.cardTop}>
              <div style={styles.cardIcon}>{service.icon}</div>
              {service.live && pendingCounts[service.key] > 0 && (
                <span style={styles.badge}>{pendingCounts[service.key]} pending</span>
              )}
            </div>
            <p style={styles.cardName}>{service.name}</p>
            <span style={styles.cardStatus}>
              {service.live ? "Manage requests →" : "Not launched yet"}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "800px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px" },
  cardDisabled: { opacity: 0.5, cursor: "not-allowed" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  badge: { fontSize: "10px", fontWeight: "700", color: "#ffffff", backgroundColor: "#e53e3e", borderRadius: "99px", padding: "3px 9px", whiteSpace: "nowrap" },
  cardName: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0" },
  cardStatus: { fontSize: "12px", color: "#888888" },
};