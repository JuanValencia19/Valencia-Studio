import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// COPY DIRECTION:
//   headline  — RESULT for a local-business owner, es_CO, ≤7 words.
//   subhead   — names PYMES / Colombia + IA + diseño premium, 1 sentence.
//   microtrust — honest early-stage badge, ≤5 words.
//   primaryCta  — FIXED: "Solicitar cotización" → #contacto
//   secondaryCta — FIXED: "Ver plantillas" → #showcase
// Prohibited vocab: "enviar", "continuar", "submit".

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-headline"
      className="relative overflow-hidden border-b border-border"
    >
      {/* Brand violet radial wash (token-defined) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-landing-hero-gradient"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          {/* Microtrust — honest early-stage signal */}
          <Badge
            variant="outline"
            className="animate-fade-up gap-1.5 border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Estudio en construcción · v0
          </Badge>

          <h1
            id="hero-headline"
            className="animate-fade-up text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "100ms" }}
          >
            Landings que convierten visitantes en clientes
          </h1>

          <p
            className="animate-fade-up max-w-2xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl"
            style={{ animationDelay: "200ms" }}
          >
            Diseñamos landing pages premium para pymes y negocios locales en
            Colombia, construidas con IA y optimizadas para conversión — listas
            en días, no en meses.
          </p>

          <div
            className="animate-fade-up flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              asChild
              size="lg"
              className="min-h-12 w-full rounded-full px-8 text-base active:scale-[0.98] sm:w-auto"
            >
              <a href="#contacto">
                Solicitar cotización
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-12 w-full rounded-full px-8 text-base sm:w-auto"
            >
              <a href="#showcase">Ver plantillas</a>
            </Button>
          </div>

          {/* Product visual — pure gradient, no image bytes → instant LCP on text */}
          <div
            aria-hidden="true"
            className="animate-fade-up mt-4 w-full max-w-5xl"
            style={{ animationDelay: "400ms" }}
          >
            <div className="mx-auto aspect-[16/9] w-full rounded-2xl border border-border bg-mockup-card-gradient shadow-soft" />
          </div>
        </div>
      </div>
    </section>
  );
}
