import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venture Advisory — Xeero",
  description: "Structured advisory for founders building something real. From a quick clarity call to a full week working side by side, pick the level of support that matches where you are.",
  openGraph: {
    title: "Venture Advisory — Xeero",
    description: "Structured advisory for founders building something real. From a quick clarity call to a full week working side by side, pick the level of support that matches where you are.",
    url: "https://xeero.me/advisory",
    siteName: "Xeero",
    type: "website",
    images: [
      {
        url: "https://xeero.me/advisory.png",
        width: 1200,
        height: 630,
        alt: "Venture Advisory — Xeero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Venture Advisory — Xeero",
    description: "Structured advisory for founders building something real.",
    images: ["https://xeero.me/advisory.png"],
  },
};

export default function AdvisoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}