import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
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
  validation_score: number | null;
  validation_band: string | null;
  validation_answers: any | null;
  subaccount_code: string | null;
  link_instagram: string | null;
  link_x: string | null;
  link_linkedin: string | null;
  link_facebook: string | null;
  link_youtube: string | null;
  link_email: string | null;
  link_calendly: string | null;
  link_producthunt: string | null;
  link_appstore: string | null;
  link_playstore: string | null;
  link_newsletter: string | null;
  link_press: string | null;
  link_other_label: string | null;
  link_other_url: string | null;
  visible_tabs: Tab[];
};

export type TeamMemberPublic = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
};

export type Tab = "overview" | "team" | "deck" | "links" | "dataroom";

export const ALL_TABS: { key: Tab; label: string; description: string }[] = [
  { key: "overview", label: "Overview", description: "Problem, solution, traction, and fundraising details" },
  { key: "team", label: "Team", description: "Founder CV and team members" },
  { key: "deck", label: "Deck", description: "Your pitch deck viewer" },
  { key: "links", label: "Links", description: "Social profiles and other links" },
  { key: "dataroom", label: "Data Room", description: "Private document requests from investors" },
];

export type DrAccess = "none" | "loading" | "granted" | "expired";

export type DataRoomDoc = {
  id: string;
  section: string;
  doc_type: string;
  title: string;
  file_url?: string;
  content_json?: any;
  status: string;
};

export function getInitials(name: string) {
  if (!name) return "X";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function getSkillsArray(skills: string) {
  if (!skills) return [];
  return skills.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function fetchProfileBySlug(slug: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  if (data && data.is_live) {
    supabase.from("profile_views").insert({ profile_id: data.id });
  }
  return data as Profile;
}

export async function fetchTeamMembers(profileId: string): Promise<TeamMemberPublic[]> {
  const { data } = await supabase
    .from("team_profiles")
    .select("id, name, role, bio, photo_url, linkedin_url, twitter_url")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function getDeckSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("decks")
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function submitWaitlist(profileId: string, email: string, name: string) {
  const { error } = await supabase
    .from("waitlist")
    .insert({ profile_id: profileId, email, name });
  return error;
}

export async function submitDataRoomRequest(profileId: string, name: string, email: string, note: string) {
  const { error } = await supabase
    .from("data_room_requests")
    .insert({ profile_id: profileId, investor_name: name, investor_email: email, note });
  return error;
}

export async function verifyToken(token: string, profileId: string): Promise<DrAccess> {
  const { data, error } = await supabase
    .from("data_room_requests")
    .select("status, token_expires_at")
    .eq("access_token", token)
    .eq("profile_id", profileId)
    .eq("status", "approved")
    .single();
  if (error || !data) return "none";
  if (new Date(data.token_expires_at) < new Date()) return "expired";
  return "granted";
}

export async function fetchDataRoomDocs(profileId: string): Promise<DataRoomDoc[]> {
  const { data } = await supabase
    .from("data_room_documents")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "complete");
  return data || [];
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function hasAnyLinks(profile: {
  link_instagram?: string | null;
  link_x?: string | null;
  link_linkedin?: string | null;
  link_facebook?: string | null;
  link_youtube?: string | null;
  link_email?: string | null;
  link_calendly?: string | null;
  link_producthunt?: string | null;
  link_appstore?: string | null;
  link_playstore?: string | null;
  link_newsletter?: string | null;
  link_press?: string | null;
  link_other_url?: string | null;
}): boolean {
  return !!(
    profile.link_instagram || profile.link_x || profile.link_linkedin ||
    profile.link_facebook || profile.link_youtube || profile.link_email ||
    profile.link_calendly || profile.link_producthunt || profile.link_appstore ||
    profile.link_playstore || profile.link_newsletter || profile.link_press ||
    profile.link_other_url
  );
}

export function getVisibleTabs(profile: Profile): Tab[] {
  const enabled = profile.visible_tabs && profile.visible_tabs.length > 0
    ? profile.visible_tabs
    : ["overview", "team", "deck", "links", "dataroom"];

  return ALL_TABS
    .map((t) => t.key)
    .filter((key) => {
      if (!enabled.includes(key)) return false;
      if (key === "links" && !hasAnyLinks(profile)) return false;
      return true;
    });
}