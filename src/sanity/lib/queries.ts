import { defineQuery } from "next-sanity";

export const pagesQuery = defineQuery(
  `*[_type == "page"] | order(title asc){ _id, title, "slug": slug.current, excerpt }`,
);
