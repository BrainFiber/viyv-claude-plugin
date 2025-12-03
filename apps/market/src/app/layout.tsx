import type { Metadata } from "next";
import { Inter, Sora, Fira_Code } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "viyv-claude-plugin-market | Discover Claude Plugins",
  description: "Discover, share, and install plugins for Claude Code. The official marketplace for viyv-claude-plugin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} ${firaCode.variable}`}>
        <Header />
        <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
