import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sanity serves images from its CDN; allow next/image to optimize them.
    // Without this every `urlFor(...)` image throws on first render.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
