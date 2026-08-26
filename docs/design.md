# Design — <PROJECT NAME>

> Filled in during discovery (see `.claude/skills/design-discovery.md`). This is
> the source of truth for the build. Update it as decisions change.

## 1. Purpose

- **What is this site for?**
- **Primary audience:**
- **Primary action / goal (the one thing a visitor should do):**
- **Secondary goals:**
- **Tone in one line:**

## 2. Visual style

- **Mood / adjectives (3–5):**
- **References (links, screenshots):**
- **Palette direction:** (light / dark / both; brand colors)
- **Typography feel:** (default is Inter — override here if different)
- **Density / spacing:** (airy vs. compact)
- **Imagery:** (photography, illustration, 3D, none)

### Token overrides

> Which CSS variables in `globals.css` change from the neutral default.

| Token         | Default  | This project |
| ------------- | -------- | ------------ |
| `--primary`   | indigo   |              |
| `--radius`    | 0.625rem |              |
| `--font-sans` | Inter    |              |

## 3. Signature elements

> The 2–4 memorable moments that make this site feel bespoke, not templated.

- **Hero:**
- **Motion (GSAP):** (scroll reveals, pinned sections, cursor, transitions)
- **Custom shapes / SVG:** (clip-paths, masks, borders, dividers)
- **Interactions:**

## 4. Component modifications

> Which React Aria Components get re-skinned beyond the token defaults, and how.
> Keep RAC behavior; change only presentation (see restyle-component skill).

| Component | Change |
| --------- | ------ |
| Button    |        |
|           |        |

## 5. Content model (Sanity)

> Rough schema — documents, singletons, and the fields each needs.

- **page** — title, slug, sections[]
- **siteSettings** (singleton) — nav, footer, social
- **Sections:** hero, …

## 6. Pages / routes

- `/` —
- ...

## 7. Open questions
