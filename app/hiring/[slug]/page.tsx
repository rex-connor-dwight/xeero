import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import RoleClient from "./RoleClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getRoleForMetadata(rawSlug: string | undefined) {
  if (!rawSlug || typeof rawSlug !== "string" || rawSlug.length < 37) return null;

  const roleId = rawSlug.slice(-36);
  const founderSlug = rawSlug.slice(0, rawSlug.length - 37);
  if (!roleId || roleId.length !== 36) return null;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase
    .from("hiring_roles")
    .select("title, responsibilities, profiles(startup_name, slug, logo_url)")
    .eq("id", roleId)
    .single();

  if (!data || (data.profiles as any)?.slug !== founderSlug) return null;
  return data;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const role = await getRoleForMetadata(slug);

  if (!role) {
    return {
      title: "Role not found — Xeero Hiring Room",
      description: "This role may have closed or the link is incorrect.",
    };
  }

  const startupName = (role.profiles as any)?.startup_name || "a startup on Xeero";
  const roleTitle = role.title || "Open Role";
  const responsibilities = typeof role.responsibilities === "string" ? role.responsibilities : "";

  const title = `${roleTitle} at ${startupName}`;
  const description = responsibilities.length > 0
    ? responsibilities.slice(0, 155) + (responsibilities.length > 155 ? "..." : "")
    : `Apply for ${roleTitle} at ${startupName}, listed on Xeero's Hiring Room.`;

  const logoUrl = (role.profiles as any)?.logo_url || "https://xeero.me/hiring-og.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://xeero.me/hiring/${slug || ""}`,
      siteName: "Xeero",
      type: "website",
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default function RoleApplicationPage() {
  return <RoleClient />;
}