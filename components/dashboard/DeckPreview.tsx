"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { FileText } from "lucide-react";

async function getDeckSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from("decks").createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export default function DeckPreview({ deckUrl }: { deckUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!deckUrl) return;
    let cancelled = false;

    const renderPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const signedUrl = await getDeckSignedUrl(deckUrl);
        if (!signedUrl || cancelled) return;
        const pdf = await pdfjsLib.getDocument({ url: signedUrl }).promise;
        const page = await pdf.getPage(1);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvas: canvas, viewport }).promise;
        if (!cancelled) setLoaded(true);
      } catch {
        if (!cancelled) setError(true);
      }
    };

    renderPdf();
    return () => { cancelled = true; };
  }, [deckUrl]);

  if (error) return null;

  return (
    <div style={styles.wrapper}>
      <canvas ref={canvasRef} style={{ ...styles.canvas, opacity: loaded ? 1 : 0 }} />
      {!loaded && (
        <div style={styles.placeholder}>
          <FileText size={20} color="#cccccc" />
          <span style={styles.placeholderText}>Loading preview...</span>
        </div>
      )}
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  wrapper: { width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid #f0f0f0", backgroundColor: "#fafafa", marginTop: "12px", position: "relative", minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center" },
  canvas: { width: "100%", height: "auto", display: "block", transition: "opacity 0.3s ease" },
  placeholder: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "24px" },
  placeholderText: { fontSize: "12px", color: "#cccccc" },
};