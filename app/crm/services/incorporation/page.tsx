"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Building2, ArrowLeft, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

const STATUS_OPTIONS = [
  { value: "pending_review", label: "Under Review", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  { value: "name_reserved", label: "Name Reserved", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "in_progress", label: "In Progress", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  { value: "completed", label: "Completed", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
  { value: "rejected", label: "Rejected", color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7" },
];

const COUNTRY_LABELS: Record<string, string> = {
  nigeria: "Nigeria — Private Limited Liability",
  ghana: "Ghana — Limited Liability Company",
  delaware: "Delaware, USA — C-Corporation",
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CrmIncorporationPage() {
  const router = useRouter();
  const { user, loading } = useXeero();
  const [requests, setRequests] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const fetchData = async () => {
    const { data } = await supabase
      .from("incorporation_requests")
      .select("*, profiles(startup_name, founder_name, slug)")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handleStatusChange = async (id: string, status: string) => {
    setSavingId(id);
    await supabase
      .from("incorporation_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchData();
    setSavingId(null);
  };

  const handleSaveNotes = async (id: string) => {
    setSavingId(id);
    await supabase
      .from("incorporation_requests")
      .update({ admin_notes: adminNotes[id] || null, updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchData();
    setSavingId(null);
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  return (
    <div style={styles.page}>

      <button style={styles.backBtn} onClick={() => router.push("/crm/services")}>
        <ArrowLeft size={14} />Services
      </button>

      <div style={styles.header}>
        <div style={styles.headerIcon}><Building2 size={18} color="#111111" /></div>
        <div>
          <h1 style={styles.headerTitle}>Incorporate Now, Pay Later</h1>
          <p style={styles.headerSub}>{requests.length} total request{requests.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>No incorporation requests yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {requests.map((req) => {
            const statusInfo = STATUS_OPTIONS.find((s) => s.value === req.status) || STATUS_OPTIONS[0];
            const isExpanded = expandedId === req.id;
            const totalInstallments = req.installment_months + 1;

            return (
              <div key={req.id} style={styles.card}>
                <div style={styles.cardTop} onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                  <div style={styles.cardLeft}>
                    <p style={styles.cardTitle}>{req.profiles?.startup_name || "Unknown"}</p>
                    <p style={styles.cardSub}>{req.proposed_name} · {COUNTRY_LABELS[req.country]}</p>
                    <p style={styles.cardMeta}>{timeAgo(req.created_at)}</p>
                  </div>
                  <div style={styles.cardRight}>
                    <span style={{ ...styles.statusBadge, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
                      {statusInfo.label}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.expanded}>
                    <div style={styles.detailGrid}>
                      <div>
                        <p style={styles.detailLabel}>Founder</p>
                        <p style={styles.detailValue}>{req.profiles?.founder_name}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Entity Type</p>
                        <p style={styles.detailValue}>{req.entity_type}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Alt Name 1</p>
                        <p style={styles.detailValue}>{req.alt_name_1 || "—"}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Alt Name 2</p>
                        <p style={styles.detailValue}>{req.alt_name_2 || "—"}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Total Cost</p>
                        <p style={styles.detailValue}>${req.total_cost_usd}</p>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Payment Progress</p>
                        <p style={styles.detailValue}>{req.paid_installments} / {totalInstallments} paid</p>
                      </div>
                    </div>

                    <div style={styles.statusRow}>
                      <p style={styles.fieldLabel}>Update Status</p>
                      <div style={styles.statusGrid}>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            style={{
                              ...styles.statusBtn,
                              ...(req.status === opt.value ? { backgroundColor: opt.bg, border: `1px solid ${opt.border}`, color: opt.color, fontWeight: 600 } : {}),
                            }}
                            onClick={() => handleStatusChange(req.id, opt.value)}
                            disabled={savingId === req.id}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={styles.fieldLabel}>Admin Notes (visible to founder)</p>
                      <textarea
                        style={styles.textarea}
                        placeholder="e.g. Name approved, documents submitted to CAC. Expect certificate in 5-7 business days."
                        defaultValue={req.admin_notes || ""}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                      />
                      <button
                        style={{ ...styles.saveBtn, opacity: savingId === req.id ? 0.6 : 1 }}
                        onClick={() => handleSaveNotes(req.id)}
                        disabled={savingId === req.id}
                      >
                        <CheckCircle size={13} />
                        {savingId === req.id ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "760px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  backBtn: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", marginBottom: "20px", padding: "0" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" },
  cardLeft: { flex: 1 },
  cardRight: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
  cardTitle: { fontSize: "14px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  cardSub: { fontSize: "12px", color: "#888888", margin: "0 0 2px 0" },
  cardMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  statusBadge: { fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap" },
  expanded: { padding: "0 20px 20px 20px", borderTop: "1px solid #f5f5f5", display: "flex", flexDirection: "column", gap: "16px" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "16px" },
  detailLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px 0" },
  detailValue: { fontSize: "13px", color: "#111111", margin: "0" },
  statusRow: {},
  fieldLabel: { fontSize: "12px", fontWeight: "600", color: "#555555", margin: "0 0 8px 0" },
  statusGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  statusBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", minHeight: "70px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111", marginBottom: "8px" },
  saveBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "40px", border: "1px solid #f0f0f0", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
};