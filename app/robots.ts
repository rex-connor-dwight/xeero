import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/team-dashboard",
          "/team-dashboard/",
          "/crm",
          "/crm/",
          "/onboarding",
          "/auth",
          "/preview",
          "/payment",
          "/confirm",
          "/join",
          "/api",
        ],
      },
    ],
    sitemap: "https://xeero.me/sitemap.xml",
  };
}