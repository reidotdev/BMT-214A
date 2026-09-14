import { createClient } from "next-sanity";
import { apiVersion, dataset, safeProjectId } from "../env";

/**
 * Plain Sanity client. Use it where `sanityFetch` cannot go — most notably
 * `generateStaticParams`, which runs at build time and so cannot read
 * `draftMode()`. Everywhere else prefer `sanityFetch` from ./live.
 *
 * `useCdn: false` because the Live Content API and tag-based revalidation are
 * in play: the CDN would serve a cached copy and defeat both.
 */
export const client = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: false,
});
