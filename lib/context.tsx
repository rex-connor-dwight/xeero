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
  plan_type: string;
  plan_expires_at: string | null;
};

export type TeamProfile = {
  id: string;
  user_id: string;
  profile_id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  permissions: string[];
  created_at: string;
};

type XeeroContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  teamProfile: TeamProfile | null;
  founderProfile: Profile | null;
  isTeamMember: boolean;
  isTeamsActive: boolean;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileCache: (updates: Partial<Profile>) => void;
  signOut: () => Promise<void>;
};

const CACHE_KEY = "xeero_profile_cache_v2";
const TEAM_CACHE_KEY = "xeero_team_cache_v2";

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
    localStorage.removeItem(`${TEAM_CACHE_KEY}_${userId}`);
    localStorage.removeItem(`xeero_team_cache_${userId}`);
    localStorage.removeItem(`xeero_profile_cache_${userId}`);
    localStorage.removeItem(`xeero_profile_cache_v2_${userId}`);
  } catch {}
}

function readTeamCache(userId: string): { teamProfile: TeamProfile; founderProfile: Profile } | null {
  try {
    const raw = localStorage.getItem(`${TEAM_CACHE_KEY}_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeTeamCache(userId: string, teamProfile: TeamProfile, founderProfile: Profile) {
  try {
    localStorage.setItem(`${TEAM_CACHE_KEY}_${userId}`, JSON.stringify({ teamProfile, founderProfile }));
  } catch {}
}

const XeeroContext = createContext<XeeroContextType>({
  user: null,
  session: null,
  profile: null,
  teamProfile: null,
  founderProfile: null,
  isTeamMember: false,
  isTeamsActive: false,
  loading: true,
  profileLoading: true,
  refreshProfile: async () => {},
  updateProfileCache: () => {},
  signOut: async () => {},
});

export function XeeroProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null);
  const [founderProfile, setFounderProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const realtimeChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchProfile = useCallback(async (userId: string, silent = false) => {
    const cachedFounder = readCache(userId);
    if (cachedFounder) {
      setProfile(cachedFounder);
      setTeamProfile(null);
      setFounderProfile(null);
      setProfileLoading(false);
    } else if (!silent) {
      setProfileLoading(true);
    }

    const { data: founderData, error: founderError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (founderData && !founderError) {
      setProfile(founderData as Profile);
      setTeamProfile(null);
      setFounderProfile(null);
      writeCache(userId, founderData as Profile);
      setProfileLoading(false);
      return;
    }

    if (founderError && founderError.code === "PGRST116") {
      const cachedTeam = readTeamCache(userId);
      if (cachedTeam) {
        setTeamProfile(cachedTeam.teamProfile);
        setFounderProfile(cachedTeam.founderProfile);
        setProfile(null);
        setProfileLoading(false);
      }

      const { data: teamData, error: teamError } = await supabase
        .from("team_profiles")
        .select("*, profiles(*)")
        .eq("user_id", userId)
        .single();

      if (!teamError && teamData) {
        const tp: TeamProfile = {
          id: teamData.id,
          user_id: teamData.user_id,
          profile_id: teamData.profile_id,
          name: teamData.name,
          role: teamData.role,
          bio: teamData.bio,
          photo_url: teamData.photo_url,
          linkedin_url: teamData.linkedin_url,
          twitter_url: teamData.twitter_url,
          permissions: teamData.permissions || [],
          created_at: teamData.created_at,
        };
        const fp = teamData.profiles as Profile;
        setTeamProfile(tp);
        setFounderProfile(fp);
        setProfile(null);
        writeTeamCache(userId, tp, fp);
      }
    }

    setProfileLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id, true);
  }, [user, fetchProfile]);

  const updateProfileCache = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      writeCache(prev.user_id, updated);
      return updated;
    });
  }, []);

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
    setTeamProfile(null);
    setFounderProfile(null);
  }, [user]);

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
          setTeamProfile(null);
          setFounderProfile(null);
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

  const isTeamMember = !!teamProfile && !profile;

  // isTeamsActive always looks at the founder's plan — team members inherit the founder's plan status
  const planSource = isTeamMember ? founderProfile : profile;
  const isTeamsActive =
    planSource?.plan_type === "teams" &&
    (!planSource?.plan_expires_at || new Date(planSource.plan_expires_at) > new Date());

  return (
    <XeeroContext.Provider
      value={{
        user,
        session,
        profile,
        teamProfile,
        founderProfile,
        isTeamMember,
        isTeamsActive,
        loading,
        profileLoading,
        refreshProfile,
        updateProfileCache,
        signOut,
      }}
    >
      {(loading || profileLoading) && !profile && !teamProfile && (
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

export function useXeero() {
  const context = useContext(XeeroContext);
  if (!context) {
    throw new Error("useXeero must be used inside XeeroProvider");
  }
  return context;
}