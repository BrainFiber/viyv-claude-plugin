import type { Metadata } from "next";
import { Inter, Sora, Fira_Code } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  title: "viyv-claude-plugin | The Ultimate Plugin Manager for Claude",
  description: "Build, manage, and distribute Claude plugins with ease. The official Node.js library for viyv-claude-plugin.",
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
        <main style={{ minHeight: 'calc(100vh - var(--header-height))', paddingTop: 'var(--header-height)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
