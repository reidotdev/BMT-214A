/**
 * Central site config. Edit these per project — metadata, sitemap, robots, and
 * OG image all read from here so there's a single source of truth.
 */
export const siteConfig = {
  name: "Website Boilerplate",
  description:
    "A Next.js + React Aria + Tailwind + Sanity starter. Replace this with the project's own description.",
  // Prefer the deployed URL; falls back to localhost in dev.
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;
