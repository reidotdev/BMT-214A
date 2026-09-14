@AGENTS.md

# Website Boilerplate — Operating Manual

A starter for building websites on a fixed, opinionated stack. Clone it, run
`pnpm scaffold`, do design discovery, then build. This file is the always-loaded
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
| Comp. docs | **Storybook** (`@storybook/nextjs-vite`) — one story per `ui` component       |
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
   component from `react-aria-components` and style it the same way. Every
   component in `src/components/ui/` has a story in `src/stories/` — that is
   where the set is browsed, and where a new or restyled one has to land too
   (`pnpm storybook`, `docs/storybook.md`).
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
    layout/       # Section — the content band every page section uses
    media/        # BackgroundVideo and friends
    motion/       # GSAP helpers (Reveal, …)
  lib/            # cn(), siteConfig
  sanity/         # env, client, image, live, queries, schemaTypes, structure
  stories/        # one *.stories.tsx per ui component + Foundations/tokens
.storybook/       # Storybook config; preview.css imports the app's globals.css
docs/design.md    # per-project design decisions (source of truth for the build)
docs/storybook.md # running, writing and deploying the component library
scripts/setup.mjs # one-command project setup (GitHub + Sanity + Vercel + deploy)
```

## Starting a new site

This repo is a **GitHub template**. Generate a new site from it (fresh history,
its own `origin`), then run setup:

```bash
gh repo create my-site --template reidotdev/BMT-214A --private --clone
cd my-site && pnpm install && pnpm scaffold
```

(Or use the "Use this template" button, clone, then `pnpm install && pnpm scaffold`.
`pnpm scaffold` detects the template's existing `origin` and skips repo creation.)

## Commands

- `pnpm dev` — local dev (open `/studio` for the CMS)
- `pnpm storybook` — the component library on port 6006; `pnpm build-storybook`
  for a static build. The whole design system at a glance, on a light or dark
  surface — the fastest way to see a token change land. See `docs/storybook.md`.
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` · `pnpm typecheck` · `pnpm format` — the checks CI runs
- `pnpm verify:template` — assert the invariants below still hold
- `pnpm test:e2e` — Playwright: keyboard focus + an axe pass (Chromium only)
- `pnpm typegen` — regenerate Sanity query types after editing schemas
- `pnpm scaffold` — scaffold a new project (naming, env, repo, Sanity, modules,
  Vercel)
- `node scripts/setup.mjs --modules-only` — re-run just the optional-modules
  step on a project that is already set up

## Optional modules

Some capabilities are too heavy to hand every site, so the template ships
**without** them and `pnpm scaffold` offers them once (step 7, defaulting to no).
Declining costs nothing: no dependency, no file, nothing to clean up later.

| Module  | Adds                                          | The point                                                                                                                           |
| ------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `three` | `three`, `@types/three`, and **`docs/3d.md`** | 3D/WebGL. ~127 KB gzipped when it loads; `docs/3d.md` is the recipe that keeps it out of the main bundle and the content in the DOM |

There is no starter 3D component on purpose — a half-built scene is worse than
none. `docs/3d.md` is the thing worth having.

**Adding a module to a project that skipped it** takes a minute, either way:

```bash
node scripts/setup.mjs --modules-only   # re-runs just that step

# …or by hand — the same two things that step does:
pnpm add three && pnpm add -D @types/three
cp scripts/modules/three/3d.md docs/3d.md
```

**Adding a new _kind_ of module** is a data edit, not new control flow: append an
entry to `MODULES` in `scripts/setup.mjs` (`id`, `label`, `description`,
`dependencies`, `devDependencies`, `files`) and put whatever it copies under
`scripts/modules/<id>/`. Keep each payload there rather than in its destination,
so a project that declines carries none of it.

## Skills

- **design-discovery** — the new-project interview → writes `docs/design.md`.
- **restyle-component** — add/re-skin a React Aria Component the right way, and
  land its story alongside it.
- **technical-plan** — plan a large feature in `docs/`, then annotate it with
  what the build actually found.

## SEO & analytics

SEO ships on: Metadata API, `sitemap.ts`, `robots.ts` (excludes `/studio`),
dynamic `opengraph-image`. **No analytics** is wired by default (so no cookie
banner is needed) — add it per project if wanted.

## Gotchas that cost a day

Every item here failed silently — no error, no failing check, nothing in the
console. `pnpm verify:template` now catches most of them; read this before
debugging anything in the list.

1. **The focus ring and `outline-hidden`.** `outline-hidden` sets
   `--tw-outline-style: none`, and Tailwind v4's `outline-2` emits
   `outline-style: var(--tw-outline-style)`. Combined without
   `data-[focus-visible]:outline-solid`, the ring computes to
   `outline-style: none` and **no component paints a keyboard focus
   indicator**. See `src/components/ui/styles.ts`; `e2e/a11y.spec.ts` guards it.
   Note that inspecting the compiled CSS does NOT prove this works — Tailwind
   generates a utility whenever the class name appears anywhere in the source,
   a code comment included. Only a computed style on a really focused element
   settles it.
2. **`tsc` cannot see `PageProps` / `LayoutProps`.** Those globals live in
   `.next/types`, which is gitignored and written by `next typegen`. `pnpm
typecheck` runs typegen first for exactly this reason — a bare `tsc
--noEmit` fails on every clean checkout.
3. **Tailwind v4 tree-shakes theme variables.** Point a token at one of
   Tailwind's own colour vars (`var(--color-slate-900)`) and, unless some
   utility references that shade, the variable is never emitted and the token
   resolves to nothing — every colour on the site, silently. Use
   `@import "tailwindcss" theme(static)` while the palette is unsettled, then
   inline literals and drop it. Details in `src/app/globals.css`.
4. **`sanity init` rewrites files it does not own.** It replaces
   `src/sanity/env.ts` with a version that has no `sanityConfigured` export —
   which `layout.tsx` imports, so the next build dies with
   `Export sanityConfigured doesn't exist in target module` — reverts
   `sanity.config.ts` / `sanity.cli.ts`, drops starter schema types in, and
   rewrites `package.json` (observed: a whole-major Sanity downgrade, which
   then pulled in `styled-components`). `scripts/setup.mjs` snapshots and
   restores those paths around the call; if you run `sanity init` by hand,
   `git diff` before committing.
5. **`sanityFetch` cannot run in `generateStaticParams`.** It reads
   `draftMode()`, a request-scoped API, and `generateStaticParams` runs at
   build time with no request. Use the plain `client` there instead.
6. **ESLint ignore patterns must be `**/`-prefixed.** Root-relative patterns
   miss build output in nested checkouts (`.claude/worktrees/*/.next`), and
   lint then walks tens of thousands of generated files.
7. **`pnpm <name>` prefers pnpm's own command over your script.** Silently,
   with no warning. This project's scaffolder was documented as `pnpm setup`
   while `pnpm setup` actually ran pnpm's built-in command, which edits the
   user's shell profile and scaffolds nothing — so the documented first-run
   command never worked. It is `pnpm scaffold` now, and
   `pnpm verify:template` fails if any script name collides with a pnpm
   built-in. When in doubt, `pnpm run <name>` is always unambiguous.
8. **Contrast is measured against the darkest surface, not white.**
   `--muted-foreground` renders on `--muted` and `--secondary` as well as on
   the page background. The default previously measured 4.45:1 on `--muted` —
   under the AA floor — while passing on white. Re-theme accordingly; the axe
   test catches it.

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
