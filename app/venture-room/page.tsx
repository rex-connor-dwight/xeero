"use client";

import { useState } from "react";
import Nav from "@/components/venture-room/Nav";
import Hero from "@/components/venture-room/Hero";
import AboutSection from "@/components/venture-room/AboutSection";
import WhoItsForSection from "@/components/venture-room/WhoItsForSection";
import ExperienceSection from "@/components/venture-room/ExperienceSection";
import HostSection from "@/components/venture-room/HostSection";
import PastEditionSection from "@/components/venture-room/PastEditionSection";
import SponsorsSection from "@/components/venture-room/SponsorsSection";
import RegistrationModal from "@/components/venture-room/RegistrationModal";
import FinalCTA from "@/components/venture-room/FinalCTA";

export default function VentureRoomPage() {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div>
      <Nav onRegister={() => setShowRegistration(true)} />
      <Hero onRegister={() => setShowRegistration(true)} />
      <AboutSection />
      <WhoItsForSection />
      <ExperienceSection />
      <HostSection />
      <PastEditionSection />
      <SponsorsSection />
      <FinalCTA onRegister={() => setShowRegistration(true)} />

      {showRegistration && (
        <RegistrationModal onClose={() => setShowRegistration(false)} />
      )}

      <style>{`
        @media (max-width: 820px) {
          nav > div:first-child > div:nth-child(2) { display: none !important; }
          nav > div:first-child > button:nth-child(3) { display: none !important; }
          nav > div:first-child > button:last-child { display: flex !important; }
        }
      `}</style>
    </div>
  );
}