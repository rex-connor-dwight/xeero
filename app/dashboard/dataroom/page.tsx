"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useXeero } from "@/lib/context";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Folder,
  FileText,
  Upload,
  CheckCircle,
  Circle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Eye,
  ArrowRight,
  Building2,
  Scale,
  TrendingUp,
  Users,
  Package,
  FolderLock,
  Hammer,
  ExternalLink,
  Printer,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = "carousel" | "library";
type DocStatus = "empty" | "draft" | "complete";
type ActiveMode = "upload" | "build" | "input" | "generate" | "sample" | null;

type Document = {
  id?: string;
  section: string;
  doc_type: string;
  title: string;
  file_url?: string;
  content_json?: any;
  status: DocStatus;
};

type ViewEntry = {
  id: string;
  investor_email: string;
  investor_name: string;
  section_viewed: string;
  duration_seconds: number;
  created_at: string;
};

// ── Carousel ───────────────────────────────────────────────────────────────

const carouselSlides = [
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
    body: "We're going to build your data room together — section by section. Company overview, legal documents, financials, team, traction. We'll give you templates where you need them, explain what each document means, and help you look like the founder investors want to back.",
  },
];

// ── Sample Templates ───────────────────────────────────────────────────────

const samples: Record<string, { title: string; content: string }> = {
  one_pager: {
    title: "Sample: Company One-Pager",
    content: `XEERO — Everything your startup needs in one link.

PROBLEM
Early-stage founders spend weeks building a startup profile across fragmented tools — a pitch deck here, a website there, a waitlist somewhere else. There is no single place that holds everything an investor or early user needs to evaluate a startup.

SOLUTION
Xeero gives every founder a professional startup profile page in minutes. One link holds your pitch deck, waitlist, data room, and founder CV — all beautifully presented.

TRACTION
- 500+ founders on waitlist
- $4,500 in pre-launch revenue
- 3 angel investors committed

BUSINESS MODEL
One-time payment of $9 to go live. Future revenue from premium features and investor matching.

TEAM
Founder Name — CEO. 5 years in B2B SaaS. Previously built and sold [Company].

THE ASK
Raising $250,000 pre-seed to reach 1,000 paying founders and launch investor matching.

contact@xeero.me · xeero.me`,
  },
  founding_story: {
    title: "Sample: Founding Story & Vision",
    content: `WHY I STARTED XEERO

I've sat across from too many brilliant founders who couldn't raise — not because their idea was bad, but because they couldn't present it properly. No data room. No organized profile. No professional link to share.

I've spoken to hundreds of early-stage founders across Africa. Almost none had a data room. Most didn't even know what one was. They were pitching from WhatsApp conversations and Google Drive links named "Deck Final REAL v3."

Meanwhile, investors — who see hundreds of deals — were making snap judgments based on first impressions. The founders who raised weren't always the best founders. They were the most prepared ones.

That's what Xeero is about. Giving every founder — regardless of where they are, what school they went to, or who they know — the tools to present like a professional from day one.

VISION
A world where a founder in Lagos, Nairobi, Accra, or Johannesburg has the same shot at funding as a founder in San Francisco. Not because the playing field is fair — but because we gave them the tools to compete on it.`,
  },
  shareholder_agreement: {
    title: "Sample: Shareholder Agreement",
    content: `SHAREHOLDER AGREEMENT

This Shareholder Agreement ("Agreement") is entered into as of [DATE] by and between the shareholders of [COMPANY NAME], a company incorporated under the laws of [JURISDICTION].

1. SHARE OWNERSHIP
The following shares are held by the respective shareholders:
- [Founder 1 Name]: [X] shares ([X]%)
- [Founder 2 Name]: [X] shares ([X]%)

2. DECISION MAKING
Decisions requiring majority vote (>50%): Day-to-day operations.
Decisions requiring supermajority (>75%): New share issuance, sale of company, major asset acquisition.

3. TRANSFER RESTRICTIONS
No shareholder may transfer shares without first offering them to existing shareholders (right of first refusal).

4. VESTING
Founders' shares vest over 4 years with a 1-year cliff. If a founder leaves before 12 months, they retain 0% of unvested shares.

5. DISPUTE RESOLUTION
Any disputes shall be resolved through arbitration in [JURISDICTION].

Note: This is a template only. Have this reviewed and formalized by a qualified lawyer before signing.`,
  },
  financial_model: {
    title: "Sample: Financial Model Structure",
    content: `FINANCIAL MODEL — XEERO (3-YEAR PROJECTION)

ASSUMPTIONS
- Average Revenue Per User (ARPU): $9 one-time
- Monthly new paying founders: Month 1: 50, growing 20% MoM
- Churn: N/A (one-time payment model)
- Monthly operating costs: $2,000 (hosting, tools, marketing)

YEAR 1
Q1: 150 customers · $1,350 revenue · -$4,650 loss
Q2: 350 customers · $3,150 revenue · -$2,850 loss
Q3: 700 customers · $6,300 revenue · $300 profit
Q4: 1,200 customers · $10,800 revenue · $4,800 profit
Year 1 Total: 2,400 customers · $21,600 revenue

YEAR 2
Premium tier launch at $29/mo
2,000 premium subscribers by end of year
Year 2 Total Revenue: $280,000+

YEAR 3
Investor matching marketplace (5% commission)
Year 3 Total Revenue: $800,000+

KEY METRICS TO TRACK
- CAC (Customer Acquisition Cost): Target < $3
- LTV (Lifetime Value): $9 base, $348 premium
- Payback Period: Immediate (one-time payment)`,
  },
  roadmap: {
    title: "Sample: Product Roadmap",
    content: `PRODUCT ROADMAP — XEERO 2025

Q1 2025 — FOUNDATION
✅ Founder profile builder
✅ Public profile page (slug)
✅ Built-in waitlist
✅ Pitch deck upload + viewer
✅ Data room (basic)
✅ Idea validation tool

Q2 2025 — MONETIZATION
□ Paystack payment integration
□ Go-live flow ($9 unlock)
□ Email notifications (waitlist milestones)
□ Profile analytics (views, deck opens)

Q3 2025 — INVESTOR SIDE
□ Investor dashboard
□ Deal flow discovery
□ Founder-investor matching (beta)
□ Data room viewer tracking

Q4 2025 — SCALE
□ Mobile app (iOS + Android)
□ Team profiles (co-founders)
□ Premium tier ($29/mo)
□ African accelerator partnerships

2026 — MARKETPLACE
□ Investor marketplace
□ Revenue-based financing integrations
□ Xeero Academy (founder education)`,
  },
  org_chart: {
    title: "Sample: Org Chart",
    content: `ORG CHART — XEERO (CURRENT)

                    [CEO / Co-Founder]
                    Founder Name
                           |
          ┌────────────────┼────────────────┐
          |                |                |
   [CTO / Co-Founder]  [Head of Growth]  [Advisor]
   Founder Name 2      (Hiring Q2)       Expert Name
          |
   [Engineering]
   2 contractors


PLANNED HIRES (Next 12 months with funding)
- Head of Growth (Q2 2025)
- Senior Engineer (Q3 2025)
- Community Manager (Q4 2025)

ADVISORS
- [Name] — Former VC, 15 years in African tech
- [Name] — Founder, exited B2B SaaS ($5M)`,
  },
  loi: {
    title: "Sample: Letter of Intent",
    content: `LETTER OF INTENT / CUSTOMER TESTIMONIAL

[Customer/Partner Name]
[Title, Company]
[Date]

To Whom It May Concern,

This letter confirms our intent to use [Your Startup Name]'s platform/product upon its official launch.

We have reviewed the product and spoken with the founding team. Based on our conversations and early access, we believe this solution directly addresses [specific problem] that we currently face.

We are prepared to:
□ Pay $[X] per month/year for access to the platform
□ Participate in a 3-month pilot program
□ Provide detailed feedback to support product development

We look forward to formalizing this relationship upon your launch.

Sincerely,

[Signature]
[Full Name]
[Title]
[Company]
[Email]
[Phone]

---
Note: This LOI is non-binding but represents genuine intent to purchase.`,
  },
};

