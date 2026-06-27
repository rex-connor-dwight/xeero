import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/$slug"],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/onboarding",
          "/auth",
          "/preview",
          "/payment",
          "/confirm",
          "/api",
        ],
      },
    ],
    sitemap: "https://xeero.me/sitemap.xml",
  };
}