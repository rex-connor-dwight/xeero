"use client";

import { VR_COLORS, VR_FONTS } from "@/lib/data/ventureRoomTheme";
import { ventureRoomStops, type VentureRoomStop } from "@/lib/data/ventureRoomStops";

const MUTED = "#9A94A6";

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2l2.2 2.2 4.8-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stop({ stop, isLast, onRegister }: { stop: VentureRoomStop; isLast: boolean; onRegister: () => void }) {
  const done = stop.status === "done";
  const current = stop.status === "current";
  const upcoming = stop.status === "upcoming";

  return (
    <li className="vr-stop">
      <div className="vr-track">
        <span className="vr-node" data-status={stop.status}>
          {done && <Check />}
          {current && <span className="vr-pulse" />}
        </span>
        {!isLast && <span className="vr-line" data-done={done} />}
      </div>

      <div className="vr-body">
        <span
          style={{
            ...styles.pill,
            color: current ? VR_COLORS.primary : upcoming ? MUTED : VR_COLORS.white,
            backgroundColor: current ? VR_COLORS.accent : done ? VR_COLORS.primary : "transparent",
            border: upcoming ? `1px solid ${MUTED}` : "1px solid transparent",
          }}
        >
          {done ? "Done" : current ? "Next stop" : "Coming soon"}
        </span>

        <h3 style={{ ...styles.city, color: upcoming ? MUTED : VR_COLORS.primary }}>{stop.city}</h3>

        {stop.date && <p style={styles.meta}>{stop.date}</p>}
        {stop.venue && <p style={styles.metaSoft}>{stop.venue}</p>}

        {done && (
          <button
            style={styles.link}
            onClick={() => document.getElementById("past-edition")?.scrollIntoView({ behavior: "smooth" })}
          >
            See the recap →
          </button>
        )}
        {current && (
          <button style={styles.cta} onClick={onRegister}>
            Register for {stop.city} →
          </button>
        )}
      </div>
    </li>
  );
}

export default function JourneySection({ onRegister }: { onRegister: () => void }) {
  return (
    <section id="journey" style={styles.section}>
      <style>{css}</style>
      <div style={styles.inner}>
        <span style={styles.eyebrow}>The journey</span>
        <h2 style={styles.heading}>The Venture Room is on the road.</h2>
        <p style={styles.sub}>
          One room per city. Founders, partners and investors, wherever the next stop is.
        </p>

        <ol className="vr-route">
          {ventureRoomStops.map((stop, i) => (
            <Stop key={stop.id} stop={stop} isLast={i === ventureRoomStops.length - 1} onRegister={onRegister} />
          ))}
        </ol>
      </div>
    </section>
  );
}

const css = `
.vr-route{list-style:none;margin:48px 0 0;padding:0;display:flex}
.vr-stop{flex:1;display:flex;flex-direction:column;min-width:0}
.vr-track{display:flex;align-items:center;margin-bottom:22px}
.vr-node{position:relative;flex:0 0 auto;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box}
.vr-node[data-status="done"]{background:#301660}
.vr-node[data-status="current"]{background:#F1A9FA;border:3px solid #301660}
.vr-node[data-status="upcoming"]{background:#F7F4EF;border:2px solid #CFC8D9}
.vr-pulse{position:absolute;inset:-3px;border-radius:50%;border:2px solid #F1A9FA;animation:vr-pulse 1.8s ease-out infinite}
@keyframes vr-pulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(2.2);opacity:0}}
.vr-line{flex:1;margin:0 10px;border-top:2px dashed #CFC8D9}
.vr-line[data-done="true"]{border-top:2px solid #301660}
.vr-body{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding-right:16px}
@media(max-width:760px){
  .vr-route{flex-direction:column}
  .vr-stop{flex-direction:row;gap:18px}
  .vr-track{flex-direction:column;margin-bottom:0}
  .vr-line{margin:10px 0;min-height:44px;border-top:0;border-left:2px dashed #CFC8D9}
  .vr-line[data-done="true"]{border-top:0;border-left:2px solid #301660}
  .vr-body{padding-bottom:36px}
}
@media(prefers-reduced-motion:reduce){.vr-pulse{animation:none}}
`;

type Styles = { [key: string]: React.CSSProperties };
const styles: Styles = {
  section: { padding: "110px 24px", backgroundColor: VR_COLORS.background },
  inner: { maxWidth: "1000px", margin: "0 auto" },
  eyebrow: { fontFamily: VR_FONTS.body, fontSize: "12px", fontWeight: 700, color: VR_COLORS.primary, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.5, display: "block", marginBottom: "16px" },
  heading: { fontFamily: VR_FONTS.display, fontSize: "clamp(28px, 4.5vw, 42px)", color: VR_COLORS.primary, lineHeight: "1.15", margin: "0 0 14px 0" },
  sub: { fontFamily: VR_FONTS.body, fontSize: "16px", fontWeight: 500, color: VR_COLORS.primary, opacity: 0.75, lineHeight: "1.7", maxWidth: "520px", margin: "0" },
  pill: { fontFamily: VR_FONTS.body, display: "inline-block", padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" },
  city: { fontFamily: VR_FONTS.display, fontSize: "30px", fontWeight: 400, margin: "4px 0 0 0", lineHeight: "1.1" },
  meta: { fontFamily: VR_FONTS.body, fontSize: "14px", fontWeight: 700, color: VR_COLORS.primary, margin: "0" },
  metaSoft: { fontFamily: VR_FONTS.body, fontSize: "13px", fontWeight: 500, color: VR_COLORS.primary, opacity: 0.65, margin: "0" },
  link: { fontFamily: VR_FONTS.body, fontSize: "13px", fontWeight: 700, color: VR_COLORS.primary, textDecoration: "underline", background: "none", border: "none", padding: 0, marginTop: "8px", cursor: "pointer" },
  cta: { fontFamily: VR_FONTS.body, marginTop: "12px", padding: "12px 20px", fontSize: "14px", fontWeight: 700, color: VR_COLORS.white, backgroundColor: VR_COLORS.primary, border: "none", borderRadius: "10px", cursor: "pointer" },
};