// ── Logic ──────────────────────────────────────────────────────────────────

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

async function fetchDocuments(profileId: string) {
  const { data } = await supabase
    .from("data_room_documents")
    .select("*")
    .eq("profile_id", profileId);
  return data || [];
}

async function fetchViews(profileId: string) {
  const { data } = await supabase
    .from("data_room_views")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

async function saveDocument(doc: Omit<Document, "id"> & { profile_id: string }) {
  const { data, error } = await supabase
    .from("data_room_documents")
    .upsert(doc, { onConflict: "profile_id,doc_type" })
    .select()
    .single();
  return { data, error };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadFile(profileId: string, file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: "File too large. Maximum size is 10MB." };
  }

  const ext = file.name.split(".").pop();
  const path = `${profileId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("dataroom")
    .upload(path, file, { upsert: true });
  if (error) return { url: null, error: "Upload failed. Please try again." };
  const { data } = supabase.storage.from("dataroom").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

// ── Sub Components ─────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: DocStatus }) {
  if (status === "complete") return <CheckCircle size={16} color="#38a169" />;
  if (status === "draft") return <Clock size={16} color="#d69e2e" />;
  return <Circle size={16} color="#cccccc" />;
}

function SamplePreview({ docType, onClose }: { docType: string; onClose: () => void }) {
  const sample = samples[docType];
  if (!sample) return null;
  return (
    <div style={sampleStyles.wrapper}>
      <div style={sampleStyles.header}>
        <span style={sampleStyles.title}>{sample.title}</span>
        <button style={sampleStyles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <pre style={sampleStyles.content}>{sample.content}</pre>
      <button style={sampleStyles.printBtn} onClick={() => {
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`<html><head><title>${sample.title}</title><style>body{font-family:monospace;padding:40px;white-space:pre-wrap;font-size:13px;line-height:1.6}</style></head><body>${sample.content}</body></html>`);
        win.document.close();
        win.print();
      }}>
        <Printer size={13} />
        Print / Save as PDF
      </button>
    </div>
  );
}

type SampleStyles = { [key: string]: React.CSSProperties };
const sampleStyles: SampleStyles = {
  wrapper: { marginTop: "14px", backgroundColor: "#f9f9f9", borderRadius: "10px", border: "1px solid #f0f0f0", overflow: "hidden" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#111111" },
  title: { fontSize: "12px", fontWeight: "600", color: "#ffffff" },
  closeBtn: { fontSize: "12px", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" },
  content: { padding: "16px", fontSize: "12px", color: "#333333", lineHeight: "1.7", whiteSpace: "pre-wrap", fontFamily: "monospace", margin: "0", maxHeight: "320px", overflowY: "auto" },
  printBtn: { display: "flex", alignItems: "center", gap: "6px", margin: "0 16px 16px 16px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer" },
};

function CapTableBuilder({ onSave, existing }: { onSave: (data: any) => void; existing?: any }) {
  const [rows, setRows] = useState(
    existing?.rows || [
      { name: "", role: "CEO", shares: "", percent: "" },
      { name: "", role: "CTO", shares: "", percent: "" },
    ]
  );

  const recalcPercents = (updatedRows: any[]) => {
    const total = updatedRows.reduce((sum: number, r: any) => sum + (Number(r.shares) || 0), 0);
    return updatedRows.map((r) => ({
      ...r,
      percent: total > 0 ? ((Number(r.shares) / total) * 100).toFixed(1) : "",
    }));
  };

  const updateRow = (i: number, field: string, value: string) => {
    const updated = rows.map((r: any, idx: number) =>
      idx !== i ? r : { ...r, [field]: value }
    );
    setRows(recalcPercents(updated));
  };

  const addRow = () => setRows([...rows, { name: "", role: "", shares: "", percent: "" }]);
  const removeRow = (i: number) => setRows(recalcPercents(rows.filter((_: any, idx: number) => idx !== i)));

  return (
    <div style={capStyles.wrapper}>
      <p style={capStyles.hint}>Enter each shareholder and their shares. Percentages calculate automatically.</p>
      <div style={capStyles.table}>
        <div style={capStyles.tableHeader}>
          <span style={capStyles.tableCell}>Name</span>
          <span style={capStyles.tableCell}>Role</span>
          <span style={capStyles.tableCell}>Shares</span>
          <span style={capStyles.tableCell}>%</span>
          <span style={{ width: "20px" }} />
        </div>
        {rows.map((row: any, i: number) => (
          <div key={i} style={capStyles.tableRow}>
            <input style={capStyles.tableInput} value={row.name} onChange={(e) => updateRow(i, "name", e.target.value)} placeholder="Full name" />
            <input style={capStyles.tableInput} value={row.role} onChange={(e) => updateRow(i, "role", e.target.value)} placeholder="Role" />
            <input style={capStyles.tableInput} value={row.shares} onChange={(e) => updateRow(i, "shares", e.target.value)} placeholder="0" type="number" />
            <span style={capStyles.tablePercent}>{row.percent ? `${row.percent}%` : "—"}</span>
            <button style={capStyles.removeBtn} onClick={() => removeRow(i)}>✕</button>
          </div>
        ))}
      </div>
      <div style={capStyles.actions}>
        <button style={capStyles.addBtn} onClick={addRow}>+ Add row</button>
        <button style={capStyles.saveBtn} onClick={() => onSave({ rows })}>Save Cap Table</button>
      </div>
    </div>
  );
}

type CapStyles = { [key: string]: React.CSSProperties };
const capStyles: CapStyles = {
  wrapper: { marginTop: "16px" },
  hint: { fontSize: "12px", color: "#888888", marginBottom: "12px" },
  table: { border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 60px 24px", gap: "8px", padding: "8px 12px", backgroundColor: "#f9f9f9", borderBottom: "1px solid #f0f0f0" },
  tableCell: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.05em" },
  tableRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 60px 24px", gap: "8px", padding: "8px 12px", borderBottom: "1px solid #f9f9f9", alignItems: "center" },
  tableInput: { padding: "6px 8px", fontSize: "13px", border: "1px solid #eeeeee", borderRadius: "6px", outline: "none", backgroundColor: "#fafafa", width: "100%", boxSizing: "border-box" },
  tablePercent: { fontSize: "13px", color: "#111111", fontWeight: "600", textAlign: "center" },
  removeBtn: { fontSize: "11px", color: "#cccccc", background: "none", border: "none", cursor: "pointer", padding: "0" },
  actions: { display: "flex", justifyContent: "space-between", marginTop: "12px" },
  addBtn: { fontSize: "12px", color: "#666666", background: "none", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" },
  saveBtn: { fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "6px", padding: "6px 16px", cursor: "pointer" },
};

// ── Build Fields Config ────────────────────────────────────────────────────

const buildFields: Record<string, { key: string; label: string; placeholder: string; multiline?: boolean; prefill?: string }[]> = {
  one_pager: [
    { key: "startup_name", label: "Startup Name", placeholder: "e.g. Xeero", prefill: "startup_name" },
    { key: "tagline", label: "Tagline", placeholder: "One line that captures what you do", prefill: "tagline" },
    { key: "problem", label: "The Problem", placeholder: "What pain point are you solving?", multiline: true, prefill: "problem" },
    { key: "solution", label: "Your Solution", placeholder: "How do you solve it?", multiline: true, prefill: "solution" },
    { key: "traction", label: "Traction", placeholder: "Users, revenue, signups, pilots...", multiline: true, prefill: "traction" },
    { key: "business_model", label: "Business Model", placeholder: "How do you make money?", prefill: "business_model" },
    { key: "team", label: "Team", placeholder: "Founder names and key roles", prefill: "founder_name" },
    { key: "ask", label: "The Ask", placeholder: "How much are you raising and for what?", prefill: "funding_goal" },
    { key: "contact", label: "Contact", placeholder: "Email or website" },
  ],
  founding_story: [
    { key: "why", label: "Why did you start this?", placeholder: "What problem did you personally experience?", multiline: true },
    { key: "belief", label: "What do you believe that most people don't?", placeholder: "Your contrarian insight...", multiline: true },
    { key: "journey", label: "The journey so far", placeholder: "What have you built, validated, or learned?", multiline: true },
    { key: "vision", label: "Where are you going?", placeholder: "What does the world look like when you win?", multiline: true },
    { key: "why_you", label: "Why are you the right person to build this?", placeholder: "Your unfair advantage...", multiline: true },
  ],
};

// ── Sections Config ────────────────────────────────────────────────────────

const sections = [
  {
    key: "company_overview",
    label: "Company Overview",
    icon: <Building2 size={18} />,
    docs: [
      { doc_type: "pitch_deck", title: "Pitch Deck", description: "Your main pitch deck. Pulled automatically from your profile." },
      { doc_type: "one_pager", title: "Company One-Pager", description: "A single page summarizing your startup — problem, solution, traction, team, ask." },
      { doc_type: "founding_story", title: "Founding Story & Vision", description: "Why did you start this? What do you believe? Write it like a letter to an investor." },
    ],
  },
  {
    key: "legal",
    label: "Legal & Corporate",
    icon: <Scale size={18} />,
    docs: [
      { doc_type: "registration", title: "Business Registration", description: "Your official business registration number. Proves your business is legally registered in your country." },
      { doc_type: "incorporation", title: "Certificate of Incorporation", description: "The official document confirming your company is incorporated. Upload it here." },
      { doc_type: "cap_table", title: "Cap Table", description: "Who owns what percentage of your company. We'll help you build this." },
      { doc_type: "shareholder_agreement", title: "Shareholder Agreement", description: "Defines the rights of each shareholder. We'll give you a template — then take it to a lawyer." },
    ],
  },
  {
    key: "financials",
    label: "Financials",
    icon: <TrendingUp size={18} />,
    docs: [
      { doc_type: "financial_model", title: "Financial Model", description: "Your revenue projections for the next 3 years. Upload your spreadsheet or document." },
      { doc_type: "revenue", title: "Revenue & MRR", description: "Your current monthly recurring revenue or total revenue to date." },
      { doc_type: "burn_rate", title: "Burn Rate & Runway", description: "How much you spend monthly and how many months of cash you have left." },
    ],
  },
  {
    key: "traction",
    label: "Product & Traction",
    icon: <Package size={18} />,
    docs: [
      { doc_type: "roadmap", title: "Product Roadmap", description: "Where your product is going. What you're building next and why." },
      { doc_type: "metrics", title: "Key Metrics", description: "DAUs, MAUs, retention, churn, NPS — the numbers that tell your growth story." },
      { doc_type: "testimonials", title: "Customer Testimonials / Letters of Intent", description: "Real words from real customers. Even one strong testimonial builds credibility." },
    ],
  },
  {
    key: "team",
    label: "Team",
    icon: <Users size={18} />,
    docs: [
      { doc_type: "founder_cv", title: "Founder CV", description: "Pulled automatically from your Xeero profile. Click to edit." },
      { doc_type: "org_chart", title: "Org Chart", description: "A simple diagram showing your team structure. Even if it's just 2 people." },
    ],
  },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function DataRoomPage() {
  const { profile, profileLoading } = useXeero();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("carousel");
  const [slideIndex, setSlideIndex] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [views, setViews] = useState<ViewEntry[]>([]);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [showSample, setShowSample] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!profile) return;
    fetchDocuments(profile.id).then((docs) => {
      setDocuments(docs);
      if (docs.length > 0) setPhase("library");
    });
    fetchViews(profile.id).then(setViews);
  }, [profile]);

  const getDoc = (doc_type: string): Document | undefined =>
    documents.find((d) => d.doc_type === doc_type);

  const getStatus = (doc_type: string): DocStatus => {
    if (doc_type === "pitch_deck" && profile?.deck_url) return "complete";
    if (doc_type === "founder_cv" && profile?.founder_name && profile?.founder_bio) return "complete";
    return getDoc(doc_type)?.status || "empty";
  };

  const getSectionProgress = (sectionKey: string) => {
    const section = sections.find((s) => s.key === sectionKey);
    if (!section) return { complete: 0, total: 0 };
    const total = section.docs.length;
    const complete = section.docs.filter((d) => getStatus(d.doc_type) === "complete").length;
    return { complete, total };
  };

  const setDocActive = (doc_type: string, mode: ActiveMode) => {
    if (activeDoc === doc_type && activeMode === mode) {
      setActiveDoc(null);
      setActiveMode(null);
    } else {
      setActiveDoc(doc_type);
      setActiveMode(mode);
      setShowSample(null);
      setSaveError(null);
    }
  };

  const handleSaveInput = async (doc_type: string, section: string, title: string) => {
    if (!profile) return;
    const value = inputValues[doc_type];
    if (!value?.trim()) return;
    setSaving(doc_type);
    setSaveError(null);
    const { error } = await saveDocument({
      profile_id: profile.id,
      section,
      doc_type,
      title,
      content_json: { value },
      status: "complete",
    });
    if (error) {
      setSaveError("Failed to save. Please try again.");
      setSaving(null);
      return;
    }
    const updated = await fetchDocuments(profile.id);
    setDocuments(updated);
    setSaved(doc_type);
    setSaving(null);
    setActiveDoc(null);
    setTimeout(() => setSaved(null), 3000);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    doc_type: string,
    section: string,
    title: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setSaving(doc_type);
    setSaveError(null);
  
    const { url, error: uploadError } = await uploadFile(profile.id, file);
    if (!url || uploadError) {
      setSaveError(uploadError || "Upload failed. Please try again.");
      setSaving(null);
      return;
    }
  
    const { error } = await saveDocument({
      profile_id: profile.id,
      section,
      doc_type,
      title,
      file_url: url,
      status: "complete",
    });
    if (error) {
      setSaveError("Failed to save. Please try again.");
      setSaving(null);
      return;
    }
    const updated = await fetchDocuments(profile.id);
    setDocuments(updated);
    setSaved(doc_type);
    setSaving(null);
    setActiveDoc(null);
    setTimeout(() => setSaved(null), 3000);
  };

  const handleSaveGenerated = async (
    doc_type: string,
    section: string,
    title: string,
    data: any
  ) => {
    if (!profile) return;
    setSaving(doc_type);
    setSaveError(null);
    const { error } = await saveDocument({
      profile_id: profile.id,
      section,
      doc_type,
      title,
      content_json: data,
      status: "complete",
    });
    if (error) {
      setSaveError("Failed to save. Please try again.");
      setSaving(null);
      return;
    }
    const updated = await fetchDocuments(profile.id);
    setDocuments(updated);
    setSaved(doc_type);
    setSaving(null);
    setActiveDoc(null);
    setActiveMode(null);
    setTimeout(() => setSaved(null), 3000);
  };

  const handleSaveBuild = async (doc_type: string, section: string, title: string) => {
    if (!profile) return;
    const fields = buildFields[doc_type];
    if (!fields) return;
    const data: Record<string, string> = {};
    fields.forEach((f) => { data[f.key] = inputValues[`${doc_type}_${f.key}`] || ""; });
    setSaving(doc_type);
    setSaveError(null);
    const { error } = await saveDocument({
      profile_id: profile.id,
      section,
      doc_type,
      title,
      content_json: data,
      status: "complete",
    });
    if (error) {
      setSaveError("Failed to save. Please try again.");
      setSaving(null);
      return;
    }
    const updated = await fetchDocuments(profile.id);
    setDocuments(updated);
    setSaved(doc_type);
    setSaving(null);
    setActiveDoc(null);
    setActiveMode(null);
    setTimeout(() => setSaved(null), 3000);
  };

  const printGenerated = (doc_type: string, title: string) => {
    const fields = buildFields[doc_type];
    if (!fields) return;
    const lines = fields.map((f) => `${f.label}:\n${inputValues[`${doc_type}_${f.key}`] || "—"}\n`).join("\n");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:40px;font-size:14px;line-height:1.8}h1{font-size:20px;margin-bottom:24px}</style></head><body><h1>${title}</h1>${lines.replace(/\n/g, "<br>")}</body></html>`);
    win.document.close();
    win.print();
  };

  const totalComplete = sections.reduce((sum, s) => sum + getSectionProgress(s.key).complete, 0);
  const totalDocs = sections.reduce((sum, s) => sum + s.docs.length, 0);

  if (profileLoading) {
    return <div style={styles.loadingPage}><div style={styles.loadingDot} /></div>;
  }

  // ── Carousel ──
  if (phase === "carousel") {
    const slide = carouselSlides[slideIndex];
    return (
      <div style={styles.carouselPage}>
        <div style={styles.carouselCard}>
          <div style={styles.carouselTop}>
            <div style={styles.carouselDots}>
              {carouselSlides.map((_, i) => (
                <div key={i} style={{
                  ...styles.carouselDot,
                  width: i === slideIndex ? "20px" : "6px",
                  backgroundColor: i === slideIndex ? "#ffffff" : "rgba(255,255,255,0.25)",
                }} />
              ))}
            </div>
          </div>

          <div style={styles.carouselContent}>
            <span style={styles.carouselTag}>{slide.tag}</span>
            <h1 style={styles.carouselHeadline}>{slide.headline}</h1>
            <p style={styles.carouselBody}>{slide.body}</p>
          </div>

          <div style={styles.carouselNav}>
            {slideIndex > 0 && (
              <button style={styles.carouselBackBtn} onClick={() => setSlideIndex(slideIndex - 1)}>
                <ChevronLeft size={14} />Back
              </button>
            )}
            <button
              style={styles.carouselNextBtn}
              onClick={() => {
                if (slideIndex < carouselSlides.length - 1) {
                  setSlideIndex(slideIndex + 1);
                } else {
                  setPhase("library");
                }
              }}
            >
              {slideIndex < carouselSlides.length - 1
                ? <><ChevronRight size={14} />Next</>
                : <><ArrowRight size={14} />Build My Data Room</>
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Library ──
  return (
    <div style={styles.page}>

      {/* Global save toast */}
      {saved && (
        <div style={styles.toast}>
          <CheckCircle size={14} color="#38a169" />
          <span>Saved successfully</span>
        </div>
      )}
      {saveError && (
        <div style={{ ...styles.toast, ...styles.toastError }}>
          <span>{saveError}</span>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <FolderLock size={18} color="#111111" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Data Room</h1>
            <p style={styles.headerSub}>{totalComplete} of {totalDocs} documents complete</p>
          </div>
        </div>
        <div style={styles.progressPill}>
          <div style={{ ...styles.progressPillFill, width: `${(totalComplete / totalDocs) * 100}%` }} />
        </div>
      </div>

      {/* Investor Views */}
      {views.length > 0 && (
        <div style={styles.viewsCard}>
          <div style={styles.viewsHeader}>
            <Eye size={14} color="#111111" />
            <span style={styles.viewsTitle}>Investor Activity</span>
          </div>
          {views.slice(0, 3).map((view) => (
            <div key={view.id} style={styles.viewRow}>
              <div style={styles.viewAvatar}>
                <span style={styles.viewAvatarText}>{view.investor_email[0].toUpperCase()}</span>
              </div>
              <div style={styles.viewInfo}>
                <p style={styles.viewName}>{view.investor_name || view.investor_email}</p>
                <p style={styles.viewDetail}>
                  Viewed {view.section_viewed} · {timeAgo(view.created_at)}
                  {view.duration_seconds > 0 && ` · ${view.duration_seconds}s`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={styles.sectionLabel}>Your Documents</p>
      <div style={styles.library}>
        {sections.map((section) => {
          const progress = getSectionProgress(section.key);
          const isOpen = openSection === section.key;

          return (
            <div key={section.key} style={styles.folderWrapper}>
              {/* ── Fixed: use borderBottom only, no border shorthand conflict ── */}
              <button
                style={{
                  ...styles.folderHeader,
                  backgroundColor: isOpen ? "#fafafa" : "#ffffff",
                  borderBottom: isOpen ? "1px solid #f0f0f0" : "none",
                }}
                onClick={() => setOpenSection(isOpen ? null : section.key)}
              >
                <div style={styles.folderLeft}>
                  <div style={styles.folderIconBox}>
                    {isOpen
                      ? <FolderOpen size={18} color="#111111" />
                      : <Folder size={18} color="#111111" />
                    }
                  </div>
                  <div>
                    <p style={styles.folderLabel}>{section.label}</p>
                    <p style={styles.folderProgress}>{progress.complete}/{progress.total} complete</p>
                  </div>
                </div>
                <div style={styles.folderRight}>
                  <div style={styles.folderProgressBar}>
                    <div style={{
                      ...styles.folderProgressFill,
                      width: `${(progress.complete / progress.total) * 100}%`,
                    }} />
                  </div>
                  <ChevronRight
                    size={16}
                    color="#cccccc"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>
              </button>

              {isOpen && (
                <div style={styles.folderContents}>
                  {section.docs.map((doc) => {
                    const existing = getDoc(doc.doc_type);
                    const status = getStatus(doc.doc_type);
                    const isActive = activeDoc === doc.doc_type;
                    const hasSample = !!samples[doc.doc_type];

                    const isPitchDeck = doc.doc_type === "pitch_deck";
                    const isFounderCV = doc.doc_type === "founder_cv";
                    const hasUploadAndBuild = ["one_pager", "founding_story"].includes(doc.doc_type);
                    const isInputOnly = ["registration", "revenue", "burn_rate", "metrics"].includes(doc.doc_type);
                    const isMetrics = doc.doc_type === "metrics";

                    return (
                      <div key={doc.doc_type} style={styles.docRow}>
                        <div style={styles.docRowTop}>
                          <div style={styles.docLeft}>
                            <StatusIcon status={status} />
                            <div>
                              <p style={styles.docTitle}>{doc.title}</p>
                              <p style={styles.docDesc}>{doc.description}</p>
                            </div>
                          </div>

                          <div style={styles.docActions}>

                            {isPitchDeck && status === "complete" && (
                              <button style={styles.docActionBtnDone} onClick={() => router.push("/dashboard/edit")}>
                                <ExternalLink size={11} /> View / Edit
                              </button>
                            )}
                            {isPitchDeck && status !== "complete" && (
                              <button style={styles.docActionBtn} onClick={() => router.push("/dashboard/edit")}>
                                Upload Deck
                              </button>
                            )}

                            {isFounderCV && status === "complete" && (
                              <button style={styles.docActionBtnDone} onClick={() => router.push("/dashboard/edit")}>
                                <ExternalLink size={11} /> Edit CV
                              </button>
                            )}
                            {isFounderCV && status !== "complete" && (
                              <button style={styles.docActionBtn} onClick={() => router.push("/dashboard/edit")}>
                                Build CV
                              </button>
                            )}

                            {hasUploadAndBuild && (
                              <>
                                {hasSample && (
                                  <button
                                    style={styles.sampleBtn}
                                    onClick={() => setShowSample(showSample === doc.doc_type ? null : doc.doc_type)}
                                  >
                                    <FileText size={11} /> Sample
                                  </button>
                                )}
                                <button
                                  style={{
                                    ...styles.docActionBtn,
                                    ...(activeMode === "upload" && isActive ? styles.docActionBtnActive : {}),
                                  }}
                                  onClick={() => setDocActive(doc.doc_type, "upload")}
                                >
                                  <Upload size={11} />
                                </button>
                                <button
                                  style={{
                                    ...styles.docActionBtn,
                                    ...(activeMode === "build" && isActive ? styles.docActionBtnActive : {}),
                                    ...(status === "complete" ? styles.docActionBtnDone : {}),
                                  }}
                                  onClick={() => setDocActive(doc.doc_type, "build")}
                                >
                                  <Hammer size={11} /> {status === "complete" ? "Edit" : "Build"}
                                </button>
                              </>
                            )}

                            {!isPitchDeck && !isFounderCV && !hasUploadAndBuild && !isInputOnly && doc.doc_type !== "cap_table" && doc.doc_type !== "shareholder_agreement" && (
                              <>
                                {hasSample && (
                                  <button
                                    style={styles.sampleBtn}
                                    onClick={() => setShowSample(showSample === doc.doc_type ? null : doc.doc_type)}
                                  >
                                    <FileText size={11} /> Sample
                                  </button>
                                )}
                                <button
                                  style={{
                                    ...styles.docActionBtn,
                                    ...(status === "complete" ? styles.docActionBtnDone : {}),
                                  }}
                                  onClick={() => setDocActive(doc.doc_type, "upload")}
                                >
                                  {saving === doc.doc_type
                                    ? "Saving..."
                                    : saved === doc.doc_type
                                    ? "Saved ✓"
                                    : status === "complete"
                                    ? "Edit"
                                    : "Upload"}
                                </button>
                              </>
                            )}

                            {isInputOnly && !isMetrics && (
                              <button
                                style={{
                                  ...styles.docActionBtn,
                                  ...(status === "complete" ? styles.docActionBtnDone : {}),
                                }}
                                onClick={() => setDocActive(doc.doc_type, "input")}
                              >
                                {saving === doc.doc_type
                                  ? "Saving..."
                                  : saved === doc.doc_type
                                  ? "Saved ✓"
                                  : status === "complete"
                                  ? "Edit"
                                  : "Add"}
                              </button>
                            )}

                            {isMetrics && (
                              <button
                                style={{
                                  ...styles.docActionBtn,
                                  ...(status === "complete" ? styles.docActionBtnDone : {}),
                                }}
                                onClick={() => setDocActive(doc.doc_type, "input")}
                              >
                                {status === "complete" ? "Edit" : "Add Metrics"}
                              </button>
                            )}

                            {(doc.doc_type === "cap_table" || doc.doc_type === "shareholder_agreement") && (
                              <>
                                {doc.doc_type === "shareholder_agreement" && (
                                  <button
                                    style={styles.sampleBtn}
                                    onClick={() => setShowSample(showSample === doc.doc_type ? null : doc.doc_type)}
                                  >
                                    <FileText size={11} /> Sample
                                  </button>
                                )}
                                <button
                                  style={{
                                    ...styles.docActionBtn,
                                    ...(status === "complete" ? styles.docActionBtnDone : {}),
                                  }}
                                  onClick={() => setDocActive(doc.doc_type, "generate")}
                                >
                                  <Hammer size={11} /> {status === "complete" ? "Edit" : "Build"}
                                </button>
                              </>
                            )}

                          </div>
                        </div>

                        {/* Save error per doc */}
                        {saveError && isActive && (
                          <p style={styles.docSaveError}>{saveError}</p>
                        )}

                        {/* Saved confirmation per doc */}
                        {saved === doc.doc_type && !isActive && (
                          <p style={styles.docSavedMsg}>✓ Saved successfully</p>
                        )}

                        {showSample === doc.doc_type && (
                          <SamplePreview docType={doc.doc_type} onClose={() => setShowSample(null)} />
                        )}

                        {isActive && (
                          <div style={styles.docActionArea}>

                            {activeMode === "upload" && (
                              <div style={styles.uploadArea}>
                                {existing?.file_url && (
                                  <p style={styles.uploadExisting}>
                                    ✓ File uploaded.{" "}
                                    <a href={existing.file_url} target="_blank" rel="noopener noreferrer" style={styles.uploadExistingLink}>View</a>
                                  </p>
                                )}
                                <button style={styles.uploadBtn} onClick={() => fileRefs.current[doc.doc_type]?.click()}>
                                  <Upload size={13} />
                                  {saving === doc.doc_type ? "Uploading..." : existing?.file_url ? "Replace file" : "Choose file"}
                                </button>
                                <input
                                  ref={(el) => { fileRefs.current[doc.doc_type] = el; }}
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleFileUpload(e, doc.doc_type, section.key, doc.title)}
                                />
                                <p style={styles.uploadHint}>PDF, PNG, JPG, XLSX accepted · Max 10MB</p>
                              </div>
                            )}

                            {activeMode === "input" && !isMetrics && (
                              <div style={styles.inputArea}>
                                <textarea
                                  style={styles.docTextarea}
                                  placeholder={`Enter your ${doc.title.toLowerCase()}...`}
                                  defaultValue={existing?.content_json?.value || ""}
                                  onChange={(e) => setInputValues((prev) => ({ ...prev, [doc.doc_type]: e.target.value }))}
                                />
                                <button
                                  style={{
                                    ...styles.saveInputBtn,
                                    opacity: saving === doc.doc_type ? 0.6 : 1,
                                  }}
                                  onClick={() => handleSaveInput(doc.doc_type, section.key, doc.title)}
                                  disabled={saving === doc.doc_type}
                                >
                                  {saving === doc.doc_type ? "Saving..." : "Save"}
                                </button>
                              </div>
                            )}

                            {activeMode === "input" && isMetrics && (
                              <div style={styles.inputArea}>
                                {[
                                  { key: "dau", label: "Daily Active Users (DAU)" },
                                  { key: "mau", label: "Monthly Active Users (MAU)" },
                                  { key: "retention", label: "Retention Rate (%)" },
                                  { key: "churn", label: "Churn Rate (%)" },
                                  { key: "nps", label: "NPS Score" },
                                  { key: "other", label: "Other Key Metric" },
                                ].map((field) => (
                                  <div key={field.key} style={{ marginBottom: "10px" }}>
                                    <label style={styles.inputLabel}>{field.label}</label>
                                    <input
                                      style={styles.docInput}
                                      placeholder={field.label}
                                      defaultValue={existing?.content_json?.[field.key] || ""}
                                      onChange={(e) => setInputValues((prev) => ({ ...prev, [`metrics_${field.key}`]: e.target.value }))}
                                    />
                                  </div>
                                ))}
                                <button
                                  style={{
                                    ...styles.saveInputBtn,
                                    opacity: saving === doc.doc_type ? 0.6 : 1,
                                  }}
                                  onClick={() => handleSaveGenerated(doc.doc_type, section.key, doc.title, {
                                    dau: inputValues["metrics_dau"],
                                    mau: inputValues["metrics_mau"],
                                    retention: inputValues["metrics_retention"],
                                    churn: inputValues["metrics_churn"],
                                    nps: inputValues["metrics_nps"],
                                    other: inputValues["metrics_other"],
                                  })}
                                  disabled={saving === doc.doc_type}
                                >
                                  {saving === doc.doc_type ? "Saving..." : "Save Metrics"}
                                </button>
                              </div>
                            )}

                            {activeMode === "build" && buildFields[doc.doc_type] && (
                              <div style={styles.inputArea}>
                                <p style={styles.generateHint}>
                                  Fill in the fields below. We'll format this into a professional document you can download as PDF.
                                </p>
                                {buildFields[doc.doc_type].map((field) => (
                                  <div key={field.key} style={{ marginBottom: "12px" }}>
                                    <label style={styles.inputLabel}>{field.label}</label>
                                    {field.multiline ? (
                                      <textarea
                                        style={styles.docTextarea}
                                        placeholder={field.placeholder}
                                        defaultValue={existing?.content_json?.[field.key] || (field.prefill ? (profile as any)?.[field.prefill] || "" : "")}
                                        onChange={(e) => setInputValues((prev) => ({ ...prev, [`${doc.doc_type}_${field.key}`]: e.target.value }))}
                                      />
                                    ) : (
                                      <input
                                        style={styles.docInput}
                                        placeholder={field.placeholder}
                                        defaultValue={existing?.content_json?.[field.key] || (field.prefill ? (profile as any)?.[field.prefill] || "" : "")}
                                        onChange={(e) => setInputValues((prev) => ({ ...prev, [`${doc.doc_type}_${field.key}`]: e.target.value }))}
                                      />
                                    )}
                                  </div>
                                ))}
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  <button
                                    style={{
                                      ...styles.saveInputBtn,
                                      opacity: saving === doc.doc_type ? 0.6 : 1,
                                    }}
                                    onClick={() => handleSaveBuild(doc.doc_type, section.key, doc.title)}
                                    disabled={saving === doc.doc_type}
                                  >
                                    {saving === doc.doc_type ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    style={{ ...styles.saveInputBtn, backgroundColor: "#ffffff", color: "#111111", border: "1px solid #e5e5e5" }}
                                    onClick={() => printGenerated(doc.doc_type, doc.title)}
                                  >
                                    <Printer size={12} /> Download PDF
                                  </button>
                                </div>
                              </div>
                            )}

                            {activeMode === "generate" && doc.doc_type === "cap_table" && (
                              <CapTableBuilder
                                existing={existing?.content_json}
                                onSave={(data) => handleSaveGenerated(doc.doc_type, section.key, doc.title, data)}
                              />
                            )}

                            {activeMode === "generate" && doc.doc_type === "shareholder_agreement" && (
                              <div style={styles.inputArea}>
                                <p style={styles.generateHint}>
                                  Fill in your details to generate a basic shareholder agreement. Have it reviewed by a qualified lawyer before signing.
                                </p>
                                {[
                                  { key: "company_name", label: "Company Name", prefill: "startup_name" },
                                  { key: "jurisdiction", label: "Country / Jurisdiction" },
                                  { key: "founder1_name", label: "Founder 1 Name", prefill: "founder_name" },
                                  { key: "founder1_percent", label: "Founder 1 Ownership (%)" },
                                  { key: "founder2_name", label: "Founder 2 Name (if any)" },
                                  { key: "founder2_percent", label: "Founder 2 Ownership (%)" },
                                  { key: "date", label: "Date" },
                                ].map((field) => (
                                  <div key={field.key} style={{ marginBottom: "10px" }}>
                                    <label style={styles.inputLabel}>{field.label}</label>
                                    <input
                                      style={styles.docInput}
                                      placeholder={field.label}
                                      defaultValue={existing?.content_json?.[field.key] || (field.prefill ? (profile as any)?.[field.prefill] || "" : "")}
                                      onChange={(e) => setInputValues((prev) => ({ ...prev, [`sa_${field.key}`]: e.target.value }))}
                                    />
                                  </div>
                                ))}
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    style={{
                                      ...styles.saveInputBtn,
                                      opacity: saving === doc.doc_type ? 0.6 : 1,
                                    }}
                                    onClick={() => handleSaveGenerated(doc.doc_type, section.key, doc.title, {
                                      company_name: inputValues["sa_company_name"] || profile?.startup_name,
                                      jurisdiction: inputValues["sa_jurisdiction"],
                                      founder1_name: inputValues["sa_founder1_name"] || profile?.founder_name,
                                      founder1_percent: inputValues["sa_founder1_percent"],
                                      founder2_name: inputValues["sa_founder2_name"],
                                      founder2_percent: inputValues["sa_founder2_percent"],
                                      date: inputValues["sa_date"],
                                    })}
                                    disabled={saving === doc.doc_type}
                                  >
                                    {saving === doc.doc_type ? "Saving..." : "Save"}
                                  </button>
                                </div>
                                <p style={{ ...styles.generateHint, marginTop: "10px" }}>
                                  Need help with the actual agreement?{" "}
                                  <a href="mailto:hello@xeero.me" style={styles.helpLink}>Contact us</a>{" "}
                                  and we'll connect you with a legal partner.
                                </p>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

type Styles = { [key: string]: React.CSSProperties };

const styles: Styles = {
  page: { padding: "24px", maxWidth: "760px", margin: "0 auto" },
  loadingPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loadingDot: { width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#cccccc" },

  // Toast
  toast: { position: "fixed", top: "80px", right: "24px", zIndex: 500, backgroundColor: "#ffffff", border: "1px solid #c6f6d5", borderRadius: "10px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", color: "#38a169", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
  toastError: { border: "1px solid #fed7d7", color: "#e53e3e" },

  // Save feedback per doc
  docSaveError: { fontSize: "12px", color: "#e53e3e", margin: "6px 0 0 0" },
  docSavedMsg: { fontSize: "12px", color: "#38a169", margin: "6px 0 0 0" },

  // Carousel
  carouselPage: { minHeight: "calc(100vh - 50px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backgroundColor: "#f5f5f5" },
  carouselCard: { width: "100%", maxWidth: "600px", background: "linear-gradient(135deg, #111111 0%, #1a1a2e 60%, #16213e 100%)", borderRadius: "20px", padding: "36px", minHeight: "420px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  carouselTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" },
  carouselDots: { display: "flex", gap: "6px", alignItems: "center" },
  carouselDot: { height: "6px", borderRadius: "99px", transition: "all 0.3s ease" },
  carouselContent: { flex: 1 },
  carouselTag: { display: "block", fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" },
  carouselHeadline: { fontSize: "26px", fontWeight: "700", color: "#ffffff", lineHeight: "1.3", margin: "0 0 16px 0" },
  carouselBody: { fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: "1.8", margin: "0" },
  carouselNav: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "32px" },
  carouselBackBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", cursor: "pointer" },
  carouselNextBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", color: "#111111", backgroundColor: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer" },

  // Header
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#111111", margin: "0 0 2px 0" },
  headerSub: { fontSize: "13px", color: "#888888", margin: "0" },
  progressPill: { width: "120px", height: "6px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  progressPillFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.5s ease" },

  // Views
  viewsCard: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "16px 20px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: "20px" },
  viewsHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  viewsTitle: { fontSize: "13px", fontWeight: "600", color: "#111111" },
  viewRow: { display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #f9f9f9" },
  viewAvatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  viewAvatarText: { fontSize: "13px", fontWeight: "600", color: "#888888" },
  viewInfo: { flex: 1 },
  viewName: { fontSize: "13px", fontWeight: "500", color: "#111111", margin: "0 0 2px 0" },
  viewDetail: { fontSize: "11px", color: "#aaaaaa", margin: "0" },

  // Library
  sectionLabel: { fontSize: "11px", fontWeight: "600", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" },
  library: { display: "flex", flexDirection: "column", gap: "8px" },
  folderWrapper: { backgroundColor: "#ffffff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },

  // ── folderHeader: no border shorthand — use individual properties ──
  folderHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    // No border shorthand here — applied inline per state
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
  },

  folderLeft: { display: "flex", alignItems: "center", gap: "12px" },
  folderIconBox: { width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  folderLabel: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  folderProgress: { fontSize: "11px", color: "#aaaaaa", margin: "0" },
  folderRight: { display: "flex", alignItems: "center", gap: "12px" },
  folderProgressBar: { width: "60px", height: "4px", backgroundColor: "#f0f0f0", borderRadius: "99px", overflow: "hidden" },
  folderProgressFill: { height: "100%", backgroundColor: "#111111", borderRadius: "99px", transition: "width 0.4s ease" },
  folderContents: { display: "flex", flexDirection: "column" },

  // Docs
  docRow: { padding: "14px 18px", borderBottom: "1px solid #f9f9f9" },
  docRowTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" },
  docLeft: { display: "flex", alignItems: "flex-start", gap: "10px", flex: 1 },
  docTitle: { fontSize: "13px", fontWeight: "600", color: "#111111", margin: "0 0 2px 0" },
  docDesc: { fontSize: "12px", color: "#888888", lineHeight: "1.5", margin: "0" },
  docActions: { display: "flex", gap: "6px", alignItems: "center", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" },
  docActionBtn: { display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap" },
  docActionBtnDone: { display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12px", fontWeight: "500", color: "#38a169", backgroundColor: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap" },
  docActionBtnActive: { backgroundColor: "#111111", color: "#ffffff", border: "1px solid #111111" },
  sampleBtn: { display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "12px", fontWeight: "500", color: "#666666", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap" },
  docActionArea: { marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f5f5f5" },
  uploadArea: { display: "flex", flexDirection: "column", gap: "8px" },
  uploadExisting: { fontSize: "12px", color: "#38a169", margin: "0" },
  uploadExistingLink: { color: "#111111", textDecoration: "underline" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", alignSelf: "flex-start" },
  uploadHint: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  inputArea: { display: "flex", flexDirection: "column", gap: "8px" },
  docTextarea: { width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", minHeight: "80px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", boxSizing: "border-box" },
  docInput: { width: "100%", padding: "9px 12px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", boxSizing: "border-box" },
  inputLabel: { display: "block", fontSize: "12px", fontWeight: "500", color: "#666666", marginBottom: "4px" },
  saveInputBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "8px 18px", fontSize: "12px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer", alignSelf: "flex-start" },
  generateHint: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0" },
  helpLink: { color: "#111111", fontWeight: "600", textDecoration: "underline" },
};