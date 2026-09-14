# Website Boilerplate

An opinionated starter for building websites on a fixed stack:

**Next.js (App Router) · React Aria Components · Tailwind v4 · Sanity · GSAP · Lucide · Inter → Vercel**

- Accessible components from React Aria, pre-styled with a swappable design-token
  system (CSS variables → Tailwind `@theme`).
- A Storybook of that component set (`pnpm storybook`) — every variant and
  interaction state, on a light or dark surface, rendered against the app's own
  stylesheet. See `docs/storybook.md`.
- Embedded Sanity Studio at `/studio` with live content.
- Scroll-triggered motion via GSAP (`@gsap/react`).
- SEO out of the box (metadata, sitemap, robots, dynamic OG image). No analytics
  by default — no cookie banner needed.
- One-command project setup (GitHub · Sanity · Vercel · deploy).
- Optional modules (three.js today) offered at setup — heavy dependencies are
  opt-in, so a site that never needs 3D never carries it.

## Use it

This is a **GitHub template repo**. Start a new site from it — the template
gives the new repo a fresh history and its own `origin`:

```bash
# creates a new PRIVATE repo from the template and clones it
gh repo create my-site --template reidotdev/BMT-214A --private --clone
cd my-site
pnpm install
pnpm setup     # names the project, wires env, links Sanity + Vercel, first deploy
pnpm dev       # http://localhost:3000  (Studio at /studio)
```

No `gh`? Use the green **“Use this template”** button on the repo page, then
clone your new repo and run `pnpm install && pnpm setup`. (`pnpm setup` detects
the existing `origin` and skips repo creation.)

Then run the **design-discovery** skill to fill in `docs/design.md`, apply your
token overrides in `src/app/globals.css`, and build.

## Optional modules

Setup asks about a short list of heavier capabilities, one question each,
defaulting to **no**. Say no and nothing is installed or copied — the template
stays exactly as it is.

| Module  | Adds                                                                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `three` | `three` + `@types/three`, and `docs/3d.md` — how to ship 3D without putting 127 KB in the main bundle or 3D content out of reach of crawlers and screen readers |

Skipped one and need it now?

```bash
node scripts/setup.mjs --modules-only   # just that step, on an existing project

# …or by hand, which is all that step does:
pnpm add three && pnpm add -D @types/three
cp scripts/modules/three/3d.md docs/3d.md
```

New modules are a data edit to `MODULES` in `scripts/setup.mjs` — see
`CLAUDE.md`.

## Scripts

| Command                                        | Does                                             |
| ---------------------------------------------- | ------------------------------------------------ |
| `pnpm dev`                                     | Local dev server                                 |
| `pnpm storybook`                               | Component library on port 6006                   |
| `pnpm build-storybook`                         | Static Storybook into `storybook-static/`        |
| `pnpm build` / `pnpm start`                    | Production build / serve                         |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | The checks CI runs                               |
| `pnpm typegen`                                 | Regenerate Sanity query types after schema edits |
| `pnpm setup`                                   | Scaffold a new project end-to-end                |
| `node scripts/setup.mjs --modules-only`        | Re-run only the optional-modules step            |

## Environment

Copy `.env.example` → `.env.local` (or let `pnpm setup` do it). The app builds
without Sanity configured; data access is guarded by `sanityConfigured`.

See `CLAUDE.md` for the full operating manual and conventions.
