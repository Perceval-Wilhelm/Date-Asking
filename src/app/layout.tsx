import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { DeskDecor } from "@/components/desk-decor";
import { SiteMonitoring } from "@/components/site-monitoring";
import { invitation } from "@/content/invitation";
import "./globals.css";

const hand = localFont({
  src: "../../node_modules/@fontsource-variable/shantell-sans/files/shantell-sans-latin-wght-normal.woff2",
  variable: "--font-shantell",
  weight: "300 800",
  display: "swap",
});

const display = localFont({
  src: "../../node_modules/@fontsource/protest-riot/files/protest-riot-latin-400-normal.woff2",
  variable: "--font-protest",
  weight: "400",
  display: "swap",
});

const description = "One question. No studying required. ♡";

// metadataBase is left to Next.js, which uses the deployment's own URL on Vercel previews and production.
export const metadata: Metadata = {
  title: `Psst… a pop quiz from ${invitation.from} ✏️`,
  description,
  openGraph: {
    title: `${invitation.from} passed you a note 💌`,
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffe2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1530" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${hand.variable} ${display.variable}`}>
      <body>
        <DeskDecor />
        <main className="desk">{children}</main>
        <footer className="foot">made with ♡ by {invitation.from}</footer>
        <SiteMonitoring enabled={process.env.VERCEL_ENV === "production" && process.env.NODE_ENV === "production"} />
      </body>
    </html>
  );
}
