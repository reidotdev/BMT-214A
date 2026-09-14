---
name: scaffold-headless
description: Start a new website project from this template without a terminal — from a phone, the web app, or any session where the user cannot answer interactive prompts. Interview the user in chat, write a scaffold config, run the scaffolder headless, and report what still needs a real terminal. Use when the user says they want to start a new project/site and cannot or does not want to run the interview themselves.
---

# Scaffold headless

`pnpm scaffold` is an interview. That is fine at a desk and useless on a phone —
nobody can type answers into a terminal they cannot see. This skill replaces the
interview with a conversation and a config file.

The constraint is NOT that there is no terminal. In a cloud or web session _you_
have one; what neither of you has is a way to answer prompts. So: gather the
answers in chat, write them to a file, and run the scaffolder with `--config`.

## What actually works without a local machine

Verified in a cloud session — check rather than assume, environments differ:

| Step                             | Headless?            | Why                                                      |
| -------------------------------- | -------------------- | -------------------------------------------------------- |
| Name, description, site URL      | yes                  | plain file edits                                         |
| `.env.local` from `.env.example` | yes                  | file copy                                                |
| Optional modules (three.js, …)   | yes                  | `pnpm add` over the network                              |
| Template invariants              | yes                  | local script                                             |
| Create the GitHub repo           | yes, **via the API** | the `gh` CLI is usually absent; the GitHub tools are not |
| First commit and push            | yes                  | git works                                                |
| Sanity project                   | **no**               | needs the `sanity` CLI, logged in                        |
| Vercel link and deploy           | **no**               | needs the `vercel` CLI, logged in                        |

Sanity and Vercel are the honest limits. Do not pretend otherwise, and do not
ask the user to paste tokens to get around it.

## The flow

### 1. Interview, briefly

Ask in one batch, with sensible defaults so a one-word reply is enough:

- Project name, and a one-line description.
- Production URL, if known. Skippable.
- Which optional modules (`scaffold.config.example.json` lists what exists).
  Default to none — a module is cheap to add later, and `three` is dead weight
  on a site with no 3D.
- Whether the repo should be created now (you can do this) and whether Sanity
  and Vercel should be marked `"later"`.

Do not run the design interview here. That is `design-discovery`, it comes
after the project exists, and conflating the two produces a worse brief.

### 2. Create the repo

The GitHub `create_repository` tool has no "from template" option, so do not
look for one: create an empty PRIVATE repo, then push the template contents
into it. That yields the same fresh history the template button gives.

Push the template's files as the first commit — do not fork, and do not keep
the template's git history in the new project.

### 3. Write the config

Copy `scaffold.config.example.json` to `scaffold.config.json` and fill it in.
Three answers matter per remote step:

- `true` — do it now (only when the CLI exists)
- `false` — the user does not want it
- `"later"` — wanted, but impossible here; the run lists the exact command

Use `"later"`, not `false`, for Sanity and Vercel in a phone session. `false`
silently drops them and the user never learns what is missing.

**Never put a token, key or secret in this file.** It is committed. Credentials
belong in `.env.local`, which is gitignored.

### 4. Run it

```bash
node scripts/setup.mjs --config scaffold.config.json --non-interactive
```

It never reads stdin, so it cannot hang waiting for an answer.

### 5. Verify before declaring success

Run what CI runs. A scaffolded project that does not build is worse than no
project, and the user cannot check it themselves:

```bash
pnpm verify:template && pnpm lint && pnpm typecheck && pnpm build
```

### 6. Report

Give the user:

- The repo URL.
- What was configured — name, URL, modules.
- **The "Still to do" list verbatim**, with its commands. This is the part they
  need when they next reach a real terminal; paraphrasing it loses the commands.
- The next step: run `design-discovery` to fill `docs/design.md`.

## Getting the rest done later

On a machine with `gh`, `sanity` and `vercel` installed and logged in, the
deferred commands run standalone — or re-run the scaffolder interactively and
answer only the steps that remain. `node scripts/setup.mjs --modules-only` adds
a module that was skipped.
