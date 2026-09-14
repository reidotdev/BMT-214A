import "server-only";

import { sanityConfigured } from "../env";

/**
 * Server-only Sanity read token, for drafts and live preview. Sourced from
 * `SANITY_API_READ_TOKEN` (a Viewer-role token from Sanity → API → Tokens).
 *
 * Absent in the base boilerplate and in any deploy without the var, so it is
 * `undefined` and every path that uses it stays inert — mirroring how
 * `sanityConfigured` gates data fetching. Nothing here throws at module load.
 *
 * next-sanity forwards this to the browser only through its own `browserToken`
 * mechanism, and only while Next.js draft mode is active. Never expose it as
 * `NEXT_PUBLIC_*` and never import it into a client component.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN || undefined;

/** True once Sanity is configured *and* a read token is present. */
export const sanityReadConfigured = sanityConfigured && readToken !== undefined;
