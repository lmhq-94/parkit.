import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          letterSpacing: "-0.08em",
          fontSize: 30,
          textShadow: "0 0 0 1px rgba(15,23,42,0.2)",
        }}
      >
        <span style={{ color: "#0f172a" }}>p</span>
        <span style={{ color: "#2563eb" }}>.</span>
      </div>
    ),
    { ...size }
  );
}
