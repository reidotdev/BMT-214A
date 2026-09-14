# Storybook

Storybook is part of this boilerplate, not an add-on. Every component in
`src/components/ui/` has a story, and the stories render against the project's
**real** stylesheet — `.storybook/preview.css` imports `src/app/globals.css`, so
there is no second theme that can drift.

## What it is for

The design tokens are the swappable layer of this template (see golden rule 2 in
`CLAUDE.md`), and re-theming a project means editing the palette block in
`src/app/globals.css`. Storybook is where you watch that land. Edit a token, and
the whole system — every variant, every interaction state, light and dark
surfaces — re-renders in one place, without clicking through pages of a
half-built site to find the buttons.

Concretely it is the fastest way to:

- **See the whole design system at once** while iterating on visual style.
- **Check states you cannot reach by looking at a page** — hover, press,
  focus-visible, disabled, invalid, indeterminate — via the `ForceState` helper.
- **Check both surfaces** — the Surface toolbar renders any story on light, on
  `data-surface="dark"`, or both side by side.
- **Catch contrast regressions early.** `--muted-foreground` has to clear 4.5:1
  against `--muted`, not just against white (gotcha #7 in `CLAUDE.md`). The
  a11y panel says so per story.
- **Read the prop tables.** `react-docgen-typescript` resolves the real types,
  so the inherited React Aria props show up, not just what is spelled out in
  the component file.

It is **not** a page builder. Page-level composition belongs in the app.

## Running it

```bash
pnpm storybook         # dev server on http://localhost:6006
pnpm build-storybook   # static site into storybook-static/
```

`storybook-static/` is gitignored, prettier-ignored and eslint-ignored. That
last one matters: without the carve-out in `eslint.config.mjs`, `pnpm lint`
walks the minified bundles after anyone runs a build.

## The Surface toolbar

`data-surface="dark"` is this template's **section** dark mode: put it on any
element and every semantic token is redefined inside it, so `Button`,
`TextField` and the rest render correctly on a dark band with no variant props
and no hardcoded colours. The toolbar applies that same attribute, so what a
story shows on Dark is literally what a dark section of a page shows.

| Mode             | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| **Light**        | Plain canvas, no attribute.                              |
| **Dark**         | `data-surface="dark"` on the canvas **and on `<body>`**. |
| **Side by side** | Two canvases, light and dark, rendering the same story.  |

The `<body>` part is load-bearing. Overlays — `Modal`, `Popover` (so `Menu` and
`Select`'s listbox), `Tooltip` — portal to `<body>`, which sits outside the
surface wrapper. Without the attribute on `<body>` a menu would open light on a
dark page. Side by side can only pick one `<body>`, so it deliberately leaves
overlays light: **check overlays with Dark, not with Side by side.**

Storybook's own backgrounds addon is disabled — our surfaces come from the
tokens, and a picker that does not know about them would only ever be wrong.

## Writing a story for a new component

This is step 7 of the `restyle-component` skill; adding or re-skinning a
component is not done until its story exists.

1. Create `src/stories/<name>.stories.tsx` (the glob covers all of `src/`, so
   co-locating next to the component works too).
2. Title it `<Group>/<Component>` using the existing groups — `Foundations`,
   `Actions`, `Forms`, `Navigation`, `Overlays`. The sidebar is sorted in that
   order in `.storybook/preview.tsx`; a new group goes at the end unless you add
   it to `storySort`.
3. Import the component from `@/components/ui` — the barrel, the same way the
   app does.
4. Give it `tags: ["autodocs"]` so it gets a generated Docs page with prop
   tables.
5. Export a `Playground` story with no `render` so the controls panel drives it,
   then the set that documents the component:
   - **Variants** — one cell per variant.
   - **States** — rest / hovered / pressed / focus-visible / disabled, and any
     component-specific state (selected, indeterminate, invalid, read-only).
   - Real usage — validation inside a `<form>`, icons, long labels, whatever
     the component gets wrong in practice.
6. Build the galleries out of the helpers in `src/stories/story-helpers.tsx`:
   `Cell`, `Grid`, `Row`, `Stack`.
7. **Never hardcode a colour.** Stories use the token utilities —
   `bg-background`, `text-muted-foreground`, `border-border` — exactly like
   components do. A story with a literal hex is a story that lies after a
   re-theme.
8. Write the doc comments as comments: the JSDoc above `meta` becomes the Docs
   page intro, and the JSDoc above each story becomes that story's description.
   Say the non-obvious thing — why `textValue` is mandatory on `SelectItem`,
   why an overlay needs Dark rather than Side by side.

### `ForceState`

React Aria renders interaction state as `data-*` attributes, and our components
style them with `data-[hovered]:` / `data-[pressed]:` / `data-[focus-visible]:`
variants. Hover and press cannot be set through props, so a static "every state"
gallery would otherwise be impossible.

`ForceState` writes those attributes straight onto the rendered element — the
exact attributes RAC itself would write, so the result is the genuine style and
not an approximation — and a `MutationObserver` puts them back when RAC
re-renders and strips them (which it does on mount for composite components).

```tsx
<ForceState states={["hovered"]}>
  <Button>Button</Button>
</ForceState>

// When the styled element is not the root, point at it:
<ForceState states={["focus-visible", "focused"]} selector="input">
  <TextField label="Full name" />
</ForceState>
```

It is a display device only. It proves what a state _looks_ like; it proves
nothing about whether RAC actually enters that state — the Playwright suite in
`e2e/` is what does that.

Collection components are the exception: a `TabList`, `Menu` or `ListBox` builds
a React Aria collection from its children, so wrapping those children breaks the
collection. Demonstrate their states live instead (see `tabs.stories.tsx`).

## Accessibility checks

`@storybook/addon-a11y` runs axe against every story and reports in the
**Accessibility** panel. On a React Aria boilerplate that is close to the whole
point: the components exist to be accessible, so the audit is where a restyle
that broke the contract shows up.

- It is set to `a11y: { test: "todo" }` in `.storybook/preview.tsx` — violations
  are reported but do not fail anything. A project that has got itself clean can
  raise that to `"error"`.
- The Foundations/Design tokens story opts out (`a11y: { disable: true }`): its
  swatch grids are decorative colour fields, and the contrast rule fires on the
  labels by design.
- The axe panel is not a substitute for `pnpm test:e2e`. Focus rings and
  keyboard order need a real browser driving real interaction; axe on a static
  render cannot see them.

## Publishing the static build

```bash
pnpm build-storybook     # → storybook-static/
```

The output is a plain static site — open `storybook-static/index.html`, or serve
it with anything.

### Deploying to Vercel as a separate project

Deploy Storybook as its own Vercel project pointed at the same repo, so the site
and the component library have independent URLs and deploys.

With the CLI, from the repo root:

```bash
pnpm build-storybook
npx vercel deploy storybook-static --prod --name <project>-storybook
```

That uploads the prebuilt directory and needs no build step on Vercel's side —
useful as a one-off, but it does not redeploy when you push.

For a deploy-on-push setup, create a second Vercel project from the same Git
repository in the dashboard (**Add New → Project**, pick the repo, and let it
create a project with a different name from the site's), then set:

| Setting          | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| Framework Preset | **Other** (not Next.js — this build output is a static site) |
| Build Command    | `pnpm build-storybook`                                       |
| Output Directory | `storybook-static`                                           |
| Install Command  | leave as default (`pnpm install`)                            |
| Root Directory   | repo root                                                    |

Two things worth setting deliberately:

- **Node version** — match `.nvmrc`.
- **Access** — a component library is usually fine to publish, but if the work
  is under NDA, turn on Vercel Authentication (Deployment Protection) for that
  project. It is a separate project, so this does not affect the live site.

Alternatives, if Vercel is not wanted for this: Chromatic (Storybook's own host,
adds visual regression review on every PR) or GitHub Pages via an action that
runs `pnpm build-storybook` and publishes `storybook-static/`. Nothing in the
setup here is Vercel-specific.
