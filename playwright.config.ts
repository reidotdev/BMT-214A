import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end checks. Deliberately small: this is a boilerplate, not an app, so
 * the suite covers the things that break silently and stay broken — keyboard
 * focus, and the accessibility contract React Aria is here to provide.
 *
 * Chromium only. Running the full browser matrix on a starter is time nobody
 * gets back; add browsers in a project once it has behaviour worth matrixing.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Tests run against a PRODUCTION build, not `next dev`. The focus-ring bug
  // these tests exist to catch is a Tailwind compilation problem, and dev and
  // prod do not compile CSS identically.
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_SITE_URL: "http://localhost:3000" },
  },
});
