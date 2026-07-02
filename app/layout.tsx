"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Page changed — complete the bar
    setWidth(100);
    setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
  }, [pathname]);

  // Intercept link clicks to start the loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#")) return;

      // Internal navigation — start loader
      setVisible(true);
      setWidth(0);

      if (intervalRef.current) clearInterval(intervalRef.current);

      // Animate to ~80% then stall waiting for page
      let w = 0;
      intervalRef.current = setInterval(() => {
        w += Math.random() * 15;
        if (w >= 80) {
          w = 80;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setWidth(w);
      }, 150);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: "2px",
        backgroundColor: "transparent",
        pointerEvents: "none",
      }}>
        <div style={{
          height: "100%",
          backgroundColor: "#111111",
          width: `${width}%`,
          transition: width === 100 ? "width 0.2s ease" : "width 0.15s ease",
          borderRadius: "0 2px 2px 0",
        }} />
      </div>
      {/* Subtle full-page overlay to prevent double clicks during transition */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99998,
        pointerEvents: "none",
        backgroundColor: "rgba(255,255,255,0)",
      }} />
    </>
  );
}