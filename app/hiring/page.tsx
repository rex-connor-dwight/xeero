"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Briefcase, Search } from "lucide-react";
import RoleCard from "@/components/hiring/RoleCard";
import HiringCTABanner from "@/components/hiring/HiringCTABanner";

const FORMAT_FILTERS = ["all", "remote", "hybrid", "onsite"];
const PAGE_SIZE = 20;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cacheStore: Record<string, { roles: any[]; hasMore: boolean; cachedAt: number }> = {};

export default function HiringDirectoryPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const cacheKey = `${formatFilter}::${debouncedSearch}`;

  const fetchRoles = useCallback(async (offset: number, append: boolean) => {
    const now = new Date().toISOString();
    let query = supabase
      .from("hiring_roles")
      .select("id, title, employment_type, job_type, responsibilities, compensation_amount, compensation_currency, is_equity_offered, created_at, closes_at, profiles(startup_name, slug, logo_url)")
      .lte("opens_at", now)
      .gte("closes_at", now)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (formatFilter !== "all") query = query.eq("employment_type", formatFilter);
    if (debouncedSearch) query = query.ilike("title", `%${debouncedSearch}%`);

    const { data } = await query;
    const results = (data as any) || [];
    const moreAvailable = results.length === PAGE_SIZE;

    if (append) {
      setRoles((prev) => {
        const combined = [...prev, ...results];
        cacheStore[cacheKey] = { roles: combined, hasMore: moreAvailable, cachedAt: Date.now() };
        return combined;
      });
    } else {
      setRoles(results);
      cacheStore[cacheKey] = { roles: results, hasMore: moreAvailable, cachedAt: Date.now() };
    }
    setHasMore(moreAvailable);
  }, [formatFilter, debouncedSearch, cacheKey]);

  useEffect(() => {
    const cached = cacheStore[cacheKey];
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      setRoles(cached.roles);
      setHasMore(cached.hasMore);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchRoles(0, false).finally(() => setLoading(false));
  }, [cacheKey, fetchRoles]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchRoles(roles.length, true);
    setLoadingMore(false);
  };

  const handleOpenRole = (role: any) => {
    if (!role.profiles) return;
    router.push(`/hiring/${role.profiles.slug}-${role.id}`);
  };

  return (
    <div style={styles.page}>

      <div style={styles.hero}>
        <div style={styles.heroBadge}>
          <Briefcase size={13} color="#111111" />
          Hiring Room
        </div>
        <h1 style={styles.headline}>Real roles, real startups, hiring right now.</h1>
        <p style={styles.subhead}>Every listing here is from a founder actively building on Xeero.</p>
      </div>

      <div style={styles.stickyBar}>
        <div style={styles.stickyBarInner}>
          <div style={styles.searchWrapper}>
            <Search size={15} color="#aaaaaa" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search by role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.filterRow}>
            {FORMAT_FILTERS.map((f) => (
              <button
                key={f}
                style={{ ...styles.filterChip, ...(formatFilter === f ? styles.filterChipActive : {}) }}
                onClick={() => setFormatFilter(f)}
              >
                {f === "all" ? "All formats" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.body}>
        <HiringCTABanner />

        {loading ? (
          <div style={styles.loadingWrap}><div style={styles.loadingDot} /></div>
        ) : roles.length === 0 ? (
          <div style={styles.emptyCard}>
            <Briefcase size={26} color="#dddddd" />
            <p style={styles.emptyText}>
              {!debouncedSearch && formatFilter === "all" ? "No open roles right now. Check back soon." : "No roles match your search."}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} onClick={() => handleOpenRole(role)} />
              ))}
            </div>

            {hasMore && (
              <button style={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load More Roles"}
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#fafaf8" },
  hero: { maxWidth: "700px", margin: "0 auto", padding: "64px 24px 24px 24px", textAlign: "center" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", fontSize: "12px", fontWeight: "600", color: "#111111", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  headline: { fontSize: "30px", fontWeight: "800", color: "#111111", lineHeight: "1.3", margin: "0 0 10px 0", letterSpacing: "-0.01em" },
  subhead: { fontSize: "14px", color: "#888888", margin: "0" },
  stickyBar: { position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(250,250,248,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #f0f0ee", padding: "16px 24px" },
  stickyBarInner: { maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  searchWrapper: { position: "relative", width: "100%", maxWidth: "440px" },
  searchIcon: { position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "12px 16px 12px 42px", fontSize: "14px", border: "1px solid #eeeeee", borderRadius: "12px", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box", color: "#111111", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  filterRow: { display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" },
  filterChip: { padding: "6px 15px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "99px", cursor: "pointer" },
  filterChipActive: { color: "#ffffff", backgroundColor: "#111111", border: "1px solid #111111", fontWeight: "600" },
  body: { maxWidth: "920px", margin: "0 auto", padding: "24px 24px 80px 24px" },
  loadingWrap: { display: "flex", justifyContent: "center", padding: "60px 0" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "56px 32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" },
  emptyText: { fontSize: "13px", color: "#aaaaaa", margin: "0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "14px" },
  loadMoreBtn: { display: "block", margin: "24px auto 0 auto", padding: "11px 28px", fontSize: "13px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "10px", cursor: "pointer" },
};