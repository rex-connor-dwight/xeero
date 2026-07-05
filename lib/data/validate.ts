export type Answer = string;

export const slides = [
  {
    tag: "Why validate?",
    headline: "Validation teaches you 3 things.",
    body: "Before you build, before you raise, before you hire — you need to know if this is real. Most founders skip this step. The ones who don't raise faster, build less, and waste nothing.",
  },
  {
    tag: "The 3 things",
    headline: null,
    points: [
      {
        number: "01",
        title: "Confidence",
        body: "You've done this manually, over and over. That repetition builds certainty. You're not guessing anymore — you know this works because you've made it work with your own hands.",
      },
      {
        number: "02",
        title: "Proof of business",
        body: "If 10 to 100 people paid you to do this manually, a business exists here. Transaction is what validates a business — not a pitch deck, not a prototype.",
      },
      {
        number: "03",
        title: "Early revenue",
        body: "You don't need a product to make money. A spreadsheet and hustle can generate $5,000 to $50,000 before you write a single line of code.",
      },
    ],
  },
  {
    tag: "The manual test",
    headline: "The biggest companies started manually.",
    body: "Before Airbnb, Brian Chesky rented out air mattresses himself. Before Uber, Travis called drivers personally. If you want to connect buyers to sellers, connect them manually first — charge a commission, fill a spreadsheet, do it again. That's validation.",
    cta: "Now let's validate your idea.",
  },
];

export const questions = [
  {
    id: "problem",
    label: "Q1 of 5",
    question: "What problem are you solving?",
    hint: "Describe the pain point in one clear paragraph. Who feels it? How often? What do they do today that doesn't work?",
    type: "text",
  },
  {
    id: "customer",
    label: "Q2 of 5",
    question: "Who is your target customer?",
    hint: "Be specific. Not 'everyone' — give us an age, profession, situation. The narrower, the stronger.",
    type: "text",
  },
  {
    id: "manual",
    label: "Q3 of 5",
    question: "Have you done this manually for at least 10 customers?",
    hint: "Built a marketplace? Connect buyers to sellers by hand. Building software? Do the process in a spreadsheet. This is the most important question.",
    type: "choice",
    options: ["Yes", "In Progress", "No"],
  },
  {
    id: "paid",
    label: "Q4 of 5",
    question: "Did at least 50% of those customers pay you?",
    hint: "Payment — even a small amount — is the strongest signal a business exists here. Enthusiasm without payment is just politeness.",
    type: "choice",
    options: ["Yes", "Some did", "No"],
  },
  {
    id: "talked",
    label: "Q5 of 5",
    question: "Have you talked to at least 50 potential users about this problem?",
    hint: "Not to pitch — to listen. Did they describe the problem back to you in their own words? Did they ask when it would be ready?",
    type: "choice",
    options: ["Yes", "Some", "No"],
  },
];

export function calculateScore(answers: Record<string, Answer>) {
  let score = 0;
  const breakdown: { label: string; points: number; max: number }[] = [];

  if (answers.problem?.trim().length > 20) {
    score += 10;
    breakdown.push({ label: "Problem defined", points: 10, max: 10 });
  } else {
    breakdown.push({ label: "Problem defined", points: 0, max: 10 });
  }

  if (answers.customer?.trim().length > 10) {
    score += 10;
    breakdown.push({ label: "Customer identified", points: 10, max: 10 });
  } else {
    breakdown.push({ label: "Customer identified", points: 0, max: 10 });
  }

  const manualPts = answers.manual === "Yes" ? 25 : answers.manual === "In Progress" ? 12 : 0;
  score += manualPts;
  breakdown.push({ label: "Manual validation", points: manualPts, max: 25 });

  const paidPts = answers.paid === "Yes" ? 35 : answers.paid === "Some did" ? 17 : 0;
  score += paidPts;
  breakdown.push({ label: "Customer payment", points: paidPts, max: 35 });

  const talkedPts = answers.talked === "Yes" ? 20 : answers.talked === "Some" ? 10 : 0;
  score += talkedPts;
  breakdown.push({ label: "User conversations", points: talkedPts, max: 20 });

  return { score, breakdown };
}

export function getScoreBand(score: number) {
  if (score >= 80) return {
    label: "Strong",
    sublabel: "You're ready to build.",
    advice: "You've done the hard work. You've validated manually, customers have paid you, and you've talked to real users. Now build — but stay close to your customers as you do.",
    color: "#38a169",
    bg: "#f0fff4",
    border: "#c6f6d5",
  };
  if (score >= 50) return {
    label: "Promising",
    sublabel: "Keep validating.",
    advice: "You're on the right track but there are gaps. Focus on getting more manual customers to pay you before you invest in building. One paying customer beats ten enthusiastic ones.",
    color: "#d69e2e",
    bg: "#fffff0",
    border: "#fefcbf",
  };
  if (score >= 20) return {
    label: "Early Stage",
    sublabel: "More manual work needed.",
    advice: "You have an idea but not yet a validated business. Go do the thing manually for 10 people this week. Don't build anything. Charge them. Come back when you have.",
    color: "#dd6b20",
    bg: "#fffaf0",
    border: "#feebc8",
  };
  return {
    label: "Not Yet",
    sublabel: "Start with conversations.",
    advice: "Before anything else — talk to 50 people who have this problem. Not to pitch. To listen. Ask them what they do today, how much it costs them, and how often it hurts. Then come back.",
    color: "#e53e3e",
    bg: "#fff5f5",
    border: "#fed7d7",
  };
}