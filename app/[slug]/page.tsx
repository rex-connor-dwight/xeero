import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import SlugClient from "./SlugClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("startup_name, tagline, founder_name, location, logo_url, is_live")
    .eq("slug", slug)
    .single();

  if (!profile || !profile.is_live) {
    return { robots: { index: false, follow: false } };
  }

  const title = `${profile.startup_name} — ${profile.tagline}`;
  const description = `${profile.startup_name} is a startup by ${profile.founder_name} based in ${profile.location}. View their profile, pitch deck, and data room on Xeero.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://xeero.me/${slug}`,
      siteName: "Xeero",
      type: "website",
      images: profile.logo_url ? [{ url: profile.logo_url }] : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ drtoken?: string }>;
}) {
  const { slug } = await params;
  const { drtoken } = await searchParams;

  return (
    <SlugClient
      slug={slug}
      drToken={drtoken || null}
    />
  );
}