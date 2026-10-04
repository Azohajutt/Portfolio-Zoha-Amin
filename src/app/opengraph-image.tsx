import { ImageResponse } from "next/og";
import { siteContent } from "@/lib/content";

export const alt = `${siteContent.name} — AI Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(145deg, #071012 0%, #0f2a2c 55%, #123d3a 100%)",
          color: "#e8f2f3",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#2dd4bf" }}>
          AI Engineer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{siteContent.name}</div>
          <div style={{ fontSize: 34, color: "#93a4a8", maxWidth: 900 }}>{siteContent.positioning}</div>
        </div>
        <div style={{ fontSize: 24, color: "#2dd4bf" }}>50+ languages · 100+ calls/day · Voice AI · RAG · CV</div>
      </div>
    ),
    { ...size },
  );
}
