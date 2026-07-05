export type IncorporationNote = {
    title: string;
    points: string[];
  };
  
  export const COUNTRY_NOTES: Record<string, IncorporationNote[]> = {
    nigeria: [
      {
        title: "What you're getting",
        points: [
          "Registration as a Private Limited Liability Company (Ltd) with the CAC — not a business name.",
          "This includes name reservation, CAC filing, stamp duty, and certified incorporation documents.",
          "Your RC number will also serve as your Tax Identification Number (TIN), as required from 2026.",
          "You'll need to disclose anyone owning more than 25% of the company at registration (Persons with Significant Control).",
        ],
      },
      {
        title: "Before you start",
        points: [
          "Have your proposed company name and two backup names ready — CAC may reject a name that's too similar to an existing one.",
          "You'll need valid ID for all directors and shareholders.",
          "Standard minimum share capital is ₦100,000 — this is a paperwork requirement, not cash you need upfront.",
          "Processing typically takes 1–2 weeks once your name is approved and documents are submitted.",
        ],
      },
      {
        title: "What's not included",
        points: [
          "Annual returns filing (a yearly obligation after your first year) is a separate, recurring service.",
          "Sector-specific permits (e.g. NAFDAC, CBN, NCC) if your business needs them.",
          "VAT registration, which only applies once your turnover exceeds ₦25 million.",
        ],
      },
    ],
    ghana: [
      {
        title: "What you're getting",
        points: [
          "Registration as a locally-owned Limited Liability Company (LTD) with the Registrar General's Department (RGD).",
          "This service is for Ghanaian-owned entities only — foreign or foreign-owned companies have a separate, much higher minimum capital requirement ($200,000–$500,000) and are not covered by this plan.",
          "Includes name search, name reservation, incorporation filing, and your Certificate of Incorporation.",
        ],
      },
      {
        title: "Before you start",
        points: [
          "You'll need at least two directors and one shareholder, each with valid ID.",
          "At least one director must be a Ghanaian resident.",
          "A registered office address in Ghana is required — we'll guide you on this if you don't have one yet.",
          "Processing typically takes 1–3 weeks.",
        ],
      },
      {
        title: "What's not included",
        points: [
          "Tax Identification Number (TIN) registration with the Ghana Revenue Authority — a quick follow-up step after incorporation.",
          "Business Operating Permits from your local Metropolitan or District Assembly.",
          "GIPC registration, which only applies if you have foreign ownership.",
        ],
      },
    ],
    delaware: [
      {
        title: "What you're getting",
        points: [
          "Formation of a Delaware C-Corporation — the standard structure investors and accelerators expect if you plan to raise venture capital.",
          "Includes state filing, your EIN (federal tax ID), founder stock issuance and documentation, and your first year of registered agent service.",
          "This mirrors what services like Stripe Atlas provide, at a comparable price point.",
        ],
      },
      {
        title: "Before you start",
        points: [
          "You'll need to decide on your number of authorized shares upfront — most startups choose 10,000,000 to leave room for future fundraising and employee equity.",
          "Filing an 83(b) election with the IRS within 30 days of your stock issuance is critical and time-sensitive — we'll flag this for you, but it's your responsibility to file it.",
          "A Delaware C-Corp is a US tax entity even if you and your team are based elsewhere — you'll want an accountant familiar with cross-border filings.",
        ],
      },
      {
        title: "What's not included",
        points: [
          "Ongoing annual costs — Delaware franchise tax (from $400/year) and registered agent renewal (from $100/year) — start in year two and are your responsibility.",
          "Foreign qualification if you also need to register to do business in another US state.",
          "A Delaware C-Corp has double taxation implications if you don't plan to raise investment — this structure isn't ideal for a bootstrapped, profit-distributing business.",
        ],
      },
    ],
  };
  
  export const GENERAL_DISCLAIMER =
    "Xeero facilitates incorporation through vetted partners but is not a law firm. This is not legal advice. Once your name is reserved, cancelling mid-process may not be fully refundable since work has already begun on your behalf.";