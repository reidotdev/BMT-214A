# Website Boilerplate

An opinionated starter for building websites on a fixed stack:

**Next.js (App Router) · React Aria Components · Tailwind v4 · Sanity · GSAP · Lucide · Inter → Vercel**

- Accessible components from React Aria, pre-styled with a swappable design-token
  system (CSS variables → Tailwind `@theme`).
- Embedded Sanity Studio at `/studio` with live content.
- Scroll-triggered motion via GSAP (`@gsap/react`).
- SEO out of the box (metadata, sitemap, robots, dynamic OG image). No analytics
  by default — no cookie banner needed.
- One-command project setup (GitHub · Sanity · Vercel · deploy).

## Use it

This is a **GitHub template repo**. Create a new repo from it (or `degit`), then:

```bash
pnpm install
pnpm setup     # names the project, wires env, creates a private repo, links Sanity + Vercel
pnpm dev       # http://localhost:3000  (Studio at /studio)
```

Then run the **design-discovery** skill to fill in `docs/design.md`, apply your
token overrides in `src/app/globals.css`, and build.

## Scripts

| Command                                        | Does                                             |
| ---------------------------------------------- | ------------------------------------------------ |
| `pnpm dev`                                     | Local dev server                                 |
| `pnpm build` / `pnpm start`                    | Production build / serve                         |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | The checks CI runs                               |
| `pnpm typegen`                                 | Regenerate Sanity query types after schema edits |
| `pnpm setup`                                   | Scaffold a new project end-to-end                |

## Environment

Copy `.env.example` → `.env.local` (or let `pnpm setup` do it). The app builds
without Sanity configured; data access is guarded by `sanityConfigured`.

See `CLAUDE.md` for the full operating manual and conventions.
