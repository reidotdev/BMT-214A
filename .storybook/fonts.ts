import { Inter } from "next/font/google";

/**
 * The app's typeface, declared exactly as `src/app/layout.tsx` declares it.
 *
 * It is duplicated rather than imported because `layout.tsx` also exports route
 * metadata and the root <html> tree; pulling that into Storybook would drag the
 * whole app shell with it. Keep the two declarations in sync — a project that
 * adds a display face (`next/font/local`) adds it here as well, or headings in
 * Storybook stop matching headings in the app.
 *
 * `@storybook/nextjs-vite` implements `next/font`, so this is the real,
 * self-hosted, subsetted file — not a lookalike pulled from a CDN.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Put on the wrapper around every story: defines --font-inter. */
export const fontVariables = inter.variable;
