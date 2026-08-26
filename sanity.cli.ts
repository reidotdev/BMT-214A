import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "@/sanity/env";

// Powers the `sanity` CLI (deploy, dataset management). Reads the same env
// as the app. scripts/setup.mjs runs `sanity init` to populate these.
export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: true,
});
