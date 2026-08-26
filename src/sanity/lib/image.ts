import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = imageUrlBuilder(client);

// Derive the accepted source type from the builder so we don't depend on a
// deep internal import path (which moves between @sanity/image-url versions).
type ImageSource = Parameters<typeof builder.image>[0];

/** Build a URL for a Sanity image reference. Usage: urlFor(image).width(800).url() */
export function urlFor(source: ImageSource) {
  return builder.image(source);
}
