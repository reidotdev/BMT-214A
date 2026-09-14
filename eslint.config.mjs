import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  // Patterns are `**/`-prefixed so build output is ignored at ANY depth. The
  // root-relative form misses nested checkouts — e.g. Claude Code worktrees
  // under .claude/worktrees/*, each carrying its own .next/ — and lint then
  // walks tens of thousands of generated files and takes minutes.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    // Storybook's static build output — minified bundles, never source. Without
    // this carve-out `pnpm lint` walks the whole bundle after a
    // `pnpm build-storybook`.
    "**/storybook-static/**",
    // Claude Code worktrees are separate checkouts — linted in their own tree.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
