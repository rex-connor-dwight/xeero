"use client";

import { CURRENCIES } from "@/lib/data/currencies";

const PAY_FREQUENCIES = [
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "fixed", label: "Fixed / One-time" },
];

export default function CompensationSection({
  compAmount, setCompAmount,
  compCurrency, setCompCurrency,
  payFrequency, setPayFrequency,
  isEquity, setIsEquity,
}: {
  compAmount: string; setCompAmount: (v: string) => void;
  compCurrency: string; setCompCurrency: (v: string) => void;
  payFrequency: string; setPayFrequency: (v: string) => void;
  isEquity: boolean; setIsEquity: (v: boolean) => void;
}) {
  return (
    <>
      <label style={styles.label}>Compensation <span style={styles.required}>*</span></label>
      <div style={styles.compRow}>
        <select style={styles.currencySelect} value={compCurrency} onChange={(e) => setCompCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input
          style={{ ...styles.input, flex: 1, marginBottom: 0 }}
          value={compAmount}
          onChange={(e) => setCompAmount(e.target.value)}
          placeholder="e.g. 200,000 or 40,000 - 60,000"
        />
      </div>

      <label style={styles.label}>Pay frequency <span style={styles.required}>*</span></label>
      <select style={{ ...styles.input, appearance: "auto" }} value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)}>
        {PAY_FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      <label style={styles.checkboxRow}>
        <input type="checkbox" checked={isEquity} onChange={(e) => setIsEquity(e.target.checked)} />
        <span>Offering equity (negotiated directly with candidates)</span>
      </label>
    </>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  label: { fontSize: "12px", fontWeight: "500", color: "#555555", display: "block", marginBottom: "6px", marginTop: "14px" },
  required: { color: "#e53e3e" },
  input: { width: "100%", padding: "10px 13px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", boxSizing: "border-box" },
  compRow: { display: "flex", gap: "8px" },
  currencySelect: { padding: "10px 10px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "8px", outline: "none", backgroundColor: "#fafafa", color: "#111111", flexShrink: 0, width: "110px" },
  checkboxRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#444444", marginTop: "14px", cursor: "pointer" },
};