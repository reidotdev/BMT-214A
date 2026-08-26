@AGENTS.md

# Website Boilerplate — Operating Manual

A starter for building websites on a fixed, opinionated stack. Clone it, run
`pnpm setup`, do design discovery, then build. This file is the always-loaded
manual; deeper procedures live in `.claude/skills/`.

## Stack (fixed)

| Concern    | Choice                                                                        |
| ---------- | ----------------------------------------------------------------------------- |
| Framework  | **Next.js (App Router)**, React 19, TypeScript strict                         |
| Components | **React Aria Components** — accessibility + interaction patterns built in     |
| Styling    | **Tailwind CSS v4** (CSS-first `@theme`), `tailwindcss-react-aria-components` |
| Icons      | **Lucide** (`lucide-react`)                                                   |
| CMS        | **Sanity**, Studio embedded at `/studio`                                      |
| Animation  | **GSAP** (`@gsap/react`)                                                      |
| Font       | **Inter** (`next/font`)                                                       |
| Hosting    | **Vercel** · **Package manager: pnpm**                                        |

## Golden rules

1. **Keep RAC behavior; restyle only presentation.** Never swap an interactive
   React Aria element for a plain `div`. Accessibility and keyboard behavior come
   from RAC and must survive every restyle. See `.claude/skills/restyle-component.md`.
2. **Design tokens are the swappable layer.** Colors, radii, and fonts are CSS
   variables in `src/app/globals.css`, mapped onto Tailwind via `@theme inline`.
   Re-theme by editing those variables — never hardcode hex values in components.
   Genuinely bespoke, one-off visuals go in scoped CSS / arbitrary utilities, not
   the token layer.
3. **Style RAC state with `data-*` variants** — `data-[hovered]`, `data-[pressed]`,
   `data-[selected]`, `data-[focus-visible]`, `data-[disabled]`, `data-[entering]`,
   `data-[exiting]`. Merge caller `className` with `composeRenderProps`.
4. **The core component set is a starting point, not a ceiling.** Pull any other
   component from `react-aria-components` and style it the same way.
5. **Discovery before UI.** A new project starts with the `design-discovery`
   skill, which writes `docs/design.md`. Build against that document.
6. **Sanity access is guarded.** `src/sanity/env.ts` exposes `sanityConfigured`;
   the app builds and runs before Sanity is set up. Keep it that way.

## Layout

```
src/
  app/            # routes; /studio embeds Sanity Studio; sitemap/robots/og here
  components/
    ui/           # pre-styled React Aria Components (the core set + index.ts)
    motion/       # GSAP helpers (Reveal, …)
  lib/            # cn(), siteConfig
  sanity/         # env, client, image, live, queries, schemaTypes, structure
docs/design.md    # per-project design decisions (source of truth for the build)
scripts/setup.mjs # one-command project setup (GitHub + Sanity + Vercel + deploy)
```

## Commands

- `pnpm dev` — local dev (open `/studio` for the CMS)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` · `pnpm typecheck` · `pnpm format` — the checks CI runs
- `pnpm typegen` — regenerate Sanity query types after editing schemas
- `pnpm setup` — scaffold a new project (naming, env, repo, Sanity, Vercel)

## Skills

- **design-discovery** — the new-project interview → writes `docs/design.md`.
- **restyle-component** — add/re-skin a React Aria Component the right way.

## SEO & analytics

SEO ships on: Metadata API, `sitemap.ts`, `robots.ts` (excludes `/studio`),
dynamic `opengraph-image`. **No analytics** is wired by default (so no cookie
banner is needed) — add it per project if wanted.

## Conventions

- kebab-case filenames; components in PascalCase exports.
- Never hardcode colors — use tokens. Never break keyboard/focus behavior.
- Gate non-essential motion behind `prefers-reduced-motion`.
- Keep the build green without credentials; guard external data.

## The React Aria MCP

Prefer the official React Aria MCP (https://react-aria.adobe.com/ai) for correct,
current component APIs when adding/restyling components — over memory. It's wired
project-scoped in `.mcp.json` (runs locally via `npx @react-aria/mcp`, no auth);
approve it when your client prompts on first use.
