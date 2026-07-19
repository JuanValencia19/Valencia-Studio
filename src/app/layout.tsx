import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Valencia Studio",
    template: "%s | Valencia Studio",
  },
  description:
    "Landing pages impulsadas por IA para negocios locales. Diseño premium, optimizadas para conversión, listas en días.",
  keywords: [
    "landing pages",
    "IA",
    "negocios locales",
    "diseño web",
    "Valencia Studio",
  ],
  authors: [{ name: "Valencia Studio" }],
  creator: "Valencia Studio",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Valencia Studio",
    title: "Valencia Studio — Landing pages con IA para negocios locales",
    description:
      "Landing pages impulsadas por IA para negocios locales. Diseño premium, optimizadas para conversión.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Valencia Studio",
    description:
      "Landing pages impulsadas por IA para negocios locales.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}