export type PackageKey = "clarity" | "advisory_session" | "strategy_intensive" | "founder_intensive";

export type AdvisoryPackage = {
  key: PackageKey;
  name: string;
  duration: string;
  price: number;
  priceLabel: string;
  isFree: boolean;
  tagline: string;
  bestFor: string[];
  includes: string[];
  afterCall?: string[];
  featured?: boolean;
  hasModeSelection?: boolean;
};

export const ADVISORY_PACKAGES: AdvisoryPackage[] = [
  {
    key: "clarity",
    name: "Clarity Call",
    duration: "15 minutes",
    price: 0,
    priceLabel: "Free",
    isFree: true,
    tagline: "For founders who want a quick second opinion before going deeper.",
    bestFor: [],
    includes: [
      "A quick read on your idea or current stage",
      "One or two blind spots worth paying attention to",
      "Whether your problem is worth solving right now",
      "What stage-appropriate next step looks like for you",
    ],
    afterCall: [
      "An honest read on where you stand",
      "One clear next step to take",
      "A recommendation on whether to go deeper",
      "Any relevant resource, if applicable",
    ],
  },
  {
    key: "advisory_session",
    name: "Venture Advisory Session",
    duration: "45 minutes",
    price: 250,
    priceLabel: "$250",
    isFree: false,
    tagline: "Suitable for founders who already have something.",
    bestFor: [],
    includes: [
      "Review your business model",
      "Identify risks and blind spots",
      "Validate your market assumptions",
      "Review your go-to-market strategy",
      "Discuss fundraising readiness",
      "Review product strategy and prioritization",
    ],
    afterCall: [
      "Summary of recommendations",
      "Action plan",
      "Resource recommendations where applicable",
      "Clarity on whether a deeper engagement makes sense",
    ],
    featured: true,
  },
  {
    key: "strategy_intensive",
    name: "Venture Strategy Intensive",
    duration: "2 hours",
    price: 750,
    priceLabel: "$750",
    isFree: false,
    tagline: "This isn't a call. It's a working session. Suitable for founders preparing to raise capital, launch, pivot, or scale.",
    bestFor: [],
    includes: [
      "Deep product and business model review",
      "Pricing and go-to-market strategy",
      "Fundraising strategy and cap table review",
      "Investor readiness assessment",
      "Hiring strategy and founder positioning",
      "Growth roadmap and venture architecture",
    ],
    afterCall: [
      "A 90-day roadmap",
      "Prioritized action items",
      "Clear milestones",
      "Venture strategy recommendations",
    ],
  },
  {
    key: "founder_intensive",
    name: "One Week Founder Intensive",
    duration: "1 week — 2 hours daily",
    price: 2000,
    priceLabel: "$2,000",
    isFree: false,
    tagline: "Very few founders need this. But the ones preparing to raise serious capital will. I become your temporary venture partner for the week.",
    bestFor: [],
    includes: [
      "Full pitch deck review and rebuild",
      "Fundraising strategy and investor targeting",
      "Product and roadmap prioritization",
      "Customer validation and go-to-market review",
      "Daily 2-hour working sessions across the week",
      "Unlimited WhatsApp and voice note access throughout",
    ],
    afterCall: [
      "A fundraise-ready pitch deck",
      "An investor target list",
      "A 90-day execution plan",
      "Direct feedback on every major decision made that week",
    ],
    hasModeSelection: true,
  },
];

export function getPackage(key: PackageKey): AdvisoryPackage | undefined {
  return ADVISORY_PACKAGES.find((p) => p.key === key);
}

// Update these once the Calendly event types are created
export const CALENDLY_LINKS: Record<string, string> = {
  clarity: "https://calendly.com/rexconnordwight/30min",
  advisory_session: "https://calendly.com/YOUR-LINK/advisory-session",
  strategy_intensive: "https://calendly.com/YOUR-LINK/strategy-intensive",
  founder_intensive_virtual: "https://calendly.com/YOUR-LINK/founder-intensive-virtual",
  founder_intensive_physical: "https://calendly.com/YOUR-LINK/founder-intensive-physical",
};

export function getCalendlyLink(packageKey: PackageKey, sessionMode?: "virtual" | "physical" | null): string {
  if (packageKey === "founder_intensive" && sessionMode) {
    return CALENDLY_LINKS[`founder_intensive_${sessionMode}`];
  }
  return CALENDLY_LINKS[packageKey];
}

export const PHYSICAL_COORDINATION_NOTE =
  "Since you've selected an in-person format, I'll follow up by email to coordinate location and logistics before your first session.";