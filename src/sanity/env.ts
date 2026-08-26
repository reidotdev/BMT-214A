// Sanity environment. Values come from .env.local (see .env.example) and are
// wired automatically by scripts/setup.mjs. We DON'T throw when they're missing
// so the boilerplate builds before Sanity is configured — `sanityConfigured`
// gates any actual data fetching (see src/app/page.tsx).

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** True once a real Sanity project id is present. Guard fetches with this. */
export const sanityConfigured = projectId.length > 0;

// A syntactically valid placeholder so createClient()/defineConfig() don't throw
// at module load before the project is configured. Never used for real fetches
// (those are gated by `sanityConfigured`).
export const safeProjectId = projectId || "placeholder";
