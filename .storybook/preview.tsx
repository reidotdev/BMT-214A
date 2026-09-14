import { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { fontVariables } from "./fonts";
import "./preview.css";

type SurfaceMode = "light" | "dark" | "split";

/**
 * One themed canvas. `data-surface="dark"` is the project's real dark-section
 * mechanism (see `src/app/globals.css`): it redefines every semantic token
 * inside the element, so components need no dark variants of their own. Using
 * it here — rather than a Storybook-only background — means what a story shows
 * is exactly what a dark band on a page would show.
 */
function Surface({
  dark = false,
  label,
  children,
}: {
  dark?: boolean;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      {...(dark ? { "data-surface": "dark" } : {})}
      className={`${fontVariables} relative flex min-h-screen flex-col bg-background font-sans text-foreground`}
    >
      {label && (
        <span className="pointer-events-none absolute top-2 right-3 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
      )}
      {/* `items-start` so a lone Button hugs its content instead of stretching
          to the canvas width; stories that want full width ask for `w-full`. */}
      <div className="flex flex-1 flex-col items-start justify-center gap-6 p-8">
        {children}
      </div>
    </div>
  );
}

/** Wraps the active story in the surface chosen from the toolbar. */
function StoryCanvas({
  mode,
  story,
}: {
  mode: SurfaceMode;
  story: React.ReactNode;
}) {
  // Overlays (Modal, Popover, Tooltip) portal to <body>, which sits outside the
  // surface wrapper — so in dark mode the tokens have to go on <body> too, or a
  // menu would open light on a dark page. Side-by-side can only pick one body,
  // so it leaves overlays light: check those with Dark instead.
  useEffect(() => {
    const { body } = document;
    if (mode === "dark") body.setAttribute("data-surface", "dark");
    else body.removeAttribute("data-surface");
    return () => body.removeAttribute("data-surface");
  }, [mode]);

  if (mode === "split") {
    return (
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <Surface label="light">{story}</Surface>
        <Surface dark label="dark">
          {story}
        </Surface>
      </div>
    );
  }

  return <Surface dark={mode === "dark"}>{story}</Surface>;
}

const withSurface: Decorator = (Story, context) => (
  <StoryCanvas
    mode={(context.globals.surface as SurfaceMode) ?? "light"}
    story={<Story />}
  />
);

const preview: Preview = {
  decorators: [withSurface],

  globalTypes: {
    surface: {
      description: "Preview on a light or dark surface",
      toolbar: {
        title: "Surface",
        icon: "contrast",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "split", title: "Side by side", icon: "mirror" },
        ],
      },
    },
  },

  initialGlobals: {
    surface: "light",
  },

  parameters: {
    // The decorator owns padding and background, so Storybook must not add its
    // own — otherwise the dark surface would sit in a white frame.
    layout: "fullscreen",

    // Our surfaces come from design tokens; Storybook's background picker would
    // only ever be wrong.
    backgrounds: { disable: true },

    controls: {
      expanded: true,
      matchers: { date: /Date$/i },
    },

    // Runs axe on every story and reports in the Accessibility panel.
    // "todo" surfaces violations without failing; switch to "error" once a
    // project is clean and wants the test runner to enforce it.
    a11y: { test: "todo" },

    options: {
      storySort: {
        order: ["Foundations", "Actions", "Forms", "Navigation", "Overlays"],
      },
    },
  },
};

export default preview;
