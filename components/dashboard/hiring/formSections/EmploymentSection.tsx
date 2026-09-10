"use client";

const WORK_FORMATS = ["remote", "hybrid", "onsite"];
const JOB_TYPES = ["full_time", "part_time", "contract", "internship"];

export default function EmploymentSection({
  employmentType, setEmploymentType,
  jobType, setJobType,
  contractValue, setContractValue,
  contractUnit, setContractUnit,
}: {
  employmentType: string; setEmploymentType: (v: string) => void;
  jobType: string; setJobType: (v: string) => void;
  contractValue: string; setContractValue: (v: string) => void;
  contractUnit: string; setContractUnit: (v: string) => void;
}) {
  return (
    <>
      <label style={styles.label}>Work format</label>
      <div style={styles.segmentRow}>
        {WORK_FORMATS.map((type) => (
          <button
            key={type}
            style={{ ...styles.segmentBtn, ...(employmentType === type ? styles.segmentBtnActive : {}) }}
            onClick={() => setEmploymentType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <label style={styles.label}>Employment type</label>
      <div style={styles.segmentRow}>
        {JOB_TYPES.map((type) => (
          <button
            key={type}
            style={{ ...styles.segmentBtn, ...(jobType === type ? styles.segmentBtnActive : {}) }}
            onClick={() => setJobType(type)}
          >
            {type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      {jobType === "contract" && (
        <>
          <label style={styles.label}>Contract length <span style={styles.required}>*</span></label>
          <div style={styles.compRow}>
            <input
              style={{ ...styles.input, flex: 1 }}
              type="number"
              min="1"
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              placeholder="e.g. 6"
            />
            <select style={styles.currencySelect} value={contractUnit} onChange={(e) => setContractUnit(e.target.value)}>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </>
      )}
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
  segmentRow: { display: "flex", gap: "6px" },
  segmentBtn: { flex: 1, padding: "9px", fontSize: "12px", fontWeight: "500", color: "#888888", backgroundColor: "#f9f9f9", border: "1px solid #eeeeee", borderRadius: "8px", cursor: "pointer" },
  segmentBtnActive: { color: "#111111", backgroundColor: "#f5f5f5", border: "1px solid #111111", fontWeight: "600" },
};