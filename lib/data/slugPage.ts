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

export type Tab = "overview" | "team" | "deck" | "dataroom";
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