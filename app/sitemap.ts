import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all live profiles
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("slug, updated_at")
    .eq("is_live", true);

  const slugPages: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
    url: `https://xeero.me/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://xeero.me",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...slugPages,
  ];
}