"use client";

import { useRef } from "react";
import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";
import { Download } from "lucide-react";

export default function ETicket({
  fullName,
  email,
  ticketCode,
}: {
  fullName: string;
  email: string;
  ticketCode: string;
}) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    // Dynamically import html2canvas only when needed, since it's a heavy library
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(ticketRef.current, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = `venture-room-ticket-${ticketCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div>
      <div ref={ticketRef} style={styles.ticket}>
        <div style={styles.ticketTop}>
          <p style={styles.ticketBrand}>THE VENTURE ROOM</p>
          <p style={styles.ticketEvent}>26 September 2026 · Bridge by Obsidian, Yaba, Lagos</p>
        </div>

        <div style={styles.divider}>
          <span style={styles.perfLeft} />
          <span style={styles.perfRight} />
        </div>

        <div style={styles.ticketBottom}>
          <div style={styles.attendeeInfo}>
            <p style={styles.fieldLabel}>Attendee</p>
            <p style={styles.fieldValue}>{fullName}</p>
            <p style={styles.fieldLabel}>Email</p>
            <p style={styles.fieldValue}>{email}</p>
          </div>
          <div style={styles.codeBlock}>
            <p style={styles.fieldLabel}>Ticket Code</p>
            <p style={styles.codeValue}>{ticketCode}</p>
          </div>
        </div>
      </div>

      <button style={styles.downloadBtn} onClick={handleDownload}>
        <Download size={14} />Download Ticket
      </button>
    </div>
  );
}

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  ticket: {
    backgroundColor: VR_COLORS.primary,
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "16px",
  },
  ticketTop: {
    padding: "24px 24px 20px 24px",
    textAlign: "center",
  },
  ticketBrand: {
    fontFamily: VR_FONTS.display,
    fontSize: "18px",
    color: VR_COLORS.white,
    margin: "0 0 6px 0",
    letterSpacing: "0.02em",
  },
  ticketEvent: {
    fontFamily: VR_FONTS.body,
    fontSize: "11px",
    fontWeight: 500,
    color: VR_COLORS.accent,
    margin: "0",
  },
  divider: {
    position: "relative",
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.2)",
    margin: "0 0",
  },
  perfLeft: {
    position: "absolute",
    left: "-10px",
    top: "-9px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: VR_COLORS.background,
  },
  perfRight: {
    position: "absolute",
    right: "-10px",
    top: "-9px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: VR_COLORS.background,
  },
  ticketBottom: {
    padding: "22px 24px 26px 24px",
  },
  attendeeInfo: {
    marginBottom: "18px",
  },
  fieldLabel: {
    fontFamily: VR_FONTS.body,
    fontSize: "10px",
    fontWeight: 700,
    color: VR_COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 3px 0",
  },
  fieldValue: {
    fontFamily: VR_FONTS.body,
    fontSize: "14px",
    fontWeight: 700,
    color: VR_COLORS.white,
    margin: "0 0 12px 0",
  },
  codeBlock: {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: `1px solid ${VR_COLORS.accent}50`,
    borderRadius: "10px",
    padding: "14px 16px",
    textAlign: "center",
  },
  codeValue: {
    fontFamily: VR_FONTS.display,
    fontSize: "22px",
    color: VR_COLORS.accent,
    letterSpacing: "0.08em",
    margin: "0",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    width: "100%",
    padding: "12px",
    fontFamily: VR_FONTS.body,
    fontSize: "13px",
    fontWeight: 700,
    color: VR_COLORS.primary,
    backgroundColor: "#FAFAF8",
    border: `1px solid ${VR_COLORS.primary}25`,
    borderRadius: "10px",
    cursor: "pointer",
  },
};