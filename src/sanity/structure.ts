import type { StructureResolver } from "sanity/structure";

// Studio desk structure. Customize per project as document types grow.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([S.documentTypeListItem("page").title("Pages")]);
