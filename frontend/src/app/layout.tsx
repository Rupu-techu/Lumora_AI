import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lumora AI",
    template: "%s | Lumora AI",
  },
  description:
    "Lumora AI is a powerful platform for AI-driven image generation and creative workflows powered by IBM Granite.",
  applicationName: "Lumora AI",
  keywords: [
    "Lumora AI",
    "AI image generation",
    "creative workflows",
    "IBM Granite",
    "Next.js",
    "FastAPI",
  ],
  openGraph: {
    title: "Lumora AI",
    description:
      "Lumora AI is a powerful platform for AI-driven image generation and creative workflows powered by IBM Granite.",
    url: "/",
    siteName: "Lumora AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora AI",
    description:
      "Lumora AI is a powerful platform for AI-driven image generation and creative workflows powered by IBM Granite.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-brand-dark text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
