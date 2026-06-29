"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  CheckCircle,
  XCircle,
  Building2,
  Rocket,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type Tab = "support" | "funding";

type SupportApplication = {
  id: string;
  profile_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  status: string;
  subaccount_code: string | null;
  decline_reason: string | null;
  created_at: string;
  profiles: { startup_name: string; founder_name: string; slug: string };
};

type FundingApplication = {
  id: string;
  profile_id: string;
  funding_stage: string;
  amount_raising: string;
  use_of_funds: string;
  additional_notes: string;
  status: string;
  created_at: string;
  profiles: { startup_name: string; founder_name: string; slug: string };
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    pending: { color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
    approved: { color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
    declined: { color: "#e53e3e", bg: "#fff5f5", border: "#fed7d7" },
    reviewed: { color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontSize: "11px", fontWeight: "600", color: s.color, backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: "99px", padding: "3px 10px", textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

export default function ApplicationsPage() {
  const { user, loading } = useXeero();
  const [tab, setTab] = useState<Tab>("support");
  const [supportApps, setSupportApps] = useState<SupportApplication[]>([]);
  const [fundingApps, setFundingApps] = useState<FundingApplication[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineInput, setShowDeclineInput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setDataLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const res = await fetch(`${base}/functions/v1/crm-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    setSupportApps(data.support || []);
    setFundingApps(data.funding || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const handleApprove = async (app: SupportApplication) => {
    setProcessingId(app.id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-subaccount`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ application_id: app.id }),
        }
      );
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Failed to approve."); setProcessingId(null); return; }
      setSuccess(`${app.profiles.startup_name} approved.`);
      await fetchData();
    } catch { setError("Something went wrong."); }
    setProcessingId(null);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleDecline = async (app: SupportApplication) => {
    setProcessingId(app.id);
    await supabase.from("support_applications").update({ status: "declined", decline_reason: declineReason || null, updated_at: new Date().toISOString() }).eq("id", app.id);
    setDeclineReason("");
    setShowDeclineInput(null);
    setProcessingId(null);
    await fetchData();
  };

  const handleMarkReviewed = async (id: string) => {
    await supabase.from("funding_applications").update({ status: "reviewed" }).eq("id", id);
    await fetchData();
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const pendingSupport = supportApps.filter((a) => a.status === "pending").length;
  const pendingFunding = fundingApps.filter((a) => a.status !== "reviewed").length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Applications</h1>
          <p style={styles.sub}>Review community support and funding applications.</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {success && <div style={styles.toast}><CheckCircle size={14} color="#38a169" /><span>{success}</span></div>}
      {error && <div style={{ ...styles.toast, ...styles.toastError }}><span>{error}</span></div>}

      <div style={styles.tabsRow}>
        <button style={{ ...styles.tab, ...(tab === "support" ? styles.tabActive : {}) }} onClick={() => setTab("support")}>
          <Building2 size={14} />
          Community Support
          {pendingSupport > 0 && <span style={styles.badge}>{pendingSupport}</span>}
        </button>
        <button style={{ ...styles.tab, ...(tab === "funding" ? styles.tabActive : {}) }} onClick={() => setTab("funding")}>
          <Rocket size={14} />
          Funding
          {pendingFunding > 0 && <span style={styles.badge}>{pendingFunding}</span>}
        </button>
      </div>

      {tab === "support" && (
        <div style={styles.list}>
          {supportApps.length === 0 && <div style={styles.emptyCard}><p style={styles.emptyText}>No support applications yet.</p></div>}
          {supportApps.map((app) => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <div style={styles.cardTitleRow}>
                    <p style={styles.cardTitle}>{app.profiles?.startup_name || "Unknown"}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p style={styles.cardSub}>{app.profiles?.founder_name} · xeero.me/{app.profiles?.slug}</p>
                  <p style={styles.cardMeta}>{timeAgo(app.created_at)}</p>
                </div>
                <button style={styles.expandBtn} onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                  {expandedId === app.id ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                </button>
              </div>

              {expandedId === app.id && (
                <div style={styles.cardExpanded}>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailItem}><p style={styles.detailLabel}>Bank</p><p style={styles.detailValue}>{app.bank_name}</p></div>
                    <div style={styles.detailItem}><p style={styles.detailLabel}>Account Number</p><p style={styles.detailValue}>{app.account_number}</p></div>
                    <div style={styles.detailItem}><p style={styles.detailLabel}>Account Name</p><p style={styles.detailValue}>{app.account_name}</p></div>
                    <div style={styles.detailItem}><p style={styles.detailLabel}>Bank Code</p><p style={styles.detailValue}>{app.bank_code}</p></div>
                    {app.subaccount_code && <div style={styles.detailItem}><p style={styles.detailLabel}>Subaccount</p><p style={styles.detailValue}>{app.subaccount_code}</p></div>}
                    {app.decline_reason && <div style={styles.detailItem}><p style={styles.detailLabel}>Decline Reason</p><p style={styles.detailValue}>{app.decline_reason}</p></div>}
                  </div>

                  {app.status === "pending" && (
                    <div style={styles.actionRow}>
                      <button style={{ ...styles.approveBtn, opacity: processingId === app.id ? 0.6 : 1 }} onClick={() => handleApprove(app)} disabled={processingId === app.id}>
                        <CheckCircle size={13} />
                        {processingId === app.id ? "Processing..." : "Approve"}
                      </button>
                      {showDeclineInput === app.id ? (
                        <div style={styles.declineFlow}>
                          <input style={styles.declineInput} placeholder="Reason (optional)" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                          <div style={styles.declineBtns}>
                            <button style={styles.declineConfirmBtn} onClick={() => handleDecline(app)}>Confirm</button>
                            <button style={styles.cancelBtn} onClick={() => setShowDeclineInput(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button style={styles.declineBtn} onClick={() => setShowDeclineInput(app.id)}>
                          <XCircle size={13} />Decline
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "funding" && (
        <div style={styles.list}>
          {fundingApps.length === 0 && <div style={styles.emptyCard}><p style={styles.emptyText}>No funding applications yet.</p></div>}
          {fundingApps.map((app) => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <div style={styles.cardTitleRow}>
                    <p style={styles.cardTitle}>{app.profiles?.startup_name || "Unknown"}</p>
                    <StatusBadge status={app.status || "pending"} />
                  </div>
                  <p style={styles.cardSub}>{app.profiles?.founder_name} · xeero.me/{app.profiles?.slug}</p>
                  <p style={styles.cardMeta}>{app.funding_stage} · {app.amount_raising} · {timeAgo(app.created_at)}</p>
                </div>
                <button style={styles.expandBtn} onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                  {expandedId === app.id ? <ChevronUp size={16} color="#888888" /> : <ChevronDown size={16} color="#888888" />}
                </button>
              </div>

              {expandedId === app.id && (
                <div style={styles.cardExpanded}>
                  <div style={styles.detailGrid}>
                    <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}><p style={styles.detailLabel}>Use of Funds</p><p style={styles.detailValue}>{app.use_of_funds}</p></div>
                    {app.additional_notes && <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}><p style={styles.detailLabel}>Additional Notes</p><p style={styles.detailValue}>{app.additional_notes}</p></div>}
                  </div>
                  {app.status !== "reviewed" && (
                    <div style={styles.actionRow}>
                      <button style={styles.approveBtn} onClick={() => handleMarkReviewed(app.id)}>
                        <CheckCircle size={13} />Mark Reviewed
                      </button>
                      <a href={`https://xeero.me/${app.profiles?.slug}`} target="_blank" rel="noopener noreferrer" style={styles.viewBtn}>
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "32px", maxWidth: "900px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888888", margin: "0" },
  refreshBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  toast: { position: "fixed", top: "24px", right: "24px", zIndex: 500, backgroundColor: "#ffffff", border: "1px solid #c6f6d5", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#38a169", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
  toastError: { border: "1px solid #fed7d7", color: "#e53e3e" },
  tabsRow: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: { display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", fontSize: "13px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  tabActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111" },
  badge: { fontSize: "10px", fontWeight: "700", color: "#ffffff", backgroundColor: "#e53e3e", borderRadius: "99px", padding: "1px 6px", marginLeft: "2px" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px" },
  cardLeft: { flex: 1 },
  cardTitleRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0" },
  cardSub: { fontSize: "12px", color: "#888888", margin: "0 0 4px 0" },
  cardMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  expandBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" },
  cardExpanded: { padding: "0 20px 20px 20px", borderTop: "1px solid #f5f5f5" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px", padding: "16px 0" },
  detailItem: {},
  detailLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px 0" },
  detailValue: { fontSize: "13px", color: "#111111", margin: "0", lineHeight: "1.6" },
  actionRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" },
  approveBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#38a169", border: "none", borderRadius: "8px", cursor: "pointer" },
  declineBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", color: "#e53e3e", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", cursor: "pointer" },
  declineFlow: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  declineInput: { width: "100%", padding: "9px 12px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box" },
  declineBtns: { display: "flex", gap: "8px" },
  declineConfirmBtn: { padding: "8px 14px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#e53e3e", border: "none", borderRadius: "8px", cursor: "pointer" },
  cancelBtn: { padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "8px", cursor: "pointer" },
  viewBtn: { display: "flex", alignItems: "center", padding: "8px 16px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", textDecoration: "none" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "48px 32px", border: "1px solid #f0f0f0", textAlign: "center" },
  emptyText: { fontSize: "14px", color: "#aaaaaa", margin: "0" },
};