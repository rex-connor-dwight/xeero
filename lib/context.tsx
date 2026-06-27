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

  // ── Fetch profile ──
  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
    setProfileLoading(false);
  }, []);

  // ── Refresh profile manually ──
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  // ── Update profile cache optimistically ──
  const updateProfileCache = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  // ── Sign out ──
  const signOut = useCallback(async () => {
    if (realtimeChannel.current) {
      await supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  // ── Setup realtime listener for profile changes ──
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
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();
  }, []);

  // ── Auth state listener ──
  useEffect(() => {
    // Get initial session
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

    // Listen for auth changes
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

        if (event === "TOKEN_REFRESHED" && session?.user) {
          // Session refreshed silently — no action needed
          // Supabase handles token refresh automatically
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