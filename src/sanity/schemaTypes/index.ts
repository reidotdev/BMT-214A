import type { SchemaTypeDefinition } from "sanity";
import { pageType } from "./pageType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [pageType],
};
