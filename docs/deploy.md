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

## Catching all of this before you deploy

```bash
pnpm verify:template   # validates .env.local's Sanity values, among other things
pnpm build             # the same build Vercel runs
```

`pnpm verify:template` is the cheap one, and it is the check that would have
caught the quoted project id above.
