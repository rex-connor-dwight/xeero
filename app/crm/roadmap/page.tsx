"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { Plus, X, Trash2, Pencil, Sparkles, RefreshCw } from "lucide-react";

const ADMIN_EMAILS = ["connor@xeero.me"];

type RoadmapUpdate = {
  id: string;
  title: string;
  status: "shipped" | "next" | "planned";
  created_at: string;
};

const statusConfig = {
  shipped: { label: "Shipped", color: "#38a169", bg: "#f0fff4", border: "#c6f6d5" },
  next: { label: "Coming Next", color: "#d69e2e", bg: "#fffbeb", border: "#fef08a" },
  planned: { label: "On the Roadmap", color: "#3182ce", bg: "#ebf8ff", border: "#bee3f8" },
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RoadmapPage() {
  const { user, loading } = useXeero();
  const [updates, setUpdates] = useState<RoadmapUpdate[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"shipped" | "next" | "planned">("planned");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from("roadmap_updates")
      .select("*")
      .order("created_at", { ascending: false });
    setUpdates(data || []);
    setDataLoading(false);
  };

  useEffect(() => {
    if (!loading && user && ADMIN_EMAILS.includes(user.email || "")) fetchData();
  }, [loading, user]);

  const resetForm = () => {
    setTitle("");
    setStatus("planned");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    if (editingId) {
      await supabase
        .from("roadmap_updates")
        .update({ title, status })
        .eq("id", editingId);
    } else {
      await supabase
        .from("roadmap_updates")
        .insert({ title, status });
    }

    resetForm();
    await fetchData();
    setSaving(false);
  };

  const handleEdit = (update: RoadmapUpdate) => {
    setTitle(update.title);
    setStatus(update.status);
    setEditingId(update.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("roadmap_updates").delete().eq("id", id);
    await fetchData();
  };

  if (loading || dataLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  const grouped: Record<string, RoadmapUpdate[]> = {
    shipped: updates.filter((u) => u.status === "shipped"),
    next: updates.filter((u) => u.status === "next"),
    planned: updates.filter((u) => u.status === "planned"),
  };

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Sparkles size={18} color="#111111" /></div>
          <div>
            <h1 style={styles.headerTitle}>Roadmap</h1>
            <p style={styles.headerSub}>What founders see on their dashboard — "What's coming on Xeero"</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={fetchData}>
            <RefreshCw size={13} />
          </button>
          <button style={styles.createBtn} onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}>
            <Plus size={14} />
            New Update
          </button>
        </div>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <p style={styles.formTitle}>{editingId ? "Edit Update" : "New Update"}</p>
            <button style={styles.formCloseBtn} onClick={resetForm}>
              <X size={16} color="#888888" />
            </button>
          </div>

          <label style={styles.label}>Title</label>
          <input
            style={styles.input}
            placeholder="e.g. Waitlist emailer is now live"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label style={styles.label}>Status</label>
          <div style={styles.statusGrid}>
            {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => (
              <button
                key={key}
                style={{
                  ...styles.statusBtn,
                  ...(status === key ? {
                    backgroundColor: statusConfig[key].bg,
                    border: `1px solid ${statusConfig[key].border}`,
                    color: statusConfig[key].color,
                    fontWeight: 600,
                  } : {}),
                }}
                onClick={() => setStatus(key)}
              >
                {statusConfig[key].label}
              </button>
            ))}
          </div>

          <button
            style={{ ...styles.saveBtn, opacity: title.trim() && !saving ? 1 : 0.5 }}
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Post Update"}
          </button>
        </div>
      )}

      {/* ── Grouped List ── */}
      {(Object.keys(grouped) as Array<"shipped" | "next" | "planned">).map((key) => (
        grouped[key].length > 0 && (
            <div key={key} style={styles.section}>
            <p style={styles.sectionLabel}>{statusConfig[key].label} ({grouped[key].length})</p>
            <div style={styles.list}>
              {grouped[key].map((update) => (
                <div key={update.id} style={styles.row}>
                  <div style={styles.rowLeft}>
                    <span style={{
                      ...styles.badge,
                      color: statusConfig[update.status].color,
                      backgroundColor: statusConfig[update.status].bg,
                      border: `1px solid ${statusConfig[update.status].border}`,
                    }}>
                      {statusConfig[update.status].label}
                    </span>
                    <div>
                      <p style={styles.rowTitle}>{update.title}</p>
                      <p style={styles.rowMeta}>{timeAgo(update.created_at)}</p>
                    </div>
                  </div>
                  <div style={styles.rowActions}>
                    <button style={styles.iconBtn} onClick={() => handleEdit(update)}>
                      <Pencil size={13} color="#888888" />
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(update.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {updates.length === 0 && (
        <div style={styles.emptyCard}>
          <p style={styles.emptyText}>No roadmap updates yet. Post one above.</p>
        </div>
      )}

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { padding: "32px", maxWidth: "800px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  refreshBtn: { width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
  createBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  formCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" },
  formHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" },
  formTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0" },
  formCloseBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box", color: "#111111" },
  statusGrid: { display: "flex", gap: "8px", flexWrap: "wrap" },
  statusBtn: { padding: "8px 16px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  saveBtn: { padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", alignSelf: "flex-end", marginTop: "8px" },
  section: { marginBottom: "20px" },
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  list: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f9f9f9" },
  rowLeft: { display: "flex", alignItems: "center", gap: "12px" },
  badge: { fontSize: "10px", fontWeight: "600", padding: "3px 10px", borderRadius: "99px", flexShrink: 0, whiteSpace: "nowrap" },
  rowTitle: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0 0 2px 0" },
  rowMeta: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  rowActions: { display: "flex", gap: "6px", flexShrink: 0 },
  iconBtn: { width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  deleteBtn: { width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e53e3e" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #f0f0f0", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
};