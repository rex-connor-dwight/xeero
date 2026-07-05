// ── Sample Templates ───────────────────────────────────────────────────────

export type TemplateSection = {
    id: string;
    title: string;
    description: string;
    documents: TemplateDocument[];
  };
  
  export type TemplateDocument = {
    id: string;
    name: string;
    description: string;
    required: boolean;
    template_url?: string;
  };
  
  export const sampleTemplates: TemplateSection[] = [
    {
      id: "company",
      title: "Company Overview",
      description: "Help investors understand who you are and what you do.",
      documents: [
        {
          id: "pitch_deck",
          name: "Pitch Deck",
          description: "Your core investor presentation. Should cover problem, solution, market, traction, team, and ask.",
          required: true,
        },
        {
          id: "executive_summary",
          name: "Executive Summary",
          description: "A one to two page summary of your business for investors who want the quick version first.",
          required: false,
        },
        {
          id: "company_overview",
          name: "Company Overview",
          description: "A detailed document covering your mission, vision, product, and business model.",
          required: false,
        },
      ],
    },
    {
      id: "legal",
      title: "Legal Documents",
      description: "The documents that prove your startup exists and is properly structured.",
      documents: [
        {
          id: "incorporation",
          name: "Certificate of Incorporation",
          description: "Proof that your company is legally registered. CAC certificate for Nigerian startups, or equivalent.",
          required: true,
        },
        {
          id: "shareholder_agreement",
          name: "Shareholder Agreement",
          description: "Outlines the rights and responsibilities of each shareholder. Critical for co-founded startups.",
          required: true,
        },
        {
          id: "cap_table",
          name: "Cap Table",
          description: "A spreadsheet showing who owns what percentage of the company and on what terms.",
          required: true,
        },
        {
          id: "founders_agreement",
          name: "Founders Agreement",
          description: "Details the roles, equity split, and vesting schedule for each founder.",
          required: false,
        },
      ],
    },
    {
      id: "financials",
      title: "Financial Documents",
      description: "Show investors you understand your numbers and have a credible path to growth.",
      documents: [
        {
          id: "financial_projections",
          name: "Financial Projections",
          description: "Three to five year revenue and expense projections. Show assumptions clearly.",
          required: true,
        },
        {
          id: "current_financials",
          name: "Current Financials",
          description: "Profit and loss statement, balance sheet, and cash flow for the last 12 months if available.",
          required: false,
        },
        {
          id: "use_of_funds",
          name: "Use of Funds",
          description: "A breakdown of exactly how you plan to deploy the capital you are raising.",
          required: true,
        },
        {
          id: "unit_economics",
          name: "Unit Economics",
          description: "CAC, LTV, payback period, gross margin. The numbers that prove your business model works.",
          required: false,
        },
      ],
    },
    {
      id: "traction",
      title: "Traction & Metrics",
      description: "Prove that real people want what you are building.",
      documents: [
        {
          id: "metrics_dashboard",
          name: "Metrics Dashboard",
          description: "Key performance indicators over time. Revenue, users, growth rate, retention.",
          required: true,
        },
        {
          id: "customer_references",
          name: "Customer References",
          description: "Testimonials, case studies, or reference contacts from your best customers.",
          required: false,
        },
        {
          id: "product_roadmap",
          name: "Product Roadmap",
          description: "Where the product is going and when. Shows investors you have a plan beyond today.",
          required: false,
        },
      ],
    },
    {
      id: "team",
      title: "Team",
      description: "Investors bet on people first. Make your team impossible to ignore.",
      documents: [
        {
          id: "team_bios",
          name: "Team Bios",
          description: "One page bios for each founder and key hire. Focus on relevant experience and why you.",
          required: true,
        },
        {
          id: "org_chart",
          name: "Org Chart",
          description: "Visual representation of your current team structure and planned hires.",
          required: false,
        },
        {
          id: "advisors",
          name: "Advisors & Board",
          description: "Who is in your corner. Names, credentials, and what they bring to the table.",
          required: false,
        },
      ],
    },
  ];