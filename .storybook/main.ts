import { existsSync } from "node:fs";
import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * Storybook for the component library in `src/components/ui`.
 *
 * Framework is `@storybook/nextjs-vite`, not plain `react-vite`, so stories run
 * through the same Next.js semantics the app does: `next/font`, `next/image`,
 * `next/link` and the `next/navigation` mocks all work. That matters because
 * every UI component is a `"use client"` Next component.
 *
 * Styling comes from the real thing — `.storybook/preview.css` imports
 * `src/app/globals.css`, so stories render against the project's actual Tailwind
 * v4 tokens. There is no second, Storybook-only theme to drift out of sync.
 */
const config: StorybookConfig = {
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },

  // Stories live in `src/stories`, but the glob covers the whole of `src/` so
  // co-locating a `*.stories.tsx` next to a component works too. Add
  // "../src/**/*.mdx" if free-form MDX doc pages are ever wanted — Storybook
  // warns on every start about a pattern that matches nothing.
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-docs", // prop tables + the "Docs" tab
    "@storybook/addon-a11y", // axe audit per story — RAC's whole point
  ],

  // Serves `/public` so stories can reference the same assets as the app —
  // but only once the project has one. Storybook hard-fails ("Failed to load
  // static files, no such directory") on a listed directory that is missing,
  // and a fresh checkout of this boilerplate has no `public/` at all.
  staticDirs: existsSync(new URL("../public", import.meta.url))
    ? ["../public"]
    : [],

  typescript: {
    // Reads real TS types, so prop tables include everything a component
    // inherits from its React Aria base props. `react-docgen` (the default)
    // only sees what is written literally in the component file.
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // RAC props explode into hundreds of handlers and ARIA passthroughs.
      // Hide those; keep the props a person actually sets.
      propFilter: (prop) => !/^(aria-|on[A-Z]|data-)/.test(prop.name),
    },
  },
};

export default config;
