#!/usr/bin/env node
/**
 * Per-project setup for a site cloned from this boilerplate.
 *
 *   pnpm setup
 *
 * Walks through: naming the project, wiring env, GitHub (pushes to the existing
 * origin when generated from the template, else creates a PRIVATE repo),
 * initializing Sanity, linking Vercel, and a first deploy. Every remote/
 * irreversible step asks first. Missing CLIs are reported, not fatal — you can
 * run those steps by hand and re-run.
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
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });
const c = {
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const ask = async (q, def = "") => {
  const a = (
    await rl.question(`${q}${def ? c.dim(` (${def})`) : ""}: `)
  ).trim();
  return a || def;
};
const confirm = async (q) =>
  /^y(es)?$/i.test((await rl.question(`${q} ${c.dim("[y/N]")} `)).trim());
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

async function main() {
  console.log(c.b("\n🌱 Website boilerplate — project setup\n"));

  // --- Naming ------------------------------------------------------------
  step(1, "Project details");
  const rawName = await ask("Project name", "my-site");
  const name = slugify(rawName);
  const description = await ask("One-line description", "A new website.");
  const siteUrl = await ask("Production URL (optional)", "");

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
    if (await confirm("Push current commit to origin?")) {
      run("git push -u origin main");
      console.log(c.green("  ✓ Pushed"));
    } else {
      console.log(c.dim("  Skipped."));
    }
  } else if (!has("gh")) {
    console.log(
      c.yellow(
        "  No origin and gh CLI not found — create a PRIVATE repo manually and push.",
      ),
    );
  } else if (await confirm(`Create PRIVATE GitHub repo "${name}" and push?`)) {
    run(`gh repo create ${name} --private --source=. --remote=origin --push`);
    console.log(c.green("  ✓ Private repo created and pushed"));
  } else {
    console.log(c.dim("  Skipped."));
  }

  // --- Sanity ------------------------------------------------------------
  step(5, "Sanity");
  if (!has("sanity") && !has("npx")) {
    console.log(
      c.yellow(
        "  sanity CLI not found — skipping. Run `npx sanity init` later.",
      ),
    );
  } else if (await confirm("Run `sanity init` to create/link a project now?")) {
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

  // --- Vercel ------------------------------------------------------------
  step(7, "Vercel");
  if (!has("vercel")) {
    console.log(
      c.yellow(
        "  vercel CLI not found — skipping. Run `vercel link` + `vercel deploy` later.",
      ),
    );
  } else if (await confirm("Link this project to Vercel and push env vars?")) {
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

    if (await confirm("Deploy a production build now?")) {
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

  rl.close();
}

main().catch((err) => {
  console.error(c.red("\nSetup failed:"), err.message);
  rl.close();
  process.exit(1);
});
