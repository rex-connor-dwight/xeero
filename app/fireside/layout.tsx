import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xeero Fireside: Lagos Founder Chat",
  description: "A founder-led fireside chat in Lagos. Real founders, a few investors listening, and $200,000 in the room ready to back the right founder. Register your interest.",
  openGraph: {
    title: "Xeero Fireside: Lagos Founder Chat",
    description: "A founder-led fireside chat in Lagos. $200,000 in the room. Register your interest before a date and venue are locked in.",
    url: "https://xeero.me/fireside",
    siteName: "Xeero",
    type: "website",
    images: [
      {
        url: "https://xeero.me/fireside-og.png",
        width: 1200,
        height: 630,
        alt: "Xeero Fireside: Lagos Founder Chat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xeero Fireside: Lagos Founder Chat",
    description: "A founder-led fireside chat in Lagos. $200,000 in the room.",
    images: ["https://xeero.me/fireside-og.png"],
  },
};

export default function FiresideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}