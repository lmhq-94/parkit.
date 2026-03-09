import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

async function loadCalSans(): Promise<ArrayBuffer | null> {
  try {
    const fontPath = path.join(process.cwd(), "src", "fonts", "CalSans.ttf");
    const buf = await readFile(fontPath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

export default async function Icon() {
  const fontData = await loadCalSans();
  const fontFamily = fontData ? "Cal Sans" : "system-ui, -apple-system, sans-serif";

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
          fontFamily,
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
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Cal Sans",
                data: fontData,
                weight: 700,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    }
  );
}
