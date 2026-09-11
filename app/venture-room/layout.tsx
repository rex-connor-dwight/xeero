import type { Metadata } from "next";
import { luckiestGuy } from "./fonts";

export const metadata: Metadata = {
  title: "The Venture Room: Founder Space Hosted by Connor",
  description: "A room for founders to gain clarity, make connections, and move forward. 26 September 2026 · Bridge by Obsidian, Yaba, Lagos.",
  openGraph: {
    title: "The Venture Room",
    description: "A room for founders to gain clarity, make connections, and move forward.",
    url: "https://xeero.me/venture-room",
    siteName: "Xeero",
    type: "website",
    images: [
      {
        url: "https://xeero.me/venture-room-og.png",
        width: 1200,
        height: 630,
        alt: "The Venture Room",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Venture Room",
    description: "A room for founders to gain clarity, make connections, and move forward.",
    images: ["https://xeero.me/venture-room-og.png"],
  },
};

export default function VentureRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={luckiestGuy.variable} style={{ backgroundColor: "#F7F4EF" }}>
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
      {children}
    </div>
  );
}