import type { Metadata } from "next";
import "./globals.css";
import { XeeroProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "Xeero: Everything your startup needs in one link",
  description: "Build a professional startup profile in minutes. Share your pitch deck, waitlist, data room, and founder CV with investors, all from one clean link.",
  keywords: ["startup profile", "pitch deck", "founder profile", "data room", "African startups", "fundraising tool", "investor ready"],
  authors: [{ name: "Xeero" }],
  creator: "Xeero",
  metadataBase: new URL("https://xeero.me"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Xeero: Everything your startup needs in one link",
    description: "Build a professional startup profile in minutes. One link holds your pitch deck, waitlist, data room, and founder CV.",
    url: "https://xeero.me",
    siteName: "Xeero",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://xeero.me/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xeero — Everything your startup needs in one link",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xeero: Everything your startup needs in one link",
    description: "Build a professional startup profile in minutes. One link for investors, press, and early users.",
    creator: "@xeero",
    images: ["https://xeero.me/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <XeeroProvider>
          {children}
        </XeeroProvider>
      </body>
    </html>
  );
}