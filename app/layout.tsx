import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE = "https://yasserameur.me";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Yasser Ameur",
  description:
    "An interactive walk through a life — from a yard in Morocco to engineering at EPFL, and onward. Software engineer, distributed systems, and things still being built.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Yasser Ameur",
    description:
      "An interactive walk through a life — from a yard in Morocco to engineering at EPFL, and onward.",
    url: SITE,
    siteName: "Yasser Ameur",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yasser Ameur",
    description: "An interactive walk through a life.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrument.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
