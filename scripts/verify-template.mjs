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
 * this, and `pnpm setup` runs it last, so a bootstrap that clobbers the
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
