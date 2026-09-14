import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * The design tokens from `src/app/globals.css`, rendered live.
 *
 * The token layer has two levels, and the difference is the thing to see here:
 *
 * 1. **Palette** — raw named values (`--paper`, `--brand`, `--dark-raised`).
 *    Defined once on `:root`, the only place a colour literal appears. They do
 *    NOT change with the surface.
 * 2. **Semantic roles** — `--background`, `--primary`, `--muted-foreground` and
 *    friends, each pointing at a palette entry. These are what components use,
 *    and these are what `[data-surface="dark"]` re-points.
 *
 * So: flip the **Surface** toolbar to Dark. Every semantic swatch re-resolves;
 * every palette swatch stays put. A semantic swatch that does not move is a
 * colour that got hardcoded somewhere it should not have been.
 *
 * Re-theming a project means editing the palette block and nothing else.
 */
const meta: Meta = {
  title: "Foundations/Design tokens",
  // The swatch grids are decorative colour fields with no interactive content;
  // axe's contrast rule fires on the labels by design, and there is nothing to
  // fix. Component stories keep the audit on.
  parameters: { a11y: { disable: true } },
};

export default meta;
type Story = StoryObj;

/** Raw palette entries. No Tailwind utility maps to these — only the semantic
 *  layer does — so they are read straight out of CSS with `var()`. */
const palette: { group: string; vars: string[] }[] = [
  {
    group: "Light ground",
    vars: [
      "--paper",
      "--ink",
      "--ink-muted",
      "--line",
      "--surface",
      "--surface-strong",
    ],
  },
  {
    group: "Dark ground",
    vars: [
      "--dark",
      "--dark-raised",
      "--dark-surface",
      "--dark-muted",
      "--dark-accent",
      "--dark-line",
      "--dark-input",
      "--on-dark",
      "--on-dark-muted",
    ],
  },
  { group: "Brand", vars: ["--brand", "--brand-on", "--brand-light"] },
  { group: "Status", vars: ["--danger", "--on-danger"] },
];

/** Semantic pairs, addressed through the Tailwind utilities components use. */
const semantic: { name: string; className: string }[] = [
  {
    name: "background / foreground",
    className: "bg-background text-foreground",
  },
  { name: "card / card-foreground", className: "bg-card text-card-foreground" },
  {
    name: "primary / primary-foreground",
    className: "bg-primary text-primary-foreground",
  },
  {
    name: "secondary / secondary-foreground",
    className: "bg-secondary text-secondary-foreground",
  },
  {
    name: "muted / muted-foreground",
    className: "bg-muted text-muted-foreground",
  },
  {
    name: "accent / accent-foreground",
    className: "bg-accent text-accent-foreground",
  },
  {
    name: "destructive / destructive-foreground",
    className: "bg-destructive text-destructive-foreground",
  },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {title}
        </h2>
        {note && (
          <p className="max-w-prose text-sm text-muted-foreground">{note}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Layer 1. These are fixed values on `:root`, so they look the same on either
 * surface — that is the point. Change one here and everything downstream moves.
 */
export const Palette: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-10">
      {palette.map(({ group, vars }) => (
        <Section
          key={group}
          title={group}
          note="Raw values on :root. Identical on light and dark surfaces."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {vars.map((name) => (
              <div key={name} className="flex flex-col gap-2">
                <div
                  className="h-14 rounded-lg border border-border"
                  style={{ backgroundColor: `var(${name})` }}
                />
                <code className="text-xs text-muted-foreground">{name}</code>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  ),
};

/**
 * Layer 2. Each pair is a background and the foreground meant to sit on it.
 * Flip the Surface toolbar and watch them all re-point.
 */
export const SemanticRoles: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-10">
      <Section
        title="Semantic pairs"
        note="What components reference. Re-pointed wholesale by [data-surface=dark] and by the page theme."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {semantic.map((token) => (
            <div
              key={token.name}
              className={`flex h-20 flex-col justify-center rounded-lg border border-border px-4 ${token.className}`}
            >
              <span className="text-sm font-medium">{token.name}</span>
              <span className="text-xs opacity-70">The quick brown fox</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Lines and rings"
        note="--muted-foreground must clear 4.5:1 against the DARKEST surface it lands on (--muted), not against white."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex h-20 items-center justify-center rounded-lg border-4 border-border text-sm">
            border
          </div>
          <div className="flex h-20 items-center justify-center rounded-lg border-4 border-input text-sm">
            input
          </div>
          <div className="flex h-20 items-center justify-center rounded-lg text-sm outline-4 outline-offset-[-4px] outline-ring">
            ring
          </div>
        </div>
      </Section>
    </div>
  ),
};

/**
 * `data-surface` is a SECTION scope, not a page theme — the mechanism a
 * full-bleed dark band on an otherwise light page should use. Both islands
 * below render in the same document, whatever the toolbar is set to.
 */
export const SurfaceScopes: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      {(["light", "dark"] as const).map((surface) => (
        <div
          key={surface}
          data-surface={surface}
          className="flex flex-col gap-3 rounded-xl border border-border p-6"
        >
          <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            data-surface=&quot;{surface}&quot;
          </span>
          <p className="text-sm text-foreground">
            Foreground text on this section&apos;s own background.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
              primary
            </span>
            <span className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
              secondary
            </span>
            <span className="rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground">
              muted
            </span>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** One family: Inter via `next/font`, exposed as `--font-inter` → `font-sans`. */
export const Typography: Story = {
  render: () => (
    <div className="flex w-full max-w-3xl flex-col gap-10">
      <Section
        title="font-sans · Inter"
        note="Declared in src/app/layout.tsx and mirrored in .storybook/fonts.ts. Add a display face in both places."
      >
        <div className="flex flex-col gap-2">
          <p className="text-4xl leading-tight font-semibold">
            The quick brown fox
          </p>
          <p className="text-2xl">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-base">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
          <p className="text-xs text-muted-foreground">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </Section>

      <Section title="Weights">
        <div className="flex flex-col gap-1 text-xl">
          <p className="font-normal">Regular 400</p>
          <p className="font-medium">Medium 500</p>
          <p className="font-semibold">Semibold 600</p>
          <p className="font-bold">Bold 700</p>
        </div>
      </Section>
    </div>
  ),
};

/** Every radius derives from the single `--radius` token. */
export const Radii: Story = {
  render: () => (
    <Section
      title="--radius scale"
      note="sm/md/lg/xl are calc() offsets from one --radius value; change that and every corner follows."
    >
      <div className="flex flex-wrap gap-6">
        {(
          ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"] as const
        ).map((radius) => (
          <div key={radius} className="flex flex-col items-center gap-2">
            <div className={`size-20 bg-secondary ${radius}`} />
            <span className="text-xs text-muted-foreground">{radius}</span>
          </div>
        ))}
      </div>
    </Section>
  ),
};
