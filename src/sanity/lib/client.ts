import { createClient } from "next-sanity";
import { apiVersion, dataset, safeProjectId } from "../env";

export const client = createClient({
  projectId: safeProjectId,
  dataset,
  apiVersion,
  useCdn: true,
});
