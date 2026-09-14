#!/usr/bin/env node
/**
 * Per-project setup for a site cloned from this boilerplate.
 *
 *   pnpm scaffold
 *
 * Walks through: naming the project, wiring env, GitHub (pushes to the existing
 * origin when generated from the template, else creates a PRIVATE repo),
 * initializing Sanity, template invariants, optional modules, linking Vercel,
 * and a first deploy. Every remote/irreversible step asks first. Missing CLIs
 * are reported, not fatal — you can run those steps by hand and re-run.
 *
 *   node scripts/setup.mjs --modules-only
 *
 * runs just the optional-modules step, for a project that skipped a module the
 * first time round and has since grown into needing it.
 *
 *   node scripts/setup.mjs --config scaffold.config.json --non-interactive
 *
 * takes every answer from a JSON file and never reads stdin. This is what makes
 * the template usable from a phone, a web session, or CI: an assistant (or you)
 * writes the config, and the scaffolder runs headless. Steps whose CLI is
 * missing are skipped, not fatal, and every one of them is listed at the end
 * with the exact command to finish it later. See scaffold.config.example.json.
 *
 * Requires (only for the steps that use them): gh, sanity, vercel — all logged in.
 * No external npm deps; Node built-ins only.
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  cpSync,
  rmSync,
  mkdtempSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync, spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// Created on the first question rather than at import time, so importing this
// file — to exercise the module table from a test, say — neither holds stdin
// open nor leaves a dangling interface.
let rl;
const question = (q) => {
  rl ??= createInterface({ input: stdin, output: stdout });
  return rl.question(q);
};

const c = {
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const ARGV = process.argv.slice(2);

/** Read a flag's value: `--config path` or `--config=path`. */
function flag(name) {
  const i = ARGV.indexOf(`--${name}`);
  if (i !== -1) return ARGV[i + 1] ?? true;
  const inline = ARGV.find((a) => a.startsWith(`--${name}=`));
  return inline ? inline.slice(name.length + 3) : undefined;
}

const CONFIG_PATH = flag("config");
const CONFIG = CONFIG_PATH
  ? JSON.parse(readFileSync(String(CONFIG_PATH), "utf8"))
  : {};

/**
 * Headless mode: every answer comes from the config file and stdin is never
 * read. Passing --config implies it, because a config file and an interview
 * answering the same questions is a contradiction — pass neither to get the
 * interactive walkthrough.
 */
const NON_INTERACTIVE =
  ARGV.includes("--non-interactive") || ARGV.includes("--yes") || !!CONFIG_PATH;

/** Look up a dotted path in the config: `pick("vercel.deploy")`. */
function pick(path) {
  return path
    .split(".")
    .reduce((node, key) => (node == null ? undefined : node[key]), CONFIG);
}

/**
 * Things the run could not finish — almost always a missing CLI. Collected as
 * they happen and printed at the end, because in headless mode nobody is
 * watching the scroll go past.
 */
const todo = [];
const defer = (what, how) => {
  todo.push({ what, how });
  console.log(c.yellow(`  → deferred: ${what}`));
};

const ask = async (key, q, def = "") => {
  if (NON_INTERACTIVE) {
    const chosen = pick(key) ?? def;
    console.log(`  ${q}: ${c.dim(String(chosen) || "(empty)")}`);
    return chosen;
  }
  const a = (await question(`${q}${def ? c.dim(` (${def})`) : ""}: `)).trim();
  return a || def;
};

/**
 * `deferHint` ({ what, how }) makes a third answer possible in the config:
 * the string "later" means "I want this, but this environment cannot do it".
 * It is not the same as false, which means "I don't want it" — and the
 * difference matters most in the case this mode exists for. Scaffolding from a
 * phone cannot reach the Sanity or Vercel CLIs, so those steps must end up in
 * the closing to-do list rather than being silently dropped.
 */
const confirm = async (key, q, deferHint) => {
  if (NON_INTERACTIVE) {
    const chosen = pick(key) ?? false;

    if (chosen === "later" && deferHint) {
      console.log(`  ${q} ${c.dim("later")}`);
      defer(deferHint.what, deferHint.how);
      return false;
    }

    // Absent means no. A headless run must never do something remote or
    // irreversible because a key was forgotten.
    console.log(`  ${q} ${c.dim(chosen ? "yes" : "no")}`);
    return chosen === true;
  }
  return /^y(es)?$/i.test((await question(`${q} ${c.dim("[y/N]")} `)).trim());
};
const has = (cmd) =>
  spawnSync(cmd, ["--version"], { stdio: "ignore" }).status === 0;
