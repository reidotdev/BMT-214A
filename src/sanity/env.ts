// Sanity environment. Values come from .env.local (see .env.example) and are
// wired automatically by scripts/setup.mjs. We DON'T throw when they're missing
// so the boilerplate builds before Sanity is configured — `sanityConfigured`
// gates any actual data fetching (see src/app/page.tsx).

/**
 * Read an env var the way a deploy actually delivers it, rather than the way it
 * was meant to be written.
 *
 * A value that travelled through .env.local, a `vercel env add`, or a paste into
 * the Vercel dashboard can arrive wrapped in the quotes it was stored with, or
 * carrying a stray \r from a CRLF file. Sanity's own `init --env` appends
 * `KEY="value"` — quotes included — so this is not hypothetical: quotes reaching
 * `createClient()` as part of the project id is exactly how the first production
 * build of a scaffolded site died ("`projectId` can only contain only a-z, 0-9
 * and dashes"), while local dev stayed green because dotenv strips them.
 */
function readEnv(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^(['"])([\s\S]*)\1$/, "$2")
    .trim();
}

export const apiVersion =
  readEnv(process.env.NEXT_PUBLIC_SANITY_API_VERSION) || "2024-10-01";

/**
 * Sanity's own validation rules, mirrored here so a malformed value degrades to
 * "not configured" instead of throwing at module load. `createClient()` runs at
 * import time in a file the root layout pulls in, so a throw there takes down
 * every route — including the ones that never touch Sanity.
 */
const VALID_PROJECT_ID = /^[a-z0-9-]+$/;
const VALID_DATASET = /^[a-z0-9_-]+$/;

function guard(name: string, value: string, rule: RegExp, fallback: string) {
  if (!value) return fallback;
  if (rule.test(value)) return value;
  console.warn(
    `[sanity] Ignoring ${name}=${JSON.stringify(value)} — it does not match ${rule}. ` +
      `Sanity is being treated as unconfigured so the build stays green. ` +
      `Check the value in .env.local and in your host's environment variables ` +
      `(quotes and whitespace are the usual culprits).`,
  );
  return fallback;
}

export const dataset = guard(
  "NEXT_PUBLIC_SANITY_DATASET",
  readEnv(process.env.NEXT_PUBLIC_SANITY_DATASET),
  VALID_DATASET,
  "production",
);

export const projectId = guard(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  readEnv(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  VALID_PROJECT_ID,
  "",
);

/** True once a real Sanity project id is present. Guard fetches with this. */
export const sanityConfigured = projectId.length > 0;

// A syntactically valid placeholder so createClient()/defineConfig() don't throw
// at module load before the project is configured. Never used for real fetches
// (those are gated by `sanityConfigured`).
export const safeProjectId = projectId || "placeholder";
