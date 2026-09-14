// Live content API (next-sanity). `sanityFetch` fetches content and, paired
// with <SanityLive /> mounted in the layout, revalidates in real time as
// content changes in the Studio.
import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { apiVersion } from "../env";
import { readToken } from "./token";

// `serverToken` lets sanityFetch read drafts and non-published perspectives on
// the server; `browserToken` lets <SanityLive /> stream draft updates to the
// browser — but only while Next.js draft mode is active, which is what the
// /api/draft-mode routes turn on. Both come from the same read token.
//
// When it is absent we pass `false` rather than `undefined`: that keeps
// defineLive on published content only AND silences its dev-mode warning, so
// the app runs exactly as it did before Sanity was configured.
const token = readToken ?? false;

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ apiVersion }),
  serverToken: token,
  browserToken: token,
});

/**
 * NOTE — `sanityFetch` reads `draftMode()`, which is a request-scoped API. It
 * therefore throws inside `generateStaticParams`, which runs at build time with
 * no request:
 *
 *     Route /x/[slug] used `draftMode()` inside `generateStaticParams`.
 *
 * Use the plain `client` there instead (see src/sanity/lib/client.ts).
 * Published content is the correct perspective for a static param list anyway,
 * and the route's own data fetching still goes through `sanityFetch`.
 */
