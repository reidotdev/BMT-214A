import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------
   Helpers shared by the component stories. Storybook-only — nothing here is
   imported by the app.
   ------------------------------------------------------------------------- */

/**
 * Pins a React Aria state on for display.
 *
 * RAC exposes interaction state as `data-*` attributes (`data-hovered`,
 * `data-pressed`, `data-focus-visible`, …) and our components style those with
 * Tailwind attribute variants. Hover and press cannot be simulated with props,
 * so a static "every state" gallery would otherwise be impossible.
 *
 * The attributes are written straight onto the rendered element — exactly what
 * RAC would write — so the result is the genuine style, not an approximation.
 * A MutationObserver puts them back whenever RAC re-renders and strips them,
 * which it does on mount for the composite components (Select, ComboBox, …).
 *
 * `selector` picks a descendant when the styled element is not the root — e.g.
 * `selector="input"` for TextField, whose state classes live on the <input>.
 */
export function ForceState({
  states,
  selector,
  children,
}: {
  states: string[];
  selector?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // A stable dependency: the array literal callers pass is new every render.
  const stateKey = states.join(" ");

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;
    // React Aria builds its collections in a <template> sibling, so the first
    // element child is not always the component's root — skip anything that
    // does not render.
    const root = [...wrapper.children].find(
      (child) => !["TEMPLATE", "SCRIPT", "STYLE"].includes(child.tagName),
    );
    if (!root) return;
    const target = selector ? wrapper.querySelector(selector) : root;
    if (!(target instanceof HTMLElement)) return;

    const attributes = stateKey.split(" ").map((state) => `data-${state}`);
    const apply = () => {
      for (const attribute of attributes) {
        if (!target.hasAttribute(attribute))
          target.setAttribute(attribute, "true");
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(target, { attributes: true, attributeFilter: attributes });
    return () => observer.disconnect();
  }, [selector, stateKey]);

  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

/** A labelled cell — the unit the state/variant galleries are built from. */
export function Cell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-start gap-2 ${className ?? ""}`}>
      <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Grid of `Cell`s. Use for "all variants" / "all states" overviews. */
export function Grid({
  children,
  cols = 3,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const template = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  }[cols];
  return (
    <div className={`grid grid-cols-1 gap-x-8 gap-y-6 ${template}`}>
      {children}
    </div>
  );
}

/** Horizontal run of examples, e.g. one per size. */
export function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}

/** Vertical stack, for form examples. */
export function Stack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex w-full max-w-sm flex-col gap-5 ${className ?? ""}`}>
      {children}
    </div>
  );
}
