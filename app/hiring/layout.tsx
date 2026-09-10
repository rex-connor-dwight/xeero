import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hiring Room — Xeero",
  description: "Real roles at startups building on Xeero. Browse open positions and apply directly.",
  openGraph: {
    title: "Hiring Room — Xeero",
    description: "Real roles at startups building on Xeero. Browse open positions and apply directly.",
    url: "https://xeero.me/hiring",
    siteName: "Xeero",
    type: "website",
    images: [
      {
        url: "https://xeero.me/hiring-og.png",
        width: 1200,
        height: 630,
        alt: "Hiring Room — Xeero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hiring Room — Xeero",
    description: "Real roles at startups building on Xeero.",
    images: ["https://xeero.me/hiring-og.png"],
  },
};

export default function HiringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}