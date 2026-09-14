import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The keyboard focus ring.
 *
 * This test exists because the ring broke once and nothing noticed: combining
 * `outline-hidden` with `outline-2` in Tailwind v4 resolves to
 * `outline-style: none`, so every component using `focusRing` stopped painting
 * a focus indicator while lint, typecheck and the build all stayed green.
 *
 * Asserting on the class string would not have caught it, and neither would
 * asserting on the compiled CSS — Tailwind generates a utility if the class
 * name appears anywhere in the source, a code comment included. The only
 * meaningful check is the computed style of a really focused element.
 */
test("every keyboard-focused control paints a visible focus ring", async ({
  page,
}) => {
  await page.goto("/");

  const seen: string[] = [];

  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");

    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return {
        label: (el.textContent || el.tagName).trim().slice(0, 40),
        focusVisible: el.hasAttribute("data-focus-visible"),
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
      };
    });

    if (!focused?.focusVisible) continue;
    seen.push(focused.label);

    expect(
      focused.outlineStyle,
      `"${focused.label}" is focus-visible but has outline-style: ${focused.outlineStyle}`,
    ).not.toBe("none");
    expect(focused.outlineWidth).toBeGreaterThan(0);
  }

  // Guard the guard: if tabbing stopped finding controls the assertions above
  // would vacuously pass.
  expect(
    seen.length,
    "no focus-visible controls were reached by Tab",
  ).toBeGreaterThan(0);
});

test("the homepage has no detectable accessibility violations", async ({
  page,
}) => {
  // Not incidental: <Reveal> fades content in over 0.8s, and axe sampling
  // mid-fade sees semi-transparent text and reports a perfectly real
  // colour-contrast failure — flaky under parallel load rather than wrong.
  // Emulating the preference settles the page deterministically AND exercises
  // the reduced-motion path the project requires of every animation.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  // Report the offending selectors, not just the rule name — a bare
  // "color-contrast" tells you nothing about which token pairing is wrong.
  const detail = violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes
        .map((n) => n.target.join(" "))
        .join("\n    ")}`,
  );

  expect(detail, "axe reported accessibility violations").toEqual([]);
});
