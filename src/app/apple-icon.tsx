import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#ffe2ec",
      }}
    >
      <svg width="140" height="140" viewBox="0 0 64 64">
        <rect x="5" y="13" width="54" height="40" rx="6" fill="#fffdf8" stroke="#1f2747" strokeWidth="3.5" />
        <path d="M6 16 L32 36 L58 16" fill="#f3e9d8" stroke="#1f2747" strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="32" cy="36" r="11" fill="#c8174a" />
        <path
          d="M32 42 C 27.5 39, 25.5 36.6, 26 34.6 C 26.5 32.6, 29.6 32.2, 32 34.6 C 34.4 32.2, 37.5 32.6, 38 34.6 C 38.5 36.6, 36.5 39, 32 42 Z"
          fill="#fff"
        />
      </svg>
    </div>,
    size,
  );
}
