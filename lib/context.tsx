"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  user_id: string;
  startup_name: string;
  tagline: string;
  problem: string;
  solution: string;
  stage: string;
  industry: string;
  business_model: string;
  traction: string;
  location: string;
  website: string;
  year_founded: string;
  team_size: string;
  funding_goal: string;
  funding_stage: string;
  logo_url: string;
  deck_url: string;
  founder_name: string;
  founder_role: string;
  founder_bio: string;
  founder_linkedin: string;
  founder_twitter: string;
  founder_photo_url: string;
  founder_achievements: string;
  founder_previous_startups: string;
  founder_skills: string;
  founder_experience: {
    id: string;
    role: string;
    company: string;
    year_start: string;
    year_end: string;
  }[];
  founder_education: {
    id: string;
    degree: string;
    school: string;
    year: string;
  }[];
  slug: string;
  is_live: boolean;
  created_at: string;
  updated_at: string;
  validation_score: number | null;
  validation_band: string | null;
  validation_answers: any | null;
  subaccount_code: string | null;
};

type XeeroContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileCache: (updates: Partial<Profile>) => void;
  signOut: () => Promise<void>;
};

// ── Cache helpers ──────────────────────────────────────────────────────────

const CACHE_KEY = "xeero_profile_cache";

function readCache(userId: string): Profile | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

function writeCache(userId: string, profile: Profile) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(profile));
  } catch {}
}

function clearCache(userId: string) {
  try {
    localStorage.removeItem(`${CACHE_KEY}_${userId}`);
  } catch {}
}

// ── Context ────────────────────────────────────────────────────────────────

const XeeroContext = createContext<XeeroContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  profileLoading: true,
  refreshProfile: async () => {},
  updateProfileCache: () => {},
  signOut: async () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────

export function XeeroProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const realtimeChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Fetch profile — uses cache first, then background refresh ──
  const fetchProfile = useCallback(async (userId: string, silent = false) => {
    // Load from cache instantly
    const cached = readCache(userId);
    if (cached) {
      setProfile(cached);
      setProfileLoading(false); // show cached data immediately
    } else if (!silent) {
      setProfileLoading(true);
    }

    // Always fetch fresh data in background
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
      writeCache(userId, data as Profile);
    }

    setProfileLoading(false);
  }, []);

  // ── Refresh profile manually ──
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id, true);
  }, [user, fetchProfile]);

  // ── Update profile cache optimistically ──
  const updateProfileCache = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      writeCache(prev.user_id, updated);
      return updated;
    });
  }, []);

  // ── Sign out ──
  const signOut = useCallback(async () => {
    if (user) clearCache(user.id);
    if (realtimeChannel.current) {
      await supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, [user]);

  // ── Realtime listener ──
  const setupRealtime = useCallback((userId: string) => {
    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
    }

    realtimeChannel.current = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const updated = payload.new as Profile;
            setProfile(updated);
            writeCache(userId, updated);
          }
        }
      )
      .subscribe();
  }, []);

  // ── Auth state listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        setupRealtime(session.user.id);
      } else {
        setProfileLoading(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN" && session?.user) {
          await fetchProfile(session.user.id);
          setupRealtime(session.user.id);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setProfileLoading(false);
          if (realtimeChannel.current) {
            await supabase.removeChannel(realtimeChannel.current);
            realtimeChannel.current = null;
          }
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [fetchProfile, setupRealtime]);

  return (
    <XeeroContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileLoading,
        refreshProfile,
        updateProfileCache,
        signOut,
      }}
    >
      {/* ── Global page loader ── */}
      {(loading || profileLoading) && !profile && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: "2px",
          backgroundColor: "#f0f0f0",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            backgroundColor: "#111111",
            animation: "xeero-progress 1.2s ease-in-out infinite",
            width: "40%",
          }} />
        </div>
      )}
      <style>{`
        @keyframes xeero-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      {children}
    </XeeroContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useXeero() {
  const context = useContext(XeeroContext);
  if (!context) {
    throw new Error("useXeero must be used inside XeeroProvider");
  }
  return context;
}