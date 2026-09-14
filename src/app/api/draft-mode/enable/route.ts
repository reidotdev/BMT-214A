import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/token";

/**
 * Turns Next.js draft mode on, which is what lets <SanityLive /> stream
 * unpublished changes. The Studio's Presentation tool calls this route.
 *
 * Inert without SANITY_API_READ_TOKEN: `defineEnableDraftMode` needs a token to
 * validate the request, so with none present we answer 404 rather than throwing
 * at module load — the app still builds and runs with no credentials.
 */
export const { GET } = readToken
  ? defineEnableDraftMode({ client: client.withConfig({ token: readToken }) })
  : {
      GET: async () =>
        new Response("Draft mode is not configured", { status: 404 }),
    };
