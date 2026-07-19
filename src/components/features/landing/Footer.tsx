import { Sparkles } from "lucide-react";

import { Separator } from "@/components/ui/separator";

// COPY DIRECTION:
//   footerTagline — es_CO, ≤10 words.
//   contactLabel  — "Escríbenos", links to the same mailto as FinalCta.
//   Disabled secondaryLinks — "Próximamente" (privacy / TyC pages don't exist
//   yet). Render honestly disabled rather than at broken routes.
// Prohibited: fabricated social handles / fake social icons. The studio has no
// real social profiles yet — we OMIT them rather than lie. Re-enable when
// real handles exist.

const CONTACT_EMAIL = "juanjovt16@gmail.com";
const MAILTO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Hola Valencia Studio",
)}`;

// Server Component → year computed at request time on the server. NO client
// new Date() to avoid hydration mismatch (spec req).
const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a
              href="#top"
              className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Valencia Studio — inicio"
            >
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <Sparkles className="size-4" />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
                Valencia Studio
              </span>
            </a>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Landings premium con IA para negocios locales de Colombia.
            </p>
          </div>

          <nav
            className="flex flex-col gap-3 text-sm md:text-right"
            aria-label="Enlaces del pie"
          >
            <p className="font-medium text-foreground">Estudio</p>
            <a
              href="#proceso"
              className="w-fit text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:ml-auto"
            >
              Cómo funciona
            </a>
            <a
              href="#faq"
              className="w-fit text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:ml-auto"
            >
              Preguntas frecuentes
            </a>
            <a
              href={MAILTO_HREF}
              className="w-fit text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:ml-auto"
            >
              {CONTACT_EMAIL}
            </a>
          </nav>

          <nav
            className="flex flex-col gap-3 text-sm md:text-right"
            aria-label="Legal"
          >
            <p className="font-medium text-foreground">Legal</p>
            {/* Privacy / TyC pages do not exist yet. Rendered honestly disabled,
                annotated "Próximamente" — do NOT point at broken routes. */}
            <span
              aria-disabled="true"
              role="link"
              className="w-fit cursor-not-allowed select-none text-muted-foreground/70 md:ml-auto"
            >
              Política de privacidad · Próximamente
            </span>
            <span
              aria-disabled="true"
              role="link"
              className="w-fit cursor-not-allowed select-none text-muted-foreground/70 md:ml-auto"
            >
              Términos y condiciones · Próximamente
            </span>
          </nav>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
          <p>© {YEAR} Valencia Studio. Todos los derechos reservados.</p>
          <p>
            Hecho en Colombia ·{" "}
            <span className="text-muted-foreground">v0 · early-stage</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
