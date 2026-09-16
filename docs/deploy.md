# Deploying to Vercel

The scaffolder does this for you (`pnpm scaffold`, step 8). This page is for the
questions it cannot answer on your behalf, and for the first deploy that fails.

## The settings interview — and why the answer is always "no"

Linking a new project, Vercel prints something like:

```
Detected Next.js (Build Command: next build, Output Directory: Next.js default)
? Customize settings? (y/N)
```

**Say no.** The scaffolder passes `--yes`, which does that for you.

Those settings are the framework preset — the commands Vercel runs on its own
build machines. Next.js is detected, so they are already correct:

| Setting                 | Default for this template | When it runs                             |
| ----------------------- | ------------------------- | ---------------------------------------- |
| **Build Command**       | `next build`              | Every deploy, on Vercel's machines.      |
| **Output Directory**    | `.next`                   | What Vercel serves after the build.      |
| **Install Command**     | `pnpm install`            | Before the build, from `pnpm-lock.yaml`. |
| **Development Command** | `next dev`                | Only `vercel dev`. Never in a deploy.    |

The trap is that answering "yes" and then pressing enter on a field **overrides
the default with an empty string**. An empty Build Command does not mean "use
the default" — it means "run nothing", and the deploy ships an empty site or
fails outright. If you have already done this, clear the override in the Vercel
dashboard: **Project → Settings → Build and Deployment**, and click the toggle
next to each field back to off so the framework preset takes over again.

**Development Command** is the one that confuses people most, because it sounds
like it matters. It does not: it is the command `vercel dev` runs to emulate the
platform locally. This template uses `pnpm dev` for local work, so the field is
never read.

## Environment variables

The scaffolder pushes every non-empty value from `.env.local` to all three
Vercel environments, with two rules worth knowing:

- **Values are pushed unquoted.** `.env` quoting is a file-format convention that
  `dotenv` strips when it loads the file. Vercel stores whatever bytes it is
  given, so a value stored as `"abc123"` arrives in `process.env` **with the
  quotes still attached** and every consumer sees a different string than you do
  locally. See the gotcha below.
- **A `localhost` URL goes to development only.** `NEXT_PUBLIC_SITE_URL` is the
  canonical URL in the metadata, the sitemap, `robots.txt` and every OG image.
  Pushed to production as `http://localhost:3000`, it poisons all of them.

Set `NEXT_PUBLIC_SITE_URL` to the real domain as soon as you have one:

```bash
vercel env rm NEXT_PUBLIC_SITE_URL production
printf 'https://example.com' | vercel env add NEXT_PUBLIC_SITE_URL production
```

### Which variables the site needs

| Variable                         | Needed for                    | Missing means                       |
| -------------------------------- | ----------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | All Sanity content            | Site builds, renders no CMS content |
| `NEXT_PUBLIC_SANITY_DATASET`     | All Sanity content            | Defaults to `production`            |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Pinning the query API         | Defaults to `2024-10-01`            |
| `SANITY_API_READ_TOKEN`          | Drafts and live preview       | Published content only              |
| `NEXT_PUBLIC_SITE_URL`           | Metadata, sitemap, robots, OG | Falls back to `localhost:3000`      |

Nothing here is required to build. That is deliberate — see golden rule 6 in
`CLAUDE.md`.

## CORS origins — the other list Sanity keeps

Environment variables tell **this site** how to reach Sanity. CORS origins tell
**Sanity** which browsers are allowed to reach it back. They are separate lists,
kept in different places, and getting the first one right tells you nothing about
the second.

A new Sanity project allows no origins at all. Until one is added, the build is
green, `pnpm dev` starts, the deploy succeeds — and the browser console says:

```
Sanity Live is unable to connect to the Sanity API as the current origin -
http://localhost:3000 - is not in the list of allowed CORS origins for this
Sanity Project.
```

while `/studio` never finishes logging in. `pnpm scaffold` adds the two origins
it knows about (the dev server, and the production URL you gave it) when it
creates the project. Everything else is on you:

```bash
pnpm exec sanity cors add https://example.com --credentials
pnpm exec sanity cors list
```

### Why `--credentials`

An origin allowed **without** credentials can read published content and nothing
else. The browser is not permitted to send the session cookie or an
`Authorization` header with the request, so:

- the embedded Studio at `/studio` cannot authenticate — login goes round in a
  circle,
- `SanityLive` cannot stream drafts,
- anything behind the read token stays invisible.

So every origin that serves the Studio or previews drafts needs
`--credentials`. An origin that only serves published content does not, and is
safer without it.

### Wildcards, and why not to reach for one

`sanity cors add` accepts a wildcard — `https://*.vercel.app` — and it is exactly
the wrong tool for a preview deploy:

> **A wildcard origin allowed with credentials lets any page on that domain make
> authenticated requests to your project.** `https://*.vercel.app` means every
> Vercel deployment in the world, belonging to anyone, can ask your project for
> drafts using a visitor's session. Sanity makes you confirm this (`--yes`); the
> scaffolder never adds one.

Vercel preview deployments get a fresh random URL per commit, so they will not be
on the allow-list and **previews show published content only**. That is the
right default. If you genuinely need drafts in previews, either add each preview
URL by hand while you need it, or add a wildcard _without_ `--credentials` and
accept that drafts stay out of them.

The domains worth adding once and keeping:

| Origin                         | Credentials | Why                                        |
| ------------------------------ | ----------- | ------------------------------------------ |
| `http://localhost:3000`        | yes         | local dev + the Studio at `/studio`        |
| `https://your-domain.com`      | yes         | the production Studio and live preview     |
| `https://your-site.vercel.app` | yes         | the stable production alias, if you use it |

Remove one with `pnpm exec sanity cors delete <origin>`, and check the whole list
in the dashboard under **Project → API → CORS origins**.

## When the first production deploy fails

Read the build log from the top; the first error is the real one.

**``projectId` can only contain only a-z, 0-9 and dashes``** — the project id
reaching the build is not what you think it is. Almost always quotes:

```
NEXT_PUBLIC_SANITY_PROJECT_ID="abc123"    ← stored with the quotes
```

Check it in **Project → Settings → Environment Variables**, or:

```bash
vercel env pull .env.vercel   # then look at the file
```

`src/sanity/env.ts` now strips surrounding quotes and whitespace before use, and
treats a value it still cannot parse as "Sanity not configured" — with a warning
in the build log — rather than throwing. So this should no longer take a deploy
down. Fix the value anyway: a warning means the site is building without its CMS.

**`Export sanityConfigured doesn't exist in target module`** — something
overwrote `src/sanity/env.ts`. Running `sanity init` by hand in this directory is
the only known cause. `git checkout src/sanity/env.ts`, then read gotcha 4 in
`CLAUDE.md`.

**The build passes but every page is empty** — `sanityConfigured` is false.
Either the project id is absent from that environment, or it was rejected; the
build log says which.

**The deploy is green but `/studio` will not log in** — nothing is wrong with
the deploy. The deployed origin is not on the project's CORS list, or it is on
it without credentials. See the section above; `pnpm exec sanity cors list` is
the fastest answer.

## Catching all of this before you deploy

```bash
pnpm verify:template   # validates .env.local's Sanity values, among other things
pnpm build             # the same build Vercel runs
```

`pnpm verify:template` is the cheap one, and it is the check that would have
caught the quoted project id above.
