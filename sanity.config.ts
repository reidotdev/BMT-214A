"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, safeProjectId } from "@/sanity/env";
import { schema } from "@/sanity/schemaTypes";
import { structure } from "@/sanity/structure";

// Config for the Studio embedded at /studio. Uses safeProjectId so the app
// builds before Sanity is configured; the real project id comes from env.
export default defineConfig({
  basePath: "/studio",
  projectId: safeProjectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
