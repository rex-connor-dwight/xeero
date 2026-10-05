"use client";

import { useState } from "react";
import Nav from "@/components/venture-room/Nav";
import Hero from "@/components/venture-room/Hero";
import JourneySection from "@/components/venture-room/JourneySection";
import AboutSection from "@/components/venture-room/AboutSection";
import WhoItsForSection from "@/components/venture-room/WhoItsForSection";
import ExperienceSection from "@/components/venture-room/ExperienceSection";
import HostSection from "@/components/venture-room/HostSection";
import EventDetailsSection from "@/components/venture-room/EventDetailsSection";
import LagosRecapSection from "@/components/venture-room/LagosRecapSection";
import SponsorsSection from "@/components/venture-room/SponsorsSection";
import RegistrationModal from "@/components/venture-room/RegistrationModal";
import FinalCTA from "@/components/venture-room/FinalCTA";

export default function VentureRoomPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const openRegistration = () => setShowRegistration(true);

  return (
    <div>
      <Nav onRegister={openRegistration} />
      <Hero onRegister={openRegistration} />
      <JourneySection onRegister={openRegistration} />
      <AboutSection />
      <WhoItsForSection />
      <ExperienceSection />
      <HostSection />
      <EventDetailsSection />
      <LagosRecapSection />
      <SponsorsSection />
      <FinalCTA onRegister={openRegistration} />

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