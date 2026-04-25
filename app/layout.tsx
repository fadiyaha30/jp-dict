import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";
import { theme } from "@/lib/theme";
import Navbar from "@/components/Navbar";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JDict — English-Japanese Dictionary",
  description: "Search English and Japanese words with readings, romaji, and JLPT levels",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSansJP.variable} suppressHydrationWarning>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body className="min-h-screen flex flex-col">
        <MantineProvider theme={theme} forceColorScheme="light">
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
