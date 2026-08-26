/**
 * Shared style primitives for the UI components. Keeping the focus ring and
 * field styles in one place means a project can restyle every component's
 * focus treatment or input chrome by editing here — not 11 files.
 *
 * React Aria Components render state as `data-*` attributes (data-hovered,
 * data-pressed, data-focus-visible, data-selected, data-disabled, …). We style
 * them with Tailwind arbitrary variants like `data-[hovered]:` — always correct
 * against RAC's output. The `tailwindcss-react-aria-components` plugin is also
 * loaded (globals.css) if you prefer its named variants.
 */

export const focusRing =
  "outline-hidden data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-ring";

export const fieldBorder =
  "border border-input data-[hovered]:border-ring/60 data-[focus-within]:border-ring";
