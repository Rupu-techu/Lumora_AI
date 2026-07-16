import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imaginex AI — Create Without Limits",
  description:
    "Imaginex AI is a powerful platform for AI-driven image generation and creative workflows powered by IBM Granite.",
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