const run = (cmd) => {
  console.log(c.dim(`  $ ${cmd}`));
  execSync(cmd, { stdio: "inherit" });
};
const step = (n, title) => console.log(`\n${c.b(`[${n}] ${title}`)}`);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Optional modules — capabilities a site may need and most sites do not, so the
 * template ships without them and setup offers each one once, defaulting to no.
 * Saying no must stay free: nothing installed, nothing copied, nothing to clean
 * up afterwards.
 *
 * Adding the next module is a data edit here, not new control flow. Give it an
 * id, a label, one line on what it is for and what it costs, the packages to
 * install, and any files to copy in from `scripts/modules/<id>/`. Module files
 * live there rather than in their destination so a project that skips the
 * module never carries the payload.
 */
export const MODULES = [
  {
    id: "three",
    label: "three.js — 3D / WebGL",
    description:
      "Real 3D in the page. ~127 KB gzipped when it loads; docs/3d.md is the recipe that keeps it out of the main bundle and the content accessible.",
    dependencies: ["three"],
    devDependencies: ["@types/three"],
    files: [{ from: "scripts/modules/three/3d.md", to: "docs/3d.md" }],
  },
];

/** Installed = every package the module adds is already in package.json. */
export function moduleInstalled(mod, pkg) {
  const present = { ...pkg.dependencies, ...pkg.devDependencies };
  return [...(mod.dependencies ?? []), ...(mod.devDependencies ?? [])].every(
    (name) => name in present,
  );
}

/**
 * Install one module: dependencies via pnpm, then its files.
 *
 * `exec`/`log` are injectable so the module table can be exercised without
 * running pnpm or the interview. Returns the files actually copied.
 */
export function installModule(mod, { exec = run, log = console.log } = {}) {
  if (mod.dependencies?.length) {
    exec(`pnpm add ${mod.dependencies.join(" ")}`);
  }
  if (mod.devDependencies?.length) {
    exec(`pnpm add -D ${mod.devDependencies.join(" ")}`);
  }

  const copied = [];
  for (const file of mod.files ?? []) {
    if (!existsSync(file.from)) {
      log(c.yellow(`  ! Module file missing: ${file.from} — skipped.`));
      continue;
    }
    // Never clobber: a re-run, or a project that has already edited the doc,
    // keeps what it has.
    if (existsSync(file.to)) {
      log(c.dim(`  ${file.to} already exists — left untouched.`));
      continue;
    }
    mkdirSync(dirname(file.to), { recursive: true });
    copyFileSync(file.from, file.to);
    copied.push(file.to);
  }
  return copied;
}

async function optionalModules(n) {
  step(n, "Optional modules");
  console.log(
    c.dim(
      "  Not every site needs these, so the template ships without them.\n" +
        "  Skip anything you are unsure about — `node scripts/setup.mjs\n" +
        "  --modules-only` re-runs just this step later.",
    ),
  );

  for (const mod of MODULES) {
    // Re-read package.json per module: an earlier `pnpm add` rewrote it.
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    console.log(`\n  ${c.b(mod.label)}`);
    console.log(c.dim(`  ${mod.description}`));

    if (moduleInstalled(mod, pkg)) {
      console.log(c.green("  ✓ Already installed — nothing to do."));
      continue;
    }
    // Headless config lists the modules it wants by id: `"modules": ["three"]`.
    const wanted = NON_INTERACTIVE
      ? (pick("modules") ?? []).includes(mod.id)
      : await confirm(`modules.${mod.id}`, `  Add ${mod.id}?`);

    if (!wanted) {
      console.log(c.dim("  Skipped — nothing added."));
      continue;
    }

    const copied = installModule(mod);
    console.log(
      c.green(
        `  ✓ ${mod.id} added${copied.length ? ` — read ${copied.join(", ")}` : ""}`,
      ),
    );
  }
}

