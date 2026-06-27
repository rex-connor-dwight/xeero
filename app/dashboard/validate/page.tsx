"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = "slides" | "questions" | "results";
type Answer = string;

// ── Slide Content ──────────────────────────────────────────────────────────

const slides = [
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

// ── Questions ──────────────────────────────────────────────────────────────

const questions = [
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

// ── Scoring ────────────────────────────────────────────────────────────────

function calculateScore(answers: Record<string, Answer>) {
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

function getScoreBand(score: number) {
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

// ── Circular Progress ──────────────────────────────────────────────────────

function CircularProgress({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={circleStyles.wrapper}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="10"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={circleStyles.inner}>
        <span style={{ ...circleStyles.score, color }}>{score}%</span>
        <span style={circleStyles.label}>Validation{"\n"}score</span>
      </div>
    </div>
  );
}

type CircleStyles = { [key: string]: React.CSSProperties };
const circleStyles: CircleStyles = {
  wrapper: {
    position: "relative",
    width: "140px",
    height: "140px",
    flexShrink: 0,
  },
  inner: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
  },
  score: {
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1",
  },
  label: {
    fontSize: "10px",
    color: "#aaaaaa",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: "1.3",
    maxWidth: "70px",
    whiteSpace: "pre-line",
  },
};

// ── Previous Score View ────────────────────────────────────────────────────

function PreviousScoreView({
  score,
  band,
  answers,
  onRevalidate,
}: {
  score: number;
  band: string;
  answers: any;
  onRevalidate: () => void;
}) {
  const scoreBand = getScoreBand(score);
  const breakdown = answers ? calculateScore(answers).breakdown : [];

  const levels = [
    {
      label: "Strong signals",
      value: breakdown.filter((b) => b.points === b.max).length,
      color: "#38a169",
    },
    {
      label: "Partial signals",
      value: breakdown.filter((b) => b.points > 0 && b.points < b.max).length,
      color: "#d69e2e",
    },
    {
      label: "Missing signals",
      value: breakdown.filter((b) => b.points === 0).length,
      color: "#e53e3e",
    },
  ];

  return (
    <div style={styles.resultsWrapper}>

      {/* Main card */}
      <div style={prevStyles.card}>

        {/* Header */}
        <div style={prevStyles.cardHeader}>
          <span style={prevStyles.cardTitle}>{scoreBand.label}</span>
          <button style={prevStyles.revalidateBtn} onClick={onRevalidate}>
            <RefreshCw size={12} />
            Revalidate
          </button>
        </div>

        {/* Body */}
        <div style={prevStyles.body}>

          {/* Circle */}
          <CircularProgress score={score} color={scoreBand.color} />

          {/* Distribution */}
          <div style={prevStyles.distribution}>
            <p style={prevStyles.distributionTitle}>Validation Level</p>
            {levels.map((level) => (
              <div key={level.label} style={prevStyles.distributionRow}>
                <span style={prevStyles.distributionLabel}>{level.label}</span>
                <span style={prevStyles.distributionColon}>:</span>
                <span style={{ ...prevStyles.distributionValue, color: level.color }}>
                  {level.value}/{breakdown.length || 5}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Divider */}
        <div style={prevStyles.divider} />

        {/* Advice */}
        <p style={prevStyles.advice}>{scoreBand.advice}</p>

      </div>

      {/* Breakdown */}
      {breakdown.length > 0 && (
        <div style={styles.breakdownCard}>
          <p style={styles.breakdownTitle}>Score Breakdown</p>
          {breakdown.map((item) => (
            <div key={item.label} style={styles.breakdownRow}>
              <div style={styles.breakdownLeft}>
                <span style={styles.breakdownLabel}>{item.label}</span>
                <div style={styles.breakdownBar}>
                  <div style={{
                    ...styles.breakdownBarFill,
                    width: `${(item.points / item.max) * 100}%`,
                    backgroundColor: item.points === item.max
                      ? "#38a169"
                      : item.points > 0
                      ? "#d69e2e"
                      : "#e5e5e5",
                  }} />
                </div>
              </div>
              <span style={{
                ...styles.breakdownScore,
                color: item.points === 0 ? "#cccccc" : "#111111",
              }}>
                {item.points}/{item.max}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

type PrevStyles = { [key: string]: React.CSSProperties };
const prevStyles: PrevStyles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#111111",
  },
  revalidateBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#888888",
    backgroundColor: "#f5f5f5",
    border: "1px solid #eeeeee",
    borderRadius: "99px",
    padding: "5px 12px",
    cursor: "pointer",
  },
  body: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },
  distribution: {
    flex: 1,
    minWidth: "160px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  distributionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#111111",
    margin: "0 0 4px 0",
  },
  distributionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  distributionLabel: {
    fontSize: "13px",
    color: "#555555",
    flex: 1,
  },
  distributionColon: {
    fontSize: "13px",
    color: "#cccccc",
  },
  distributionValue: {
    fontSize: "13px",
    fontWeight: "600",
    minWidth: "32px",
    textAlign: "right",
  },
  divider: {
    height: "1px",
    backgroundColor: "#f0f0f0",
  },
  advice: {
    fontSize: "13px",
    color: "#666666",
    lineHeight: "1.6",
    margin: "0",
  },
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function ValidatePage() {
  const router = useRouter();
  const { profile, profileLoading } = useXeero();
  const [phase, setPhase] = useState<Phase>("slides");
  const [slideIndex, setSlideIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentText, setCurrentText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    if (!profileLoading && profile?.validation_score) {
      setShowPrevious(true);
    }
  }, [profile, profileLoading]);

  const currentQuestion = questions[questionIndex];
  const { score, breakdown } = phase === "results" ? calculateScore(answers) : { score: 0, breakdown: [] };
  const band = phase === "results" ? getScoreBand(score) : null;

  const handleNextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setPhase("questions");
    }
  };

  const handlePrevSlide = () => {
    if (slideIndex > 0) setSlideIndex(slideIndex - 1);
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setCurrentText("");
    } else {
      setPhase("results");
    }
  };

  const handleTextNext = () => {
    if (!currentText.trim()) return;
    handleAnswer(currentText);
  };

  const handleSaveScore = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          validation_score: score,
          validation_band: band?.label,
          validation_answers: answers,
        })
        .eq("user_id", user.id);
      setSaved(true);
    }
    setSaving(false);
  };

  const handleRevalidate = () => {
    setShowPrevious(false);
    setPhase("slides");
    setSlideIndex(0);
    setQuestionIndex(0);
    setAnswers({});
    setCurrentText("");
    setSaved(false);
  };

  if (profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  if (showPrevious && profile?.validation_score) {
    return (
      <div style={styles.page}>
        <PreviousScoreView
          score={profile.validation_score}
          band={profile.validation_band || ""}
          answers={profile.validation_answers}
          onRevalidate={handleRevalidate}
        />
      </div>
    );
  }

  // ── Slides ──
  if (phase === "slides") {
    const slide = slides[slideIndex];
    return (
      <div style={styles.page}>
        <div style={styles.slideCard}>
          <div style={styles.slideDots}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.slideDot,
                  backgroundColor: i === slideIndex ? "#ffffff" : "rgba(255,255,255,0.25)",
                  width: i === slideIndex ? "20px" : "6px",
                }}
              />
            ))}
          </div>

          <div style={styles.slideContent}>
            <span style={styles.slideTag}>{slide.tag}</span>
            {slide.headline && <h1 style={styles.slideHeadline}>{slide.headline}</h1>}
            {slide.body && <p style={styles.slideBody}>{slide.body}</p>}
            {slide.points && (
              <div style={styles.slidePoints}>
                {slide.points.map((point) => (
                  <div key={point.number} style={styles.slidePoint}>
                    <span style={styles.slidePointNumber}>{point.number}</span>
                    <div>
                      <p style={styles.slidePointTitle}>{point.title}</p>
                      <p style={styles.slidePointBody}>{point.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {slide.cta && <p style={styles.slideCta}>{slide.cta}</p>}
          </div>

          <div style={styles.slideNav}>
            {slideIndex > 0 && (
              <button style={styles.slideBackBtn} onClick={handlePrevSlide}>
                <ArrowLeft size={14} />Back
              </button>
            )}
            <button style={styles.slideNextBtn} onClick={handleNextSlide}>
              {slideIndex < slides.length - 1
                ? <><ArrowRight size={14} />Next</>
                : <><ArrowRight size={14} />Start Validation</>
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Questions ──
  if (phase === "questions") {
    const progress = (questionIndex / questions.length) * 100;
    return (
      <div style={styles.page}>
        <div style={styles.questionCard}>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          <span style={styles.questionLabel}>{currentQuestion.label}</span>
          <h2 style={styles.questionText}>{currentQuestion.question}</h2>
          <p style={styles.questionHint}>{currentQuestion.hint}</p>

          {currentQuestion.type === "text" ? (
            <>
              <textarea
                style={styles.questionTextarea}
                placeholder="Type your answer here..."
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                autoFocus
              />
              <button
                style={{ ...styles.questionNextBtn, opacity: currentText.trim().length > 10 ? 1 : 0.4 }}
                onClick={handleTextNext}
                disabled={currentText.trim().length <= 10}
              >
                Next →
              </button>
            </>
          ) : (
            <div style={styles.choiceGrid}>
              {currentQuestion.options!.map((option) => (
                <button key={option} style={styles.choiceBtn} onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          )}

          {questionIndex > 0 && (
            <button
              style={styles.questionBackBtn}
              onClick={() => {
                setQuestionIndex(questionIndex - 1);
                setCurrentText(answers[questions[questionIndex - 1].id] || "");
              }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results ──
  return (
    <div style={styles.page}>
      <div style={styles.resultsWrapper}>

        <div style={{
          ...styles.scoreCard,
          backgroundColor: band!.bg,
          border: `1px solid ${band!.border}`,
        }}>
          <div style={styles.scoreTop}>
            <div>
              <p style={styles.scoreLabel}>Validation Score</p>
              <h1 style={{ ...styles.scoreValue, color: band!.color }}>
                {score}<span style={styles.scoreMax}>/100</span>
              </h1>
            </div>
            <div style={{ ...styles.scoreBadge, backgroundColor: band!.color }}>
              <span style={styles.scoreBadgeText}>{band!.label}</span>
            </div>
          </div>
          <p style={{ ...styles.scoreSublabel, color: band!.color }}>{band!.sublabel}</p>
          <p style={styles.scoreAdvice}>{band!.advice}</p>
        </div>

        <div style={styles.breakdownCard}>
          <p style={styles.breakdownTitle}>Score Breakdown</p>
          {breakdown.map((item) => (
            <div key={item.label} style={styles.breakdownRow}>
              <div style={styles.breakdownLeft}>
                <span style={styles.breakdownLabel}>{item.label}</span>
                <div style={styles.breakdownBar}>
                  <div style={{
                    ...styles.breakdownBarFill,
                    width: `${(item.points / item.max) * 100}%`,
                    backgroundColor: item.points === item.max ? "#38a169" : item.points > 0 ? "#d69e2e" : "#e5e5e5",
                  }} />
                </div>
              </div>
              <span style={{ ...styles.breakdownScore, color: item.points === 0 ? "#cccccc" : "#111111" }}>
                {item.points}/{item.max}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.answersCard}>
          <p style={styles.breakdownTitle}>Your Answers</p>
          {questions.map((q) => (
            <div key={q.id} style={styles.answerRow}>
              <p style={styles.answerQuestion}>{q.question}</p>
              <p style={styles.answerValue}>{answers[q.id] || "—"}</p>
            </div>
          ))}
        </div>

        <div style={styles.resultsActions}>
          <button
            style={{ ...styles.saveScoreBtn, opacity: saved ? 0.6 : 1 }}
            onClick={handleSaveScore}
            disabled={saving || saved}
          >
            <Save size={13} />
            {saved ? "Saved to Profile ✓" : saving ? "Saving..." : "Save Score to Profile"}
          </button>
          <button style={styles.restartBtn} onClick={handleRevalidate}>
            Validate Again
          </button>
          <button style={styles.dashboardBtn} onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },
  slideCard: { width: "100%", maxWidth: "640px", background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)", borderRadius: "20px", padding: "36px", minHeight: "480px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  slideDots: { display: "flex", gap: "6px", alignItems: "center", marginBottom: "32px" },
  slideDot: { height: "6px", borderRadius: "99px", transition: "all 0.3s ease" },
  slideContent: { flex: 1 },
  slideTag: { fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "16px" },
  slideHeadline: { fontSize: "28px", fontWeight: "700", color: "#ffffff", lineHeight: "1.3", margin: "0 0 16px 0" },
  slideBody: { fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: "1.8", margin: "0 0 24px 0", maxWidth: "480px" },
  slidePoints: { display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" },
  slidePoint: { display: "flex", gap: "16px", alignItems: "flex-start" },
  slidePointNumber: { fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", flexShrink: 0, marginTop: "3px", width: "20px" },
  slidePointTitle: { fontSize: "15px", fontWeight: "700", color: "#ffffff", margin: "0 0 4px 0" },
  slidePointBody: { fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: "0" },
  slideCta: { fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.5)", margin: "0", fontStyle: "italic" },
  slideNav: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "32px" },
  slideBackBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", cursor: "pointer" },
  slideNextBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer" },
  questionCard: { width: "100%", maxWidth: "560px", backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" },
  progressTrack: { width: "100%", height: "3px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden", marginBottom: "28px" },
  progressFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.4s ease" },
  questionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "12px" },
  questionText: { fontSize: "22px", fontWeight: "700", color: "#111111", margin: "0 0 10px 0", lineHeight: "1.3" },
  questionHint: { fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: "0 0 28px 0" },
  questionTextarea: { width: "100%", padding: "14px", fontSize: "14px", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none", marginBottom: "16px", boxSizing: "border-box", backgroundColor: "#fafafa", minHeight: "120px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", color: "#111111" },
  questionNextBtn: { width: "100%", padding: "13px", fontSize: "14px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer", marginBottom: "12px", transition: "opacity 0.2s ease" },
  choiceGrid: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" },
  choiceBtn: { width: "100%", padding: "14px 18px", fontSize: "14px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.15s ease" },
  questionBackBtn: { fontSize: "12px", color: "#aaaaaa", backgroundColor: "transparent", border: "none", cursor: "pointer", marginTop: "4px", textDecoration: "underline" },
  resultsWrapper: { width: "100%", maxWidth: "560px", display: "flex", flexDirection: "column", gap: "14px" },
  scoreCard: { borderRadius: "16px", padding: "28px" },
  scoreTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" },
  scoreLabel: { fontSize: "11px", fontWeight: "600", color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" },
  scoreValue: { fontSize: "48px", fontWeight: "700", margin: "0", lineHeight: "1" },
  scoreMax: { fontSize: "20px", fontWeight: "400", color: "#cccccc" },
  scoreBadge: { padding: "6px 14px", borderRadius: "99px" },
  scoreBadgeText: { fontSize: "12px", fontWeight: "700", color: "#ffffff" },
  scoreSublabel: { fontSize: "16px", fontWeight: "600", margin: "8px 0 12px 0" },
  scoreAdvice: { fontSize: "14px", color: "#555555", lineHeight: "1.7", margin: "0" },
  breakdownCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "22px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  breakdownTitle: { fontSize: "12px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px 0" },
  breakdownRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  breakdownLeft: { flex: 1 },
  breakdownLabel: { fontSize: "12px", fontWeight: "500", color: "#444444", display: "block", marginBottom: "4px" },
  breakdownBar: { width: "100%", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  breakdownBarFill: { height: "100%", borderRadius: "99px", transition: "width 0.5s ease" },
  breakdownScore: { fontSize: "12px", fontWeight: "600", flexShrink: 0, width: "36px", textAlign: "right" },
  answersCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "22px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  answerRow: { marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #f5f5f5" },
  answerQuestion: { fontSize: "12px", fontWeight: "500", color: "#aaaaaa", margin: "0 0 4px 0" },
  answerValue: { fontSize: "13px", color: "#333333", lineHeight: "1.6", margin: "0" },
  resultsActions: { display: "flex", flexDirection: "column", gap: "8px" },
  saveScoreBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "13px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "10px", cursor: "pointer" },
  restartBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "10px", cursor: "pointer" },
  dashboardBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "500", color: "#aaaaaa", backgroundColor: "transparent", border: "none", borderRadius: "10px", cursor: "pointer", textDecoration: "underline" },
};