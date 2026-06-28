import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const base: MetadataRoute.Sitemap = [
    {
      url: "https://xeero.me",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  if (!supabaseUrl || !supabaseKey) return base;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("slug, updated_at")
      .eq("is_live", true);

    const slugPages: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
      url: `https://xeero.me/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...base, ...slugPages];
  } catch {
    return base;
  }
}