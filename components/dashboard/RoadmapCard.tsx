"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight } from "lucide-react";

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

export default function RoadmapCard() {
  const [updates, setUpdates] = useState<RoadmapUpdate[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("roadmap_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setUpdates(data || []);
        setLoading(false);
      });
  }, []);

  if (loading || updates.length === 0) return null;

  const visibleUpdates = expanded ? updates : updates.slice(0, 3);

  return (
    <div style={styles.card}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <Sparkles size={15} color="#111111" />
          <span style={styles.headerTitle}>What's coming on Xeero</span>
        </div>
        <ChevronRight size={14} color="#aaaaaa" style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }} />
      </div>
      <div style={styles.list}>
        {visibleUpdates.map((update) => {
          const config = statusConfig[update.status];
          return (
            <div key={update.id} style={styles.row}>
              <span style={{ ...styles.badge, color: config.color, backgroundColor: config.bg, border: `1px solid ${config.border}` }}>
                {config.label}
              </span>
              <span style={styles.rowTitle}>{update.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  card: { backgroundColor: "#ffffff", borderRadius: "14px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "20px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer" },
  headerLeft: { display: "flex", alignItems: "center", gap: "8px" },
  headerTitle: { fontSize: "13px", fontWeight: "600", color: "#111111" },
  list: { padding: "0 18px 14px 18px", display: "flex", flexDirection: "column", gap: "8px" },
  row: { display: "flex", alignItems: "center", gap: "10px" },
  badge: { fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "99px", flexShrink: 0, whiteSpace: "nowrap" },
  rowTitle: { fontSize: "12px", color: "#555555", lineHeight: "1.4" },
};