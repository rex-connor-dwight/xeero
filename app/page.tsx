"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ValidateSection from "@/components/landing/ValidateSection";
import Pricing from "@/components/landing/Pricing";
import CtaFooter from "@/components/landing/CtaFooter";

function ErrorHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    if (error === "access_denied" && errorCode === "otp_expired") {
      router.push("/auth?error=link_expired");
    }
  }, []);

  return null;
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <ErrorHandler />
      </Suspense>

      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", overflowX: "hidden" }}>
        <Nav />
        <Hero />
        <HowItWorks />
        <Features />
        <ValidateSection />
        <Pricing />
        <CtaFooter />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Xeero",
            "description": "Build a professional startup profile in minutes. One link holds your pitch deck, waitlist, data room, and founder CV.",
            "url": "https://xeero.me",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "9",
              "priceCurrency": "USD",
              "description": "One-time payment to publish your startup profile",
            },
            "creator": {
              "@type": "Organization",
              "name": "Xeero",
              "url": "https://xeero.me",
            },
          }),
        }}
      />
    </>
  );
}