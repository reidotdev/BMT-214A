import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

// The embedded Sanity Studio, served at /studio.
export default function StudioPage() {
  return <NextStudio config={config} />;
}
