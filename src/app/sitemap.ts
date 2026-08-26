import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// Add routes here (or generate from Sanity) as the site grows.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
