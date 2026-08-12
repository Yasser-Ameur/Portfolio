import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yasserameur.me"),
  title: {
    default: "Yasser Ameur — Computer Science @ EPFL",
    template: "%s — Yasser Ameur",
  },
  description:
    "Yasser Ameur is a Computer Science student at EPFL building distributed systems, backend infrastructure, machine learning applications, and agentic AI systems.",
  keywords: [
    "Yasser Ameur",
    "EPFL",
    "Computer Science",
    "Distributed Systems",
    "Backend Engineering",
    "Machine Learning",
    "Information Retrieval",
    "Agentic AI",
    "Software Engineer",
  ],
  authors: [{ name: "Yasser Ameur" }],
  creator: "Yasser Ameur",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://yasserameur.me",
    siteName: "Yasser Ameur",
    title: "Yasser Ameur — Computer Science @ EPFL",
    description:
      "Yasser Ameur is a Computer Science student at EPFL building distributed systems, backend infrastructure, machine learning applications, and agentic AI systems.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yasser Ameur — Computer Science @ EPFL",
    description:
      "Yasser Ameur is a Computer Science student at EPFL building distributed systems, backend infrastructure, machine learning applications, and agentic AI systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#03050b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
