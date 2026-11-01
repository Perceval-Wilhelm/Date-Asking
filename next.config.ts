import type { NextConfig } from "next";

const preview = process.env.VERCEL_ENV === "preview";
// Vercel's preview toolbar (comments, feedback) loads from vercel.live.
const toolbar = (...sources: string[]) => (preview ? ` ${sources.join(" ")}` : "");

// Next.js bootstraps with inline scripts, so a nonce-free static site keeps 'unsafe-inline';
// the policy still blocks third-party scripts, framing, plugins and base-tag hijacking.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${toolbar("https://vercel.live")}`,
  `style-src 'self' 'unsafe-inline'${toolbar("https://vercel.live")}`,
  `img-src 'self' data: blob:${toolbar("https://vercel.live", "https://vercel.com")}`,
  `font-src 'self'${toolbar("https://vercel.live", "https://assets.vercel.com")}`,
  `connect-src 'self'${toolbar("https://vercel.live", "wss://ws-us3.pusher.com")}`,
  // canvas-confetti draws in a worker created from a blob URL.
  "worker-src 'self' blob:",
  `frame-src ${preview ? "https://vercel.live" : "'none'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  devIndicators: false,
  agentRules: false,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    // Development needs eval for Fast Refresh; production builds get the full policy.
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
