import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// COPY DIRECTION:
//   heading   — es_CO, single result-oriented value prop, no fake urgency.
//   body      — 1-2 sentences echoing hero mechanism (IA + diseño premium).
//   primaryCta — FIXED: "Solicitar cotización" → mailto:juanjovt16@gmail.com
//                with prefilled subject + body (Spanish-neutral).
//   microcopy — FIXED direction: "Sin compromiso · Respuesta en 24h".
// Prohibited: form elements, submit handlers, Supabase, backend calls.

const CONTACT_EMAIL = "juanjovt16@gmail.com";

const MAILTO_BODY = [
  "Hola Valencia Studio,",
  "",
  "Quiero una cotización para mi landing.",
  "",
  "Negocio:",
  "Audiencia:",
  "Acción que quiero que el visitante haga:",
  "Dominio que ya tengo (o aún no):",
  "",
  "Saludos.",
].join("\n");

const MAILTO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Cotización de landing — [mi negocio]",
)}&body=${encodeURIComponent(MAILTO_BODY)}`;

export function FinalCta() {
  return (
    <section
      id="contacto"
      aria-labelledby="final-cta-heading"
      className="border-y border-border bg-accent/30 py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6 lg:px-8">
        <h2
          id="final-cta-heading"
          className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          ¿Listo para tu landing premium?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
          Cuéntanos qué vendes y a quién. Te respondemos con un plan, una
          timeline honesta y un presupuesto cerrado — sin reuniones deventas ni
          compromisos previos.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="min-h-12 w-full rounded-full px-8 text-base active:scale-[0.98] sm:w-auto"
          >
            <a
              href={MAILTO_HREF}
              aria-label="Solicitar cotización por correo a Valencia Studio"
            >
              Solicitar cotización
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Sin compromiso · Respuesta en 24h
          </p>
        </div>
      </div>
    </section>
  );
}
