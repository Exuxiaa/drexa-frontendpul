"use client";

import { useEffect } from "react";

/**
 * Wires up the design's scroll-reveal system: every element carrying a
 * `data-reveal` attribute fades/slides into view once when it scrolls into the
 * viewport. Mirrors the IntersectionObserver used in the Claude Design handoff
 * pages (homepage.jsx, markets.jsx, portfolio.jsx, …).
 *
 * The matching CSS (`[data-reveal]` / `.is-visible` + delays) lives in
 * app/globals.css. Call this hook once near the root of any page that uses
 * `data-reveal` attributes.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
