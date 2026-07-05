// ── Carousel ───────────────────────────────────────────────────────────────

export type CarouselSlide = {
    tag: string;
    headline: string;
    body: string;
  };
  
  export const carouselSlides: CarouselSlide[] = [
    {
      tag: "From me to you",
      headline: "Most investors won't tell you why they passed.",
      body: "But I will. Nine times out of ten — when a promising early-stage founder doesn't get a second meeting — it's not the idea. It's the preparation. Investors asked for documents and got silence. Or worse, a Google Drive folder with files named 'final_v3_REAL.pdf'.",
    },
    {
      tag: "The truth",
      headline: "A data room is not for Series A founders. It's for you. Right now.",
      body: "I've spoken to hundreds of early founders across Africa and the diaspora. Almost none had a data room. Not because they didn't have good businesses — but because nobody told them what one was or how to build it. That ends today.",
    },
    {
      tag: "Why it matters",
      headline: "Founders with better data rooms raise faster.",
      body: "When an investor gets excited about your startup, the next step is due diligence. If they have to chase you for documents, ask the same question ten times, or wait two weeks for a cap table — they cool off. The deal dies from friction. A complete data room removes that friction entirely.",
    },
    {
      tag: "What we're building",
      headline: "Your data room. Built right. Step by step.",
      body: "We're going to build your data room together — section by section. Company overview, legal documents, financials, team, traction. We'll give you templates where you need them, explain what each document meaning, and help you look like the founder investors want to back.",
    },
  ];