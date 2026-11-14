import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Providers } from "./providers";

import "./globals.css";

const inter = localFont({
  src: "../assets/fonts/inter-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const spaceGrotesk = localFont({
  src: "../assets/fonts/space-grotesk-latin.woff2",
  variable: "--font-display",
  weight: "300 700",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jetBrainsMono = localFont({
  src: "../assets/fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
  weight: "100 800",
  style: "normal",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "NEXUS STREAM // Cyber-HUD",
    template: "%s // NEXUS STREAM",
  },
  description:
    "Tactical neon video streaming HUD — emotional timelines, chrono-pure feeds and a reactive design system.",
  applicationName: "NEXUS STREAM",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#07080D",
  colorScheme: "dark",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-dvh bg-void font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
