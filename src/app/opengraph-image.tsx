import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { invitation } from "@/content/invitation";

export const alt = `A pop quiz from ${invitation.from}: one question, no studying required.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RULES = Array.from({ length: 9 }, (_, index) => 150 + index * 44);

export default async function OpengraphImage() {
  const [font, cat] = await Promise.all([
    // The OG renderer reads WOFF but not WOFF2.
    readFile(join(process.cwd(), "node_modules/@fontsource/protest-riot/files/protest-riot-latin-400-normal.woff")),
    readFile(join(process.cwd(), "src/features/quiz/stickers/cat-0.jpg")),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#ffe2ec",
        fontFamily: "Protest Riot",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: 1060,
          height: 520,
          background: "#fffdf8",
          borderRadius: 14,
          boxShadow: "0 30px 60px -20px rgba(122,36,80,0.45)",
          transform: "rotate(-1.2deg)",
        }}
      >
        {RULES.map((top) => (
          <div key={top} style={{ position: "absolute", left: 0, right: 0, top, height: 2, background: "#cfe0f4" }} />
        ))}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 86, width: 3, background: "#f5a3c1" }} />
        {[70, 250, 430].map((top) => (
          <div
            key={top}
            style={{
              position: "absolute",
              left: 30,
              top,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "#f4bdd1",
            }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 0 0 128px", width: 640 }}>
          <div style={{ fontSize: 120, color: "#c8174a", lineHeight: 1 }}>POP QUIZ</div>
          <div style={{ marginTop: 40, fontSize: 52, color: "#1f2747", lineHeight: 1.15 }}>One question.</div>
          <div style={{ fontSize: 52, color: "#1f2747", lineHeight: 1.15 }}>No studying required.</div>
          <div style={{ marginTop: 44, fontSize: 40, color: "#c8174a" }}>{`from ${invitation.from}`}</div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 92,
            display: "flex",
            padding: 14,
            background: "#ffffff",
            borderRadius: 26,
            boxShadow: "0 18px 30px -10px rgba(31,39,71,0.45)",
            transform: "rotate(4deg)",
          }}
        >
          <img
            src={`data:image/jpeg;base64,${cat.toString("base64")}`}
            width={270}
            height={270}
            alt=""
            style={{ borderRadius: 16, objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              top: -20,
              left: 110,
              width: 120,
              height: 38,
              background: "rgba(255,160,196,0.85)",
              transform: "rotate(-5deg)",
            }}
          />
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Protest Riot", data: font, style: "normal", weight: 400 }] },
  );
}
