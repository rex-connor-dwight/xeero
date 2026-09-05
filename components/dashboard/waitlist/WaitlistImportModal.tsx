"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

type ParsedRow = { name: string; email: string };

export default function WaitlistImportModal({
  profileId,
  existingEmails,
  onClose,
  onImported,
}: {
  profileId: string;
  existingEmails: Set<string>;
  onClose: () => void;
  onImported: () => void;
}) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);

  const MAX_ROWS = 5000;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    setImportResult(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];

        // Try to auto-detect email and name columns by common header names
        const sample = data[0] || {};
        const keys = Object.keys(sample);
        const emailKey = keys.find((k) => k.toLowerCase().includes("email")) || keys[0];
        const nameKey = keys.find((k) => k.toLowerCase().includes("name"));

        const parsed: ParsedRow[] = data
          .map((row) => ({
            email: (row[emailKey] || "").trim().toLowerCase(),
            name: nameKey ? (row[nameKey] || "").trim() : "",
          }))
          .filter((row) => row.email && row.email.includes("@"));

        if (parsed.length === 0) {
          setParseError("No valid email addresses found in this file. Make sure one column contains emails.");
          setRows([]);
          return;
        }

        if (parsed.length > MAX_ROWS) {
          setParseError(`This file has ${parsed.length} rows. Please import up to ${MAX_ROWS} at a time.`);
          setRows([]);
          return;
        }

        setRows(parsed);
      },
      error: () => {
        setParseError("Couldn't read this file. Please make sure it's a valid CSV.");
      },
    });
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);

    const newRows = rows.filter((r) => !existingEmails.has(r.email));
    const skipped = rows.length - newRows.length;

    if (newRows.length > 0) {
      const insertRows = newRows.map((r) => ({
        profile_id: profileId,
        email: r.email,
        name: r.name || null,
        source: "imported",
      }));

      await supabase.from("waitlist").insert(insertRows);
    }

    setImportResult({ added: newRows.length, skipped });
    setImporting(false);
    onImported();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Upload size={16} color="#111111" />
            <p style={styles.title}>Import waitlist from CSV</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={16} color="#888888" />
          </button>
        </div>

        {importResult ? (
          <div style={styles.resultState}>
            <div style={styles.resultIcon}><CheckCircle size={26} color="#38a169" /></div>
            <h3 style={styles.resultTitle}>Import complete</h3>
            <p style={styles.resultText}>
              Added <strong>{importResult.added}</strong> new contact{importResult.added !== 1 ? "s" : ""}
              {importResult.skipped > 0 && <> · skipped <strong>{importResult.skipped}</strong> already on your waitlist</>}
            </p>
            <button style={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p style={styles.subtitle}>
              Upload a CSV with a column for email (and optionally a name column). Make sure you have permission
              to email the contacts you import, this list won't have opted in through Xeero directly.
            </p>

            <label style={styles.uploadArea}>
              <Upload size={18} color="#888888" />
              <span style={styles.uploadText}>{fileName || "Choose a CSV file"}</span>
              <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleFile} />
            </label>

            {parseError && (
              <div style={styles.errorBox}>
                <AlertCircle size={13} color="#d69e2e" />
                <span style={styles.errorText}>{parseError}</span>
              </div>
            )}

            {rows.length > 0 && (
              <>
                <p style={styles.previewLabel}>{rows.length} contacts found</p>
                <div style={styles.previewTable}>
                  {rows.slice(0, 5).map((row, i) => (
                    <div key={i} style={styles.previewRow}>
                      <span style={styles.previewName}>{row.name || "—"}</span>
                      <span style={styles.previewEmail}>{row.email}</span>
                    </div>
                  ))}
                  {rows.length > 5 && (
                    <p style={styles.previewMore}>+ {rows.length - 5} more</p>
                  )}
                </div>

                <button
                  style={{ ...styles.importBtn, opacity: importing ? 0.6 : 1 }}
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? "Importing..." : `Import ${rows.length} Contacts`}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  modal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.3)", maxHeight: "85vh", overflowY: "auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "8px" },
  title: { fontSize: "15px", fontWeight: "700", color: "#111111", margin: "0" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", display: "flex" },
  subtitle: { fontSize: "12px", color: "#888888", lineHeight: "1.6", margin: "0 0 18px 0" },
  uploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "28px 16px", backgroundColor: "#f9f9f9", border: "1px dashed #dddddd", borderRadius: "10px", cursor: "pointer", marginBottom: "12px" },
  uploadText: { fontSize: "13px", color: "#888888", fontWeight: "500" },
  errorBox: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", backgroundColor: "#fffbeb", border: "1px solid #fef08a", borderRadius: "8px", marginBottom: "12px" },
  errorText: { fontSize: "12px", color: "#92610a", lineHeight: "1.5" },
  previewLabel: { fontSize: "12px", fontWeight: "600", color: "#555555", margin: "12px 0 8px 0" },
  previewTable: { backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" },
  previewRow: { display: "flex", justifyContent: "space-between", gap: "10px", padding: "5px 0", fontSize: "12px" },
  previewName: { color: "#111111", fontWeight: "500" },
  previewEmail: { color: "#888888" },
  previewMore: { fontSize: "11px", color: "#aaaaaa", margin: "6px 0 0 0", textAlign: "center" },
  importBtn: { width: "100%", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
  resultState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", textAlign: "center", gap: "8px" },
  resultIcon: { width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: "16px", fontWeight: "700", color: "#111111", margin: "0" },
  resultText: { fontSize: "13px", color: "#666666", margin: "0 0 12px 0", lineHeight: "1.6" },
  doneBtn: { padding: "10px 24px", fontSize: "13px", fontWeight: "600", color: "#ffffff", backgroundColor: "#111111", border: "none", borderRadius: "8px", cursor: "pointer" },
};