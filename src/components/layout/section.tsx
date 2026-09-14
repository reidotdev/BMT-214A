import { cn } from "@/lib/utils";

export interface SectionProps extends React.ComponentPropsWithoutRef<"section"> {
  /**
   * `dark` flips the semantic tokens for this subtree via `data-surface`, so
   * components inside render light-on-dark with no variant props and no
   * hardcoded colours. See the `[data-surface="dark"]` block in
   * `src/app/globals.css`.
   *
   * `light` does the same in reverse — a light band inside a dark page theme.
   */
  surface?: "default" | "dark" | "light";
  /** Classes for the inner content band rather than the outer section. */
  bandClassName?: string;
  /**
   * Full-bleed layer painted behind the content band — a background video or
   * image. It is stretched to the whole section and clipped to it, and the band
   * is lifted above it.
   *
   * Purely decorative: the section keeps its token background underneath, so
   * the layout is unchanged if the media never loads. Having this as a slot is
   * what stops a hero background from becoming a hero-only special case.
   */
  backdrop?: React.ReactNode;
}

/**
 * Page section: full-bleed background, centred content band with gutters.
 *
 * Use it for every section on a page so the band stays consistent — then the
 * measurements change here, in one file, instead of in five.
 */
export function Section({
  surface = "default",
  className,
  bandClassName,
  backdrop,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      {...props}
      data-surface={surface === "default" ? undefined : surface}
      className={cn(
        "w-full",
        backdrop && "relative overflow-hidden",
        className,
      )}
    >
      {backdrop && (
        <div className="pointer-events-none absolute inset-0">{backdrop}</div>
      )}

      {/* The content band. Change the max width and gutters here — every
          section on the site follows. */}
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-6 lg:px-12",
          backdrop && "relative z-10",
          bandClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
