---
name: design-discovery
description: Run the design discovery interview for a new website built on this boilerplate, then write the decisions into docs/design.md. Use at the start of a new project, or when the user says "let's figure out the design", "discovery", or wants to define the site's purpose, visual style, signature elements, and component modifications before building.
---

# Design Discovery

Goal: turn a vague "let's build a site" into a concrete, written brief in
`docs/design.md` that the rest of the build follows. Interview, then document.
Do **not** start coding UI until `docs/design.md` has real answers.

## How to run it

Work through the five areas below as a conversation — one focused batch of
questions at a time, not a wall of 30. Use `AskUserQuestion` for genuinely
forking choices (light vs dark, illustration vs photography). Reflect answers
back briefly, then move on. Pull references from the user (links, screenshots)
wherever style is discussed.

### 1. Purpose

- What is the site for? Who is the audience?
- The single primary action a visitor should take. Secondary goals.
- One-line tone.

### 2. Visual style

- 3–5 mood adjectives. Reference sites/images.
- Palette direction (light / dark / both, brand colors) → which `--*` tokens in
  `src/app/globals.css` change from the neutral default.
- Typography feel (Inter is the default — override only with reason).
- Density, imagery approach.

### 3. Signature elements

- The 2–4 memorable moments (hero, scroll motion, custom shapes, transitions)
  that stop this from feeling like a template. Be specific and ambitious here —
  this is where GSAP and custom SVG earn their place.

### 4. Component modifications

- Which React Aria Components get re-skinned beyond token changes, and how.
  Behavior stays; presentation changes (hand off each to `restyle-component`).

### 5. Content model (Sanity)

- Documents, singletons, and the fields each needs. What must be editable in the
  Studio vs. hardcoded.

## Output

Write everything into `docs/design.md` (the template already has the sections).
Fill the token-override and component-modification tables concretely — those
drive the actual work. End by listing open questions and proposing the first
build steps (usually: apply token overrides, then build the hero).

Then confirm the brief with the user before building.
