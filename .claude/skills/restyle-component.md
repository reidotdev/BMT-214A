---
name: restyle-component
description: Re-skin a React Aria Component for this project — add a new one from react-aria-components or heavily restyle an existing one in src/components/ui, applying custom SVG shapes, masks, borders, and motion while keeping RAC's behavior and accessibility intact. Use when the user wants to add a component not in the core set, or make a component look bespoke rather than default.
---

# Restyle / Add a Component

The core set in `src/components/ui/` is a starting point, not a ceiling. React
Aria Components is one library — pull any component from it and style it the same
way. The rule: **keep behavior and accessibility from RAC; change only
presentation.**

## Principle

RAC separates behavior (state, focus, keyboard, ARIA) from presentation. You get
that for free and must not break it. Style via:

- The `data-*` state attributes RAC renders: `data-[hovered]`, `data-[pressed]`,
  `data-[selected]`, `data-[focus-visible]`, `data-[disabled]`, `data-[invalid]`,
  `data-[entering]`, `data-[exiting]`, etc. (`tailwindcss-react-aria-components`
  is loaded if you prefer its named variants.)
- Design tokens (`bg-primary`, `text-foreground`, `rounded-lg`, …) so the
  component stays themeable — never hardcode hex colors.
- `composeRenderProps` to merge an incoming `className` so callers can override.

## Steps

1. **Find the component** in the React Aria docs (the official React Aria MCP,
   if connected, gives correct current APIs — prefer it over memory). Note its
   anatomy (which sub-components compose it) and its render-prop/state surface.
2. **Create `src/components/ui/<name>.tsx`** following the pattern of the
   existing core components: `"use client"`, wrap the RAC parts, apply token
   classes + `focusRing` from `./styles`, expose a clean prop API.
3. **Apply the bespoke visuals** from `docs/design.md` — custom SVG shapes,
   `[clip-path:…]`, masks, gradients, borders, GSAP-driven motion. Put genuinely
   custom, one-off CSS in a scoped class or arbitrary utility, not in the shared
   token layer.
4. **Preserve accessibility:** keep labels, `aria-*`, focus order, and keyboard
   behavior. Never replace an interactive RAC element with a plain `div`. Every
   focusable element keeps a visible focus ring.
5. **Respect motion preferences:** gate non-essential animation behind
   `prefers-reduced-motion` (see `src/components/motion/reveal.tsx`).
6. **Export** it from `src/components/ui/index.ts`.
7. **Write (or update) its story** in `src/stories/<name>.stories.tsx`. This is
   not optional — every component in the core set has one, and a component with
   no story is invisible to the next person re-theming the project. Cover the
   variants and the interaction states (use `ForceState` from
   `src/stories/story-helpers.tsx` to pin hover / press / focus-visible, which
   props cannot reach). Restyling an existing component means updating its story
   in the same change, so the gallery never shows a look the app no longer has.
   Full conventions: `docs/storybook.md`.
8. **Verify:** `pnpm typecheck` and `pnpm lint` clean; open `pnpm storybook`,
   flip the **Surface** toolbar through Light / Dark / Side by side, read the
   Accessibility panel, and tab through the component with the keyboard.

## Checklist before done

- [ ] Behavior/ARIA untouched from RAC
- [ ] Only tokens + scoped custom CSS (no hardcoded colors)
- [ ] `className` override works via `composeRenderProps`
- [ ] Visible focus ring, keyboard-navigable
- [ ] Reduced-motion respected
- [ ] Exported from the barrel; typecheck + lint green
- [ ] Story added or updated in `src/stories/`, clean on both surfaces