async function main() {
  // A project that said no to a module at setup time can take just that step
  // later, without touching the repo, Sanity or Vercel again.
  if (process.argv.slice(2).includes("--modules-only")) {
    console.log(c.b("\n🌱 Website boilerplate — optional modules\n"));
    await optionalModules(1);
    console.log();
    rl?.close();
    return;
  }

  console.log(c.b("\n🌱 Website boilerplate — project setup\n"));

  // --- Naming ------------------------------------------------------------
  step(1, "Project details");
  const rawName = await ask("name", "Project name", "my-site");
  const name = slugify(rawName);
  const description = await ask(
    "description",
    "One-line description",
    "A new website.",
  );
  const siteUrl = await ask("siteUrl", "Production URL (optional)", "");

  // package.json name
  const pkgPath = "package.json";
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = name;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // src/lib/site.ts name + description
  const sitePath = "src/lib/site.ts";
  let site = readFileSync(sitePath, "utf8");
  site = site
    .replace(/name:\s*"[^"]*"/, `name: ${JSON.stringify(rawName)}`)
    .replace(
      /description:\s*\n?\s*"[^"]*"/,
      `description: ${JSON.stringify(description)}`,
    );
  writeFileSync(sitePath, site);
  console.log(c.green("  ✓ Updated package.json + src/lib/site.ts"));

  // --- Env ---------------------------------------------------------------
  step(2, "Environment (.env.local)");
  if (existsSync(".env.local")) {
    console.log(
      c.yellow("  .env.local already exists — leaving it untouched."),
    );
  } else {
    copyFileSync(".env.example", ".env.local");
    if (siteUrl) {
      let env = readFileSync(".env.local", "utf8");
      env = env.replace(
        /NEXT_PUBLIC_SITE_URL=.*/,
        `NEXT_PUBLIC_SITE_URL=${siteUrl}`,
      );
      writeFileSync(".env.local", env);
    }
    console.log(c.green("  ✓ Created .env.local from .env.example"));
  }
  console.log(
    c.dim("  Fill Sanity values below (or by hand) before deploying."),
  );

  // --- Git ---------------------------------------------------------------
  step(3, "Git");
  if (!existsSync(".git")) {
    run("git init -b main");
  }
  try {
    execSync("git rev-parse HEAD", { stdio: "ignore" });
  } catch {
    run("git add -A");
    run(`git commit -q -m "Initial commit from website-boilerplate"`);
    console.log(c.green("  ✓ Initial commit created"));
  }

  // --- GitHub ------------------------------------------------------------
  step(4, "GitHub repo");
  const hasOrigin =
    spawnSync("git", ["remote", "get-url", "origin"], { stdio: "ignore" })
      .status === 0;
  if (hasOrigin) {
    // Repos generated from the GitHub template already have `origin` set to the
    // new repo — no need to create one, just push.
    console.log(
      c.dim("  origin already set (template flow) — will push to it."),
    );
    if (await confirm("github.push", "Push current commit to origin?")) {
      run("git push -u origin main");
      console.log(c.green("  ✓ Pushed"));
    } else {
      console.log(c.dim("  Skipped."));
    }
  } else if (!has("gh")) {
    defer(
      "GitHub repo not created (no origin, and the gh CLI is unavailable)",
      `gh repo create ${name} --private --source=. --remote=origin --push`,
    );
  } else if (
    await confirm(
      "github.create",
      `Create PRIVATE GitHub repo "${name}" and push?`,
      {
        what: `GitHub repo "${name}" not created`,
        how: `gh repo create ${name} --private --source=. --remote=origin --push`,
      },
    )
  ) {
    run(`gh repo create ${name} --private --source=. --remote=origin --push`);
    console.log(c.green("  ✓ Private repo created and pushed"));
  } else {
    console.log(c.dim("  Skipped."));
  }

  // --- Sanity ------------------------------------------------------------
  step(5, "Sanity");
  if (!has("sanity") && !has("npx")) {
    defer(
      "Sanity project not created (the sanity CLI is unavailable)",
      "npx sanity@latest init --env=.env.local",
    );
  } else if (
    await confirm(
      "sanity.init",
      "Run `sanity init` to create/link a project now?",
      {
        what: "Sanity project not created — the app builds without it, but /studio has no content until it is",
        how: "npx sanity@latest init --env=.env.local",
      },
    )
  ) {
    console.log(
      c.dim(
        "  Follow the prompts. Choose the embedded config; keep dataset 'production'.",
      ),
    );

    // `sanity init` does not just write env vars — its bootstrap rewrites any
    // file it believes it owns. Left unguarded it replaces src/sanity/env.ts
    // with a version that has no `sanityConfigured` export (which layout.tsx
    // imports, so the next build dies with "Export sanityConfigured doesn't
    // exist in target module"), reverts sanity.config.ts / sanity.cli.ts to its
    // starter versions, drops blog-starter schema types into src/sanity, and
    // rewrites package.json — in one observed case downgrading Sanity a whole
    // major, which then dragged styled-components in as a runtime dependency.
    //
    // Everything it would write, this template already has a better version of,
    // and every Sanity dependency is already in package.json. So we take the
    // one thing init is actually needed for — the project id and dataset in
    // .env.local — and restore the rest.
    const protectedPaths = [
      "package.json",
      "pnpm-lock.yaml",
      "sanity.config.ts",
      "sanity.cli.ts",
      "src/sanity",
      "src/app/studio",
    ].filter((rel) => existsSync(rel));

    const backup = mkdtempSync(join(tmpdir(), "boilerplate-sanity-"));
    for (const rel of protectedPaths) {
      cpSync(rel, join(backup, rel.replace(/\//g, "__")), { recursive: true });
    }

    // Pin the CLI to the Sanity version this project actually runs, so init
    // cannot move the Studio to a different major behind your back.
    const sanityVersion =
      JSON.parse(readFileSync("package.json", "utf8")).dependencies?.sanity ??
      "latest";

    try {
      run(`npx sanity@${sanityVersion} init --env=.env.local`);
    } finally {
      const clobbered = [];
      for (const rel of protectedPaths) {
        const saved = join(backup, rel.replace(/\//g, "__"));
        // Only report a real difference for single files; directories are
        // restored wholesale either way.
        if (
          !existsSync(rel) ||
          (existsSync(rel) &&
            !rel.includes("/") &&
            readFileSync(rel, "utf8") !== readFileSync(saved, "utf8"))
        ) {
          clobbered.push(rel);
        }
        rmSync(rel, { recursive: true, force: true });
        cpSync(saved, rel, { recursive: true });
      }
      rmSync(backup, { recursive: true, force: true });

      if (clobbered.length) {
        console.log(
          c.yellow(
            `  ↺ Restored files that \`sanity init\` overwrote: ${clobbered.join(", ")}`,
          ),
        );
      } else {
        console.log(c.dim("  ↺ Boilerplate Sanity files left intact."));
      }
    }

    console.log(
      c.green(
        "  ✓ Sanity initialized (project id/dataset written to .env.local)",
      ),
    );
    console.log(
      c.dim(
        "  Create a read token (Sanity → API → Tokens) and add it as SANITY_API_READ_TOKEN.",
      ),
    );
  } else {
    console.log(c.dim("  Skipped."));
  }

  // --- Template health ---------------------------------------------------
  // Run straight after Sanity: if its bootstrap clobbered something, say so now
  // rather than letting it surface as a failed deploy days later.
  step(6, "Template invariants");
  try {
    execSync("node scripts/verify-template.mjs", { stdio: "inherit" });
  } catch {
    console.log(
      c.yellow(
        "  Some invariants are broken (see above). Fix them before deploying.",
      ),
    );
  }

  // --- Optional modules --------------------------------------------------
  // Before Vercel: whatever gets installed here belongs in the first deploy.
  await optionalModules(7);

  // --- Vercel ------------------------------------------------------------
  step(8, "Vercel");
  if (!has("vercel")) {
    defer(
      "Vercel not linked (the vercel CLI is unavailable)",
      "vercel link && vercel --prod",
    );
  } else if (
    await confirm(
      "vercel.link",
      "Link this project to Vercel and push env vars?",
      {
        what: "Vercel not linked, so nothing is deployed yet",
        how: "vercel link && vercel --prod",
      },
    )
  ) {
    run("vercel link");
    console.log(
      c.dim("  Pushing NEXT_PUBLIC_* + Sanity vars from .env.local to Vercel…"),
    );
    const env = readFileSync(".env.local", "utf8");
    for (const line of env.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (!m) continue;
      const [, key, val] = m;
      for (const target of ["development", "preview", "production"]) {
        const res = spawnSync("vercel", ["env", "add", key, target], {
          input: `${val}\n`,
          stdio: ["pipe", "inherit", "inherit"],
        });
        if (res.status !== 0)
          console.log(c.dim(`    (${key}/${target} may already exist)`));
      }
    }
    console.log(c.green("  ✓ Linked and env pushed"));

    if (await confirm("vercel.deploy", "Deploy a production build now?")) {
      run("vercel --prod");
    }
  } else {
    console.log(c.dim("  Skipped."));
  }

  // --- Done --------------------------------------------------------------
  console.log(c.b("\n✅ Setup complete.\n"));
  console.log("Next:");
  console.log(
    `  1. ${c.b("pnpm dev")} — run locally, open /studio to confirm Sanity`,
  );
  console.log(
    `  2. Run the ${c.b("design-discovery")} skill → fill ${c.b("docs/design.md")}`,
  );
  console.log(
    `  3. Apply token overrides in ${c.b("src/app/globals.css")}, then build\n`,
  );

  // In a headless run nobody watched the output scroll past, so anything that
  // could not be finished is restated here with the command that finishes it.
  if (todo.length) {
    console.log(c.b("Still to do (needs a CLI this environment lacks):\n"));
    for (const { what, how } of todo) {
      console.log(`  • ${what}`);
      console.log(`    ${c.dim(`$ ${how}`)}`);
    }
    console.log(
      c.dim(
        "\n  Run these from a machine with the CLIs installed and logged in.\n",
      ),
    );
  }

  rl?.close();
}

// Only run the interview when this file is executed directly. Importing it — to
// exercise the module table without prompting for a GitHub repo — must do
// nothing.
const executedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedDirectly) {
  main().catch((err) => {
    console.error(c.red("\nSetup failed:"), err.message);
    rl?.close();
    process.exit(1);
  });
}
