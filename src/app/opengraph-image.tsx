import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social share image. Restyle per project (fonts, colors, layout).
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#0a0a0a",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        {siteConfig.name}
      </div>
      <div style={{ fontSize: 32, marginTop: 24, color: "#a3a3a3" }}>
        {siteConfig.description}
      </div>
    </div>,
    size,
  );
}
