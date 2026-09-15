#!/usr/bin/env node
/**
 * Template invariants — the things that break silently.
 *
 *   pnpm verify:template
 *
 * Every check here exists because the failure it catches produced no error at
 * the time it happened: a focus ring that stops painting, a typecheck that
 * can't see Next's generated globals, an ESLint ignore that quietly stops
 * matching, a scaffolder that rewrites a file the app imports from. CI runs
 * this, and `pnpm scaffold` runs it last, so a bootstrap that clobbers the
 * boilerplate is reported in the same session that caused it — not on the
 * first failed deploy.
 *
 * No dependencies; Node built-ins only, so it runs before `pnpm install`.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

const failures = [];
const checks = [];

function check(name, fn) {
  try {
    const problem = fn();
    if (problem) {
      failures.push({ name, problem });
      checks.push({ name, ok: false });
    } else {
      checks.push({ name, ok: true });
    }
  } catch (error) {
    failures.push({ name, problem: error.message });
    checks.push({ name, ok: false });
  }
}

const read = (path) => readFileSync(path, "utf8");
const pkg = JSON.parse(read("package.json"));

check("sanity/env.ts still exports its guards", () => {
  const env = read("src/sanity/env.ts");
  const missing = ["sanityConfigured", "safeProjectId"].filter(
    (name) => !new RegExp(`export const ${name}\\b`).test(env),
  );
  if (missing.length) {
    return (
      `src/sanity/env.ts is missing: ${missing.join(", ")}. ` +
      "layout.tsx and page.tsx import these, so the build fails with " +
      '"Export sanityConfigured doesn\'t exist in target module". ' +
      "A `sanity init` run in this directory is the usual cause — " +
      "restore the file from git."
    );
  }
  return null;
});

check("sanity/env.ts refuses a malformed project id", () => {
  const env = read("src/sanity/env.ts");
  // The value that reaches a deployed build is not the value you typed. It has
  // been through a .env file, `vercel env add` and a dashboard, any of which can
  // hand it back wrapped in quotes or carrying a stray \r. `createClient()` runs
  // at module load in a file the root layout imports, so one bad character there
  // takes down every route — including the ones that never touch Sanity.
  if (!/a-z0-9-/.test(env)) {
    return (
      "src/sanity/env.ts no longer validates NEXT_PUBLIC_SANITY_PROJECT_ID " +
      "against Sanity's own rule (a-z, 0-9, dashes). Without it a quoted or " +
      'padded value reaches createClient() and the build dies with "`projectId` ' +
      'can only contain only a-z, 0-9 and dashes" — which is how the first ' +
      "production deploy of a scaffolded site failed."
    );
  }
  if (!/\.trim\(\)/.test(env) || !/\['"\]/.test(env)) {
    return (
      "src/sanity/env.ts no longer strips surrounding quotes and whitespace " +
      'from its env values. Sanity\'s own `init --env` writes KEY="value" with ' +
      "the quotes included, and they travel to the host verbatim."
    );
  }
  return null;
});

check("any .env.local present holds usable Sanity values", () => {
  // Only meaningful on a developer machine — .env.local is gitignored, so in CI
  // there is nothing to check and nothing to complain about.
  if (!existsSync(".env.local")) return null;

  const vars = new Map();
  for (const line of read(".env.local").split("\n")) {
    const match = line
      .trim()
      .match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*)$/);
    if (!match || line.trim().startsWith("#")) continue;
    // Last assignment wins, the way a runtime reads it.
    vars.set(match[1], match[2].trim());
  }

  const problems = [];
  const rules = [
    ["NEXT_PUBLIC_SANITY_PROJECT_ID", /^[a-z0-9-]+$/, "a-z, 0-9 and dashes"],
    [
      "NEXT_PUBLIC_SANITY_DATASET",
      /^[a-z0-9_-]+$/,
      "a-z, 0-9, underscores and dashes",
    ],
  ];
  for (const [key, rule, allowed] of rules) {
    const value = vars.get(key);
    if (!value) continue; // absent is fine: the app builds unconfigured
    if (!rule.test(value)) {
      problems.push(
        `${key}=${value} — only ${allowed} are allowed. Quotes around the value ` +
          "are the usual cause; they survive a push to the host and break the build there.",
      );
    }
  }
  if (problems.length) return problems.join("\n  ");
  return null;
});

check("focus ring restores outline-style on focus", () => {
  const styles = read("src/components/ui/styles.ts");
  // Match the exported value, not the file — the explanatory comment above
  // focusRing names the same class, and a whole-file search would be
  // satisfied by the comment alone while the ring stayed broken.
  const value = styles.match(/export const focusRing\s*=\s*([\s\S]*?);/)?.[1];
  if (!value) {
    return "src/components/ui/styles.ts no longer exports `focusRing`.";
  }
  if (!value.includes("data-[focus-visible]:outline-solid")) {
    return (
      "focusRing is missing `data-[focus-visible]:outline-solid`. " +
      "`outline-hidden` sets --tw-outline-style: none and Tailwind v4's " +
      "`outline-2` reads that variable, so the ring computes to " +
      "outline-style: none and NO component paints a keyboard focus " +
      "indicator. See src/components/ui/styles.ts."
    );
  }
  return null;
});

check("typecheck generates Next's route types first", () => {
  if (!pkg.scripts?.typecheck?.includes("next typegen")) {
    return (
      "`typecheck` must run `next typegen` before tsc. The App Router's " +
      "PageProps/LayoutProps globals live in .next/types, which is " +
      "gitignored and only written by typegen — bare `tsc --noEmit` fails " +
      "with \"Cannot find name 'LayoutProps'\" on a clean checkout."
    );
  }
  return null;
});

check("eslint ignores build output at any depth", () => {
  const config = read("eslint.config.mjs");
  const unprefixed = ['".next/**"', '"out/**"', '"build/**"'].filter(
    (pattern) => config.includes(pattern),
  );
  if (unprefixed.length) {
    return (
      `eslint.config.mjs has root-relative ignore(s): ${unprefixed.join(", ")}. ` +
      "Prefix them with `**/` — otherwise build output inside nested " +
      "checkouts (.claude/worktrees/*/.next) is linted, which reports tens " +
      "of thousands of problems and takes minutes."
    );
  }
  return null;
});

check("every Sanity schema type is registered", () => {
  const dir = "src/sanity/schemaTypes";
  if (!existsSync(dir)) return null;
  const index = read(`${dir}/index.ts`);
  const orphans = readdirSync(dir)
    .filter((file) => file.endsWith(".ts") && file !== "index.ts")
    .map((file) => file.replace(/\.ts$/, ""))
    .filter((name) => !index.includes(name));
  if (orphans.length) {
    return (
      `Schema type(s) not imported by ${dir}/index.ts: ${orphans.join(", ")}. ` +
      "An unregistered type the Studio structure references breaks the " +
      "Studio at runtime. Either register it or delete the file — " +
      "`sanity init` drops starter types here uninvited."
    );
  }
  return null;
});

check("Sanity packages agree on a major version", () => {
  const major = (range) => range?.replace(/^[^\d]*/, "").split(".")[0];
  const studio = major(pkg.dependencies?.sanity);
  const vision = major(pkg.dependencies?.["@sanity/vision"]);
  if (studio && vision && studio !== vision) {
    return `sanity@${studio} and @sanity/vision@${vision} are different majors — they must match.`;
  }
  if (pkg.dependencies?.["styled-components"]) {
    return (
      "styled-components is a direct dependency. Sanity Studio v6 does not " +
      "need it — its presence means something moved the Studio back to v5, " +
      "almost certainly a `sanity init` run in this directory."
    );
  }
  return null;
});

check("no package script is shadowed by a pnpm built-in", () => {
  // `pnpm <name>` prefers pnpm's OWN command over a script of the same name,
  // silently. `pnpm setup` was documented as this project's scaffolder for
  // months while actually running pnpm's built-in setup, which edits the
  // user's shell profile and never scaffolds anything. Only `pnpm run <name>`
  // is unambiguous — so keep script names off this list entirely.
  //
  // `start` and `test` are deliberately absent: pnpm's versions of those DO
  // run the matching script.
  const reserved = new Set([
    "access",
    "add",
    "audit",
    "bin",
    "config",
    "create",
    "dedupe",
    "deploy",
    "dlx",
    "doctor",
    "env",
    "exec",
    "fetch",
    "help",
    "import",
    "init",
    "install",
    "licenses",
    "link",
    "list",
    "ln",
    "outdated",
    "pack",
    "patch",
    "prune",
    "publish",
    "rebuild",
    "recursive",
    "remove",
    "root",
    "run",
    "server",
    "setup",
    "store",
    "unlink",
    "update",
    "why",
  ]);

  const shadowed = Object.keys(pkg.scripts ?? {}).filter((name) =>
    reserved.has(name),
  );
  if (shadowed.length) {
    return (
      `package.json script(s) shadowed by a pnpm built-in: ${shadowed.join(", ")}. ` +
      `\`pnpm ${shadowed[0]}\` will run pnpm's own command, not this script, ` +
      "with no warning. Rename the script (e.g. `setup` -> `scaffold`)."
    );
  }
  return null;
});

check("next/image can load Sanity's CDN", () => {
  const config = read("next.config.ts");
  if (!config.includes("cdn.sanity.io")) {
    return (
      "next.config.ts does not allow cdn.sanity.io in images.remotePatterns, " +
      "so every Sanity image throws the moment it renders through next/image."
    );
  }
  return null;
});

const pad = Math.max(...checks.map((c) => c.name.length));
for (const { name, ok } of checks) {
  const mark = ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`  ${mark} ${name.padEnd(pad)}`);
}

if (failures.length) {
  console.error(
    `\n\x1b[31m${failures.length} template invariant(s) broken\x1b[0m\n`,
  );
  for (const { name, problem } of failures) {
    console.error(`\x1b[1m${name}\x1b[0m\n  ${problem}\n`);
  }
  process.exit(1);
}

console.log("\n\x1b[32mTemplate invariants hold.\x1b[0m");
