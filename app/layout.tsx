import type { Metadata, Viewport } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Rakugaki",
  description: "A local-first markdown note-taking app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rakugaki",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dynamic manifest icon switching via JS after mount */}
        <link rel="icon" href="/icons/rakugaki-light.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          href="/icons/rakugaki-light.png"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
