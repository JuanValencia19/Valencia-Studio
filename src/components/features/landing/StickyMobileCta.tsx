"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// COPY DIRECTION:
//   ctaLabel  — FIXED: "Solicitar cotización" (same verb as Hero + FinalCta).
//   microcopy — FIXED direction: "Sin compromiso · Respuesta en 24h".
// Behavior: hidden below the fold. Appears after the user scrolls past 400px
// (below the hero) on mobile only (md:hidden). Toggle is transform-only
// (translate-y-full ↔ translate-y-0) — NEVER display:none, so the global
// prefers-reduced-motion guard in globals.css still applies cleanly.

const SCROLL_THRESHOLD_PX = 400;

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    };
    // Initial check (in case the page loads already scrolled, e.g. refresh).
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      inert={!visible}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Solicitar cotización
          </span>
          <span className="text-xs text-muted-foreground">
            Sin compromiso · 24h
          </span>
        </div>
        <Button
          asChild
          size="default"
          className="min-h-12 rounded-full px-6 active:scale-[0.98]"
        >
          <a href="#contacto" aria-label="Solicitar cotización">
            Solicitar
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}
