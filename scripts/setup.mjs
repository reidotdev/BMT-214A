#!/usr/bin/env node
/**
 * Per-project setup for a site cloned from this boilerplate.
 *
 *   pnpm scaffold
 *
 * Walks through: naming the project, wiring env, GitHub (pushes to the existing
 * origin when generated from the template, else creates a PRIVATE repo),
 * connecting Sanity, template invariants, optional modules, linking Vercel,
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
  mkdirSync,
} from "node:fs";
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

/**
 * Run a command that has been told not to prompt, capturing stdout so we can
 * parse it. stdin is closed rather than inherited: a command that prompts
 * anyway then fails fast instead of hanging on a pipe nobody is reading, and
 * the failure is something we can route on. stderr is captured too — the CLIs
 * here put their most actionable messages there.
 */
function capture(cmd, args) {
  console.log(c.dim(`  $ ${[cmd, ...args].join(" ")}`));
  const res = spawnSync(cmd, args, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
  return {
    ok: res.status === 0,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  };
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- .env files ----------------------------------------------------------
//
// Reading and writing these by hand, rather than shelling out, because the
// exact bytes matter: quotes that a runtime strips locally travel verbatim to a
// host's environment variables and break the build there. See the Sanity step.

/**
 * Parse a .env file the way a runtime reads it, not the way a writer wrote it:
 * surrounding quotes stripped, whitespace and stray \r trimmed, comments and
 * blanks dropped, and a later assignment beating an earlier one.
 *
 * "Later wins" is not academic. Sanity's `init --env` appends `KEY="value"` to
 * the end of the file whenever it finds the key present but empty — which is
 * exactly what .env.example ships — so a scaffolded .env.local really did
 * contain each Sanity key twice, the first one empty.
 */
export function parseEnvFile(contents) {
  const vars = new Map();
  for (const raw of contents.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*)$/,
    );
    if (!match) continue;
    const [, key, rawValue] = match;
    vars.set(
      key,
      rawValue
        .trim()
        .replace(/^(['"])([\s\S]*)\1$/, "$2")
        .trim(),
    );
  }
  return vars;
}

/**
 * Set keys in a .env file in place. An existing assignment is rewritten where
 * it stands — every occurrence, so a duplicated key cannot shadow the new value
 * — and a key that is not there yet is appended. Values are written bare: the
 * quotes are the bug, not the formatting.
 */
export function updateEnvFile(path, updates) {
  let contents = existsSync(path) ? readFileSync(path, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const pattern = () =>
      new RegExp(String.raw`^(?:export[ \t]+)?${key}[ \t]*=.*$`, "gm");
    const assignment = `${key}=${value}`;
    contents = pattern().test(contents)
      ? contents.replace(pattern(), assignment)
      : `${contents.replace(/\n*$/, "")}\n${assignment}\n`;
  }
  writeFileSync(path, contents);
}

/** Read .env.local, tolerating its absence. */
function readEnvLocal() {
  return parseEnvFile(
    existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "",
  );
}

// Sanity's own validation rules, mirrored so a malformed value is caught here
// rather than by `createClient()` halfway through a production build.
const VALID_PROJECT_ID = /^[a-z0-9-]+$/;
const VALID_DATASET = /^[a-z0-9_-]+$/;

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

// --- Sanity --------------------------------------------------------------

/**
 * How to invoke the Sanity CLI, preferring the copy this project already
 * depends on. `npx sanity@latest` — the old spelling — could silently run a
 * different major from the one in package.json.
 */
function sanityRunner() {
  const local = join("node_modules", ".bin", "sanity");
  if (existsSync(local)) return { cmd: local, pre: [] };
  if (has("sanity")) return { cmd: "sanity", pre: [] };
  if (has("npx")) {
    const version =
      JSON.parse(readFileSync("package.json", "utf8")).dependencies?.sanity ??
      "latest";
    return { cmd: "npx", pre: ["--yes", `sanity@${version}`] };
  }
  return null;
}

/** Pull a project id out of `sanity projects create --json` output. */
export function readProjectId(stdout) {
  const block = stdout.slice(stdout.indexOf("{"), stdout.lastIndexOf("}") + 1);
  try {
    const parsed = JSON.parse(block);
    if (parsed?.projectId) return String(parsed.projectId);
  } catch {
    // Fall through — the regex below survives a banner or a stray log line
    // sharing stdout with the JSON.
  }
  return stdout.match(/"projectId"\s*:\s*"([a-z0-9-]+)"/)?.[1];
}

/** Write the resolved ids into .env.local, refusing anything malformed. */
function writeSanityEnv(projectId, dataset) {
  if (!VALID_PROJECT_ID.test(projectId)) {
    console.log(
      c.red(
        `  ✗ "${projectId}" is not a valid Sanity project id (a-z, 0-9, -).`,
      ),
    );
    return false;
  }
  if (!VALID_DATASET.test(dataset)) {
    console.log(
      c.red(`  ✗ "${dataset}" is not a valid dataset name (a-z, 0-9, _, -).`),
    );
    return false;
  }
  updateEnvFile(".env.local", {
    NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
    NEXT_PUBLIC_SANITY_DATASET: dataset,
  });
  console.log(
    c.green(`  ✓ .env.local → project ${projectId}, dataset ${dataset}`),
  );
  return true;
}

/**
 * Connect this project to Sanity — without letting the Sanity CLI near the repo.
 *
 * This step used to run `sanity init`, whose bootstrap insists on owning files
 * the template already has better versions of. Even wrapped in a backup and a
 * restore, it walked the operator through a screen of "File /src/sanity/env.ts
 * already exists. Do you want to overwrite it?" prompts where the only workable
 * answer was one we then quietly undid — and it appended the project id to
 * .env.local as `KEY="value"`, quotes included. dotenv strips those locally, so
 * dev looked fine; `vercel env add` does not, so the quotes reached the host
 * verbatim and the first production build died on `projectId` can only contain
 * only a-z, 0-9 and dashes.
 *
 * `sanity projects create` and `sanity projects list` do the one thing actually
 * needed here — resolve a project id — and write nothing to disk. .env.local is
 * ours to write, bare and deduplicated.
 */
async function sanityStep(displayName) {
  // An id supplied up front needs no CLI at all. This is the path that lets a
  // phone or a web session finish the step instead of deferring it.
  const givenId = NON_INTERACTIVE ? pick("sanity.projectId") : undefined;
  if (givenId) {
    writeSanityEnv(
      String(givenId),
      String(pick("sanity.dataset") || "production"),
    );
    return;
  }

  const mode = await sanityMode();
  if (mode === "skip") {
    console.log(
      c.dim("  Skipped — the app builds and runs without Sanity configured."),
    );
    return;
  }

  const runner = sanityRunner();
  if (!runner) {
    defer(
      "Sanity not connected (no sanity CLI and no npx)",
      `npx sanity@latest projects create "${displayName}" --dataset production --yes --json`,
    );
    return;
  }

  // One cheap call that doubles as a login check and, for the "link existing"
  // path, the list to choose from.
  let projects = capture(runner.cmd, [...runner.pre, "projects", "list"]);
  if (!projects.ok && !NON_INTERACTIVE) {
    console.log(
      c.yellow(
        "  The Sanity CLI could not list your projects — probably not logged in.",
      ),
    );
    if (await confirm("sanity.login", "  Run `sanity login` now?")) {
      spawnSync(runner.cmd, [...runner.pre, "login"], { stdio: "inherit" });
      projects = capture(runner.cmd, [...runner.pre, "projects", "list"]);
    }
  }
  if (!projects.ok) {
    if (projects.stderr) console.log(c.dim(projects.stderr.trim()));
    defer(
      "Sanity not connected (the CLI is not logged in)",
      `npx sanity@latest login && npx sanity@latest projects create "${displayName}" --dataset production --yes --json`,
    );
    return;
  }

  if (mode === "existing") {
    console.log(`\n${projects.stdout.trim()}\n`);
    const projectId = String(
      await ask("sanity.projectId", "  Sanity project id", ""),
    ).trim();
    if (!projectId) {
      console.log(c.dim("  No id given — skipped."));
      return;
    }
    const dataset = String(
      await ask("sanity.dataset", "  Dataset", "production"),
    ).trim();
    if (writeSanityEnv(projectId, dataset))
      await sanityToken(runner, projectId, displayName);
    return;
  }

  // --- create a new project ---
  const dataset = String(
    await ask("sanity.dataset", "  Dataset name", "production"),
  ).trim();
  const create = [
    ...runner.pre,
    "projects",
    "create",
    displayName,
    "--dataset",
    dataset,
    "--dataset-visibility",
    "public",
    "--yes",
    "--json",
  ];

  const org = pick("sanity.organization");
  let result = capture(
    runner.cmd,
    org ? [...create, "--organization", String(org)] : create,
  );

  // `--yes` refuses to guess when the account belongs to more than one
  // organization, which is the right call — but the answer is one line away, so
  // ask for it here rather than making the operator re-run the whole scaffolder.
  if (!result.ok && /organization/i.test(result.stderr) && !NON_INTERACTIVE) {
    console.log(c.yellow(`  ${result.stderr.trim()}`));
    const orgs = capture(runner.cmd, [...runner.pre, "organizations", "list"]);
    if (orgs.stdout.trim()) console.log(`\n${orgs.stdout.trim()}\n`);
    const chosen = (
      await ask("sanity.organization", "  Organization (id or slug)", "")
    ).trim();
    if (chosen) {
      result = capture(runner.cmd, [...create, "--organization", chosen]);
    }
  }

  if (!result.ok) {
    if (result.stderr) console.log(c.dim(result.stderr.trim()));
    defer(
      "Sanity project not created",
      `npx sanity@latest projects create "${displayName}" --dataset ${dataset} --yes --json`,
    );
    return;
  }

  const projectId = readProjectId(result.stdout);
  if (!projectId) {
    // The project exists — only our reading of the output failed. Say so, and
    // let the operator finish from what is already on screen.
    console.log(result.stdout.trim());
    console.log(
      c.yellow(
        "  The project was created but its id could not be read from the output.",
      ),
    );
    const pasted = (
      await ask("sanity.projectId", "  Paste the project id", "")
    ).trim();
    if (pasted && writeSanityEnv(pasted, dataset)) {
      await sanityToken(runner, pasted, displayName);
    }
    return;
  }

  console.log(
    c.green(`  ✓ Created Sanity project ${projectId} with dataset ${dataset}`),
  );
  console.log(c.dim(`  https://www.sanity.io/manage/project/${projectId}`));
  if (writeSanityEnv(projectId, dataset)) {
    await sanityToken(runner, projectId, displayName);
  }
}

/** Which of the three Sanity paths to take, in either mode. */
async function sanityMode() {
  if (NON_INTERACTIVE) {
    // `sanity.init` is the pre-existing spelling; keep it working.
    const chosen = pick("sanity.mode") ?? pick("sanity.init");
    if (chosen === "later") {
      defer(
        "Sanity not connected — the app builds without it, but /studio has no content until it is",
        'npx sanity@latest projects create "<name>" --dataset production --yes --json',
      );
      return "skip";
    }
    if (chosen === true || chosen === "create") return "create";
    if (chosen === "existing") return "existing";
    console.log(c.dim("  Sanity: skipped (no `sanity.mode` in the config)."));
    return "skip";
  }

  console.log(
    c.dim(
      "  Nothing in this repo gets overwritten here — the only file this step\n" +
        "  writes is .env.local.",
    ),
  );
  console.log("  1) Create a new Sanity project");
  console.log("  2) Link an existing Sanity project");
  console.log("  3) Skip for now");
  const answer = String(await ask("sanity.mode", "  Choose", "1")).trim();
  const chosen = { 1: "create", 2: "existing", 3: "skip" }[answer] ?? answer;
  // Anything unrecognised means skip, never create. A typo at this prompt must
  // not create a remote project the operator did not ask for.
  if (chosen !== "create" && chosen !== "existing") {
    if (chosen !== "skip")
      console.log(c.yellow(`  "${answer}" is not one of 1/2/3 — skipping.`));
    return "skip";
  }
  return chosen;
}

/**
 * Offer to mint the read token too. It is only needed for drafts and live
 * preview, but leaving it as a "go and do this by hand in the dashboard" note
 * is how it ends up never being done.
 */
async function sanityToken(runner, projectId, displayName) {
  if (readEnvLocal().get("SANITY_API_READ_TOKEN")) {
    console.log(c.dim("  SANITY_API_READ_TOKEN already set — left alone."));
    return;
  }
  const wanted = await confirm(
    "sanity.token",
    "  Create a read token for drafts / live preview?",
    {
      what: "Sanity read token not created (drafts and live preview stay off)",
      how: `npx sanity@latest tokens create "${displayName} — web" --project-id ${projectId} --role viewer --yes`,
    },
  );
  if (!wanted) return;

  const result = capture(runner.cmd, [
    ...runner.pre,
    "tokens",
    "create",
    `${displayName} — web`,
    "--project-id",
    projectId,
    "--role",
    "viewer",
    "--yes",
    "--json",
  ]);
  const token = result.ok
    ? (() => {
        try {
          return JSON.parse(
            result.stdout.slice(
              result.stdout.indexOf("{"),
              result.stdout.lastIndexOf("}") + 1,
            ),
          )?.token;
        } catch {
          return undefined;
        }
      })()
    : undefined;

  if (!token) {
    if (result.stderr) console.log(c.dim(result.stderr.trim()));
    defer(
      "Sanity read token not created",
      `npx sanity@latest tokens create "${displayName} — web" --project-id ${projectId} --role viewer --yes`,
    );
    return;
  }
  // Never echoed. .env.local is gitignored; this is the only place it lands.
  updateEnvFile(".env.local", { SANITY_API_READ_TOKEN: token });
  console.log(
    c.green(
      "  ✓ Read token written to .env.local (not printed, not committed)",
    ),
  );
}

// --- Vercel --------------------------------------------------------------

/**
 * Push one variable to one Vercel environment. `--force` overwrites a value
 * that is already there, which matters on a re-run: without it a wrong value
 * pushed once stays wrong forever and every later deploy keeps failing. Older
 * CLIs don't have the flag, so fall back rather than fail.
 */
function pushEnvVar(key, value, target) {
  const attempt = (args) =>
    spawnSync("vercel", args, {
      input: `${value}\n`,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

  let res = attempt(["env", "add", key, target, "--force"]);
  if (
    res.status !== 0 &&
    /unknown|unrecognized|--force/i.test(res.stderr ?? "")
  ) {
    res = attempt(["env", "add", key, target]);
  }
  if (res.status === 0) {
    console.log(c.dim(`    ${key} → ${target}`));
  } else {
    console.log(
      c.yellow(
        `    ${key} → ${target} failed: ${(res.stderr ?? "").trim().split("\n")[0]}`,
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
    console.log(c.green("  ✓ Created .env.local from .env.example"));
  }
  if (siteUrl) {
    updateEnvFile(".env.local", {
      NEXT_PUBLIC_SITE_URL: siteUrl.replace(/\/$/, ""),
    });
    console.log(
      c.green(`  ✓ NEXT_PUBLIC_SITE_URL=${siteUrl.replace(/\/$/, "")}`),
    );
  }
  console.log(c.dim("  The Sanity step below fills in the rest."));

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
  await sanityStep(rawName);

  // --- Template health ---------------------------------------------------
  // Run straight after Sanity: this is where a malformed .env.local value gets
  // caught, and catching it here beats catching it in a failed deploy log days
  // later.
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
  console.log(
    c.dim(
      "  `vercel link` connects this folder to a Vercel project, then detects\n" +
        "  the framework. The framework preset is the answer to every build\n" +
        "  question, so there is nothing to customize:\n" +
        "    Build Command        next build   — runs on every deploy\n" +
        "    Development Command  next dev     — only used by `vercel dev`\n" +
        "    Install Command      pnpm install — from the lockfile\n" +
        "    Output Directory     .next\n" +
        "  If Vercel ever asks whether to customize these, the answer is no:\n" +
        "  overriding one with a blank value replaces the default with nothing.\n" +
        "  We pass --yes below, which takes the defaults and skips the interview.",
    ),
  );
  if (!has("vercel")) {
    defer(
      "Vercel not linked (the vercel CLI is unavailable)",
      "vercel link --yes && vercel --prod --yes",
    );
  } else if (
    await confirm(
      "vercel.link",
      "Link this project to Vercel and push env vars?",
      {
        what: "Vercel not linked, so nothing is deployed yet",
        how: "vercel link --yes && vercel --prod --yes",
      },
    )
  ) {
    const scope = pick("vercel.scope");
    run(`vercel link --yes${scope ? ` --scope ${scope}` : ""}`);

    const envVars = readEnvLocal();
    console.log(c.dim("  Pushing .env.local to Vercel…"));
    for (const [key, value] of envVars) {
      if (!value) continue;
      for (const target of ["development", "preview", "production"]) {
        // A localhost URL is right for development and wrong everywhere else:
        // pushed to production it becomes the canonical URL in the metadata,
        // the sitemap, robots.txt and every OG image.
        if (
          target !== "development" &&
          /^https?:\/\/localhost\b/i.test(value)
        ) {
          console.log(c.dim(`    ${key} → ${target} skipped (localhost URL)`));
          continue;
        }
        pushEnvVar(key, value, target);
      }
    }
    console.log(c.green("  ✓ Linked and env pushed"));
    if (
      !envVars.get("NEXT_PUBLIC_SITE_URL") ||
      /localhost/i.test(envVars.get("NEXT_PUBLIC_SITE_URL") ?? "")
    ) {
      console.log(
        c.yellow(
          "  Set NEXT_PUBLIC_SITE_URL to the real domain once you have it —\n" +
            "  metadata, the sitemap and OG images all read it.",
        ),
      );
    }

    if (await confirm("vercel.deploy", "Deploy a production build now?")) {
      run("vercel --prod --yes");
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
