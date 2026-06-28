import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import PWAInstaller from "@/components/PWAInstaller";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ファヤの辞書 — English-Japanese Dictionary",
  description: "Search English and Japanese words with readings, romaji, and JLPT levels",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "辞書",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={notoSansJP.variable} suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <PWAInstaller />
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
