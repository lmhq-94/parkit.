import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          letterSpacing: "-0.18em",
          fontSize: 46,
          lineHeight: 1,
        }}
      >
        <span style={{ color: "#020617" }}>p</span>
        <span style={{ color: "#2563eb", marginLeft: 1 }}>.</span>
      </div>
    ),
    { ...size }
  );
}
