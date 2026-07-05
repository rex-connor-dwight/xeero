"use client";

import { useRef } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { FieldLabel } from "@/components/dashboard/TooltipField";
import DeckPreview from "@/components/dashboard/DeckPreview";

type ProfileData = {
  startup_name: string;
  tagline: string;
  problem: string;
  solution: string;
  stage: string;
  industry: string;
  business_model: string;
  traction: string;
  location: string;
  website: string;
  year_founded: string;
  team_size: string;
  funding_goal: string;
  funding_stage: string;
  logo_url: string;
  deck_url: string;
  [key: string]: any;
};

export default function EditStartupTab({
  data,
  update,
  onLogoUpload,
  onDeckUpload,
}: {
  data: ProfileData;
  update: (field: string, value: any) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeckUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const logoRef = useRef<HTMLInputElement>(null);
  const deckRef = useRef<HTMLInputElement>(null);

  return (
    <div style={styles.sections}>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Identity</h2>
        <p style={styles.cardSubtitle}>Basic information about your startup.</p>

        <div style={styles.logoUploadRow}>
          <div style={styles.logoBox}>
            {data.logo_url ? (
              <img src={data.logo_url} alt="logo" style={styles.logoImg} />
            ) : (
              <span style={styles.logoInitial}>{data.startup_name?.[0]?.toUpperCase() || "X"}</span>
            )}
          </div>
          <div>
            <button style={styles.uploadBtn} onClick={() => logoRef.current?.click()}>
              <Upload size={13} />Upload Logo
            </button>
            <p style={styles.hint}>PNG or JPG, max 2MB</p>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onLogoUpload} />
          </div>
        </div>

        <FieldLabel label="Startup Name" />
        <input style={styles.input} value={data.startup_name} onChange={(e) => update("startup_name", e.target.value)} placeholder="e.g. Xeero" />

        <FieldLabel label="Tagline" tooltipKey="tagline" />
        <input style={styles.input} value={data.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="e.g. From idea to funding, one link." />

        <FieldLabel label="Website" />
        <input style={styles.input} value={data.website} onChange={(e) => update("website", e.target.value)} placeholder="https://yourstartup.com" />

        <div style={styles.twoCol}>
          <div style={styles.colItem}>
            <FieldLabel label="Year Founded" />
            <input style={styles.input} value={data.year_founded} onChange={(e) => update("year_founded", e.target.value)} placeholder="e.g. 2024" />
          </div>
          <div style={styles.colItem}>
            <FieldLabel label="Team Size" />
            <input style={styles.input} value={data.team_size} onChange={(e) => update("team_size", e.target.value)} placeholder="e.g. 3" />
          </div>
        </div>

        <FieldLabel label="Location" />
        <input style={styles.input} value={data.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Lagos, Nigeria" />
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Problem & Solution</h2>
        <p style={styles.cardSubtitle}>Help investors understand what you're solving.</p>

        <FieldLabel label="The Problem" tooltipKey="problem" />
        <textarea style={styles.textarea} value={data.problem} onChange={(e) => update("problem", e.target.value)} placeholder="What pain point does your startup address?" />

        <FieldLabel label="Your Solution" tooltipKey="solution" />
        <textarea style={styles.textarea} value={data.solution} onChange={(e) => update("solution", e.target.value)} placeholder="How does your startup solve it?" />
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Traction & Market</h2>
        <p style={styles.cardSubtitle}>Numbers build credibility.</p>

        <FieldLabel label="Traction" tooltipKey="traction" />
        <textarea style={styles.textarea} value={data.traction} onChange={(e) => update("traction", e.target.value)} placeholder="e.g. 500 waitlist signups, $10k MRR" />

        <FieldLabel label="Business Model" tooltipKey="business_model" />
        <input style={styles.input} value={data.business_model} onChange={(e) => update("business_model", e.target.value)} placeholder="e.g. SaaS subscription at $9/mo" />

        <div style={styles.twoCol}>
          <div style={styles.colItem}>
            <FieldLabel label="Stage" />
            <select style={styles.select} value={data.stage} onChange={(e) => update("stage", e.target.value)}>
              <option value="">Select stage</option>
              <option value="Idea">Idea</option>
              <option value="Building">Building</option>
              <option value="Launched">Launched</option>
              <option value="Scaling">Scaling</option>
            </select>
          </div>
          <div style={styles.colItem}>
            <FieldLabel label="Industry" />
            <select style={styles.select} value={data.industry} onChange={(e) => update("industry", e.target.value)}>
              <option value="">Select industry</option>
              <option value="Fintech">Fintech</option>
              <option value="Healthtech">Healthtech</option>
              <option value="Edtech">Edtech</option>
              <option value="E-commerce">E-commerce</option>
              <option value="SaaS">SaaS</option>
              <option value="AI">AI</option>
              <option value="Logistics">Logistics</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Fundraising</h2>
        <p style={styles.cardSubtitle}>Let investors know what you're looking for.</p>

        <div style={styles.twoCol}>
          <div style={styles.colItem}>
            <FieldLabel label="Funding Stage" />
            <select style={styles.select} value={data.funding_stage} onChange={(e) => update("funding_stage", e.target.value)}>
              <option value="">Select stage</option>
              <option value="Pre-seed">Pre-seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Bootstrapped">Bootstrapped</option>
            </select>
          </div>
          <div style={styles.colItem}>
            <FieldLabel label="Funding Goal" tooltipKey="funding_goal" />
            <input style={styles.input} value={data.funding_goal} onChange={(e) => update("funding_goal", e.target.value)} placeholder="e.g. $500,000" />
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Pitch Deck</h2>
        <p style={styles.cardSubtitle}>Upload your deck or build one with Xeero.</p>

        <div style={styles.deckGrid}>
          <div style={styles.deckOption}>
            <div style={styles.deckOptionIcon}>
              <FileText size={20} color="#111111" />
            </div>
            <h3 style={styles.deckOptionTitle}>Upload your deck</h3>
            <p style={styles.deckOptionText}>Upload your existing pitch deck as a PDF.</p>
            {data.deck_url ? (
              <div style={styles.deckUploadedRow}>
                <span style={styles.deckUploadedText}>✓ Deck uploaded</span>
                <button style={styles.deckReplaceBtn} onClick={() => deckRef.current?.click()}>Replace</button>
              </div>
            ) : (
              <button style={styles.uploadBtn} onClick={() => deckRef.current?.click()}>
                <Upload size={13} />Upload PDF
              </button>
            )}
            <input ref={deckRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={onDeckUpload} />
            {data.deck_url && <DeckPreview deckUrl={data.deck_url} />}
          </div>

          <div style={styles.deckDivider} />

          <div style={{ ...styles.deckOption, opacity: 0.5 }}>
            <div style={{ ...styles.deckOptionIcon, backgroundColor: "#f5f5f5" }}>
              <Sparkles size={20} color="#aaaaaa" />
            </div>
            <h3 style={{ ...styles.deckOptionTitle, color: "#aaaaaa" }}>Build with Xeero</h3>
            <p style={styles.deckOptionText}>We'll guide you slide by slide on what a great pitch deck looks like.</p>
            <button style={styles.comingSoonBtn} disabled>Coming Soon</button>
          </div>
        </div>
      </div>

    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  sections: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0 0 4px 0" },
  cardSubtitle: { fontSize: "12px", color: "#aaaaaa", margin: "0 0 20px 0" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "14px", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#111111" },
  textarea: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "14px", boxSizing: "border-box", backgroundColor: "#fafafa", minHeight: "96px", resize: "vertical", fontFamily: "inherit", color: "#111111", lineHeight: "1.6" },
  select: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", marginBottom: "14px", boxSizing: "border-box", backgroundColor: "#fafafa", appearance: "none", color: "#111111" },
  twoCol: { display: "flex", gap: "14px" },
  colItem: { flex: 1 },
  hint: { fontSize: "11px", color: "#bbbbbb", margin: "0" },
  logoUploadRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  logoBox: { width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  logoImg: { width: "100%", height: "100%", objectFit: "cover" },
  logoInitial: { fontSize: "18px", fontWeight: "700", color: "#ffffff" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#111111", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", cursor: "pointer", marginBottom: "4px" },
  deckGrid: { display: "flex", gap: "24px", flexWrap: "wrap" },
  deckOption: { flex: 1, minWidth: "180px", display: "flex", flexDirection: "column", gap: "8px" },
  deckOptionIcon: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" },
  deckOptionTitle: { fontSize: "14px", fontWeight: "600", color: "#111111", margin: "0" },
  deckOptionText: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0" },
  deckDivider: { width: "1px", backgroundColor: "#f0f0f0", alignSelf: "stretch" },
  deckUploadedRow: { display: "flex", alignItems: "center", gap: "10px" },
  deckUploadedText: { fontSize: "12px", color: "#38a169", fontWeight: "500" },
  deckReplaceBtn: { fontSize: "12px", color: "#888888", backgroundColor: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" },
  comingSoonBtn: { padding: "7px 14px", fontSize: "12px", fontWeight: "500", color: "#aaaaaa", backgroundColor: "#f5f5f5", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "not-allowed", alignSelf: "flex-start" },
};