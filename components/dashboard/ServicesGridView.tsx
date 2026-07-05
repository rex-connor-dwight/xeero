"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  Building2, Landmark, Scale, Code, Users, TrendingUp, Megaphone, Calculator,
  Crown, X, Bell, CheckCircle,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  building: <Building2 size={20} color="#111111" />,
  landmark: <Landmark size={20} color="#111111" />,
  scale: <Scale size={20} color="#111111" />,
  code: <Code size={20} color="#111111" />,
  users: <Users size={20} color="#111111" />,
  "trending-up": <TrendingUp size={20} color="#111111" />,
  megaphone: <Megaphone size={20} color="#111111" />,
  calculator: <Calculator size={20} color="#111111" />,
};

type Service = {
  id: string;
  name: string;
  description: string;
  icon_key: string;
  status: "available" | "coming_soon";
  category: string;
  route: string | null;
};

export default function ServicesGridView() {
  const router = useRouter();
  const { profile, isTeamMember, founderProfile, isTeamsActive } = useXeero();
  const activeProfile = isTeamMember ? founderProfile : profile;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setServices(data || []);
        setLoading(false);
      });

    if (activeProfile) {
      supabase
        .from("service_interest")
        .select("service_id")
        .eq("profile_id", activeProfile.id)
        .then(({ data }) => {
          setInterestedIds(new Set((data || []).map((d) => d.service_id)));
        });
    }
  }, [activeProfile]);

  const handleCardClick = (service: Service) => {
    // Browsing available services is always allowed — the gate lives inside
    // each service's own flow, at the point of actual submission/payment.
    if (service.status === "available" && service.route) {
      router.push(isTeamMember ? service.route.replace("/dashboard/", "/team-dashboard/") : service.route);
    } else {
      setPreviewService(service);
    }
  };

  const handleNotifyMe = async () => {
    if (!previewService || !activeProfile) return;
    setNotifying(true);
    await supabase.from("service_interest").upsert({
      service_id: previewService.id,
      profile_id: activeProfile.id,
    }, { onConflict: "service_id,profile_id" });
    setInterestedIds((prev) => new Set(prev).add(previewService.id));
    setNotifying(false);
  };

  if (loading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Crown size={18} color="#111111" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Services</h1>
          <p style={styles.headerSub}>Everything a startup needs, beyond the product itself.</p>
        </div>
      </div>

      {!isTeamsActive && (
        <div style={styles.banner}>
          <Crown size={14} color="#92610a" />
          <span style={styles.bannerText}>
            Browse freely — upgrading to Xeero for Teams unlocks submitting requests and payments.
          </span>
        </div>
      )}

      <div style={styles.grid}>
        {services.map((service) => (
          <button key={service.id} style={styles.card} onClick={() => handleCardClick(service)}>
            <div style={styles.cardIcon}>{ICONS[service.icon_key] || <Building2 size={20} color="#111111" />}</div>
            <div style={styles.cardTop}>
              <p style={styles.cardName}>{service.name}</p>
              <span style={{
                ...styles.statusBadge,
                ...(service.status === "available" ? styles.statusAvailable : styles.statusComingSoon),
              }}>
                {service.status === "available" ? "Available" : "Coming Soon"}
              </span>
            </div>
            <p style={styles.cardDesc}>{service.description}</p>
            {service.status === "coming_soon" && interestedIds.has(service.id) && (
              <span style={styles.notifiedTag}>
                <CheckCircle size={11} />You'll be notified
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Preview Modal for Coming Soon */}
      {previewService && (
        <div style={styles.modalOverlay} onClick={() => setPreviewService(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBox}>
                {ICONS[previewService.icon_key] || <Building2 size={20} color="#111111" />}
              </div>
              <button style={styles.modalCloseBtn} onClick={() => setPreviewService(null)}>
                <X size={16} color="#888888" />
              </button>
            </div>
            <h2 style={styles.modalTitle}>{previewService.name}</h2>
            <span style={styles.modalComingSoonBadge}>Coming Soon</span>
            <p style={styles.modalDesc}>{previewService.description}</p>

            {interestedIds.has(previewService.id) ? (
              <div style={styles.notifiedBox}>
                <CheckCircle size={16} color="#38a169" />
                <span style={styles.notifiedBoxText}>You'll be the first to know when this launches.</span>
              </div>
            ) : (
              <button
                style={{ ...styles.notifyBtn, opacity: notifying ? 0.6 : 1 }}
                onClick={handleNotifyMe}
                disabled={notifying}
              >
                <Bell size={13} />
                {notifying ? "Saving..." : "Notify Me When Available"}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "24px", maxWidth: "820px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  banner: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "10px", marginBottom: "20px" },
  bannerText: { fontSize: "12px", color: "#92610a", fontWeight: "500" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px" },
  cardIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" },
  cardName: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0" },
  statusBadge: { fontSize: "10px", fontWeight: "600", padding: "3px 8px", borderRadius: "99px", flexShrink: 0, whiteSpace: "nowrap" },
  statusAvailable: { color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5" },
  statusComingSoon: { color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee" },
  cardDesc: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0" },
  notifiedTag: { display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#38a169", fontWeight: "500" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  modalIconBox: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" },
  modalCloseBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" },
  modalTitle: { fontSize: "18px", fontWeight: "700", color: "#111111", margin: "0 0 8px 0" },
  modalComingSoonBadge: { display: "inline-block", fontSize: "11px", fontWeight: "600", color: "#888888", backgroundColor: "#f5f5f5", padding: "3px 10px", borderRadius: "99px", border: "1px solid #eeeeee", marginBottom: "14px" },
  modalDesc: { fontSize: "14px", color: "#666666", lineHeight: "1.7", margin: "0 0 20px 0" },
  notifyBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  notifiedBox: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "10px" },
  notifiedBoxText: { fontSize: "13px", color: "#38a169", fontWeight: "500" },
};