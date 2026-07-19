"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// COPY DIRECTION:
//   Section heading — "Preguntas frecuentes", es_CO.
//   6 Q/A items, es_CO, covering: what we do, pricing, turnaround, what info
//   the client provides, hosting/deploy responsibility, language support.
//   The JSON-LD `FAQPage` below MUST mirror the visible Q/A EXACTLY (same
//   strings). Update both lists together — they share the FAQ_ITEMS array.

type FaqItem = { q: string; a: string };

const FAQ_ITEMS: ReadonlyArray<FaqItem> = [
  {
    q: "¿Qué hace exactamente Valencia Studio?",
    a: "Diseñamos y publicamos landing pages premium para negocios locales en Colombia, construidas con IA y optimizadas para una sola acción: que el visitante te contacte. No hacemos tiendas online ni sitios corporativos grandes.",
  },
  {
    q: "¿Cuánto cuesta una landing?",
    a: "Cotización personalizada según el tipo de negocio y la cantidad de secciones. No manejamos precios fijos: pasamos un presupuesto cerrado después del brief, sin sorpresas ni cobros por hora.",
  },
  {
    q: "¿En cuánto tiempo tengo mi landing lista?",
    a: "Cuando el brief está claro, entregamos la primera versión en días. La publicación depende de que el dominio y los textos finales estén aprobados; si algo lo pone en riesgo, te lo decimos antes de empezar.",
  },
  {
    q: "¿Qué necesito tener listo antes de empezar?",
    a: "Tu negocio, a quién vendes, qué acción quieres que el visitante haga ( WhatsApp, llamada, formulario) y, si existe, tu logo y colores. Si no tienes nada de esto, te ayudamos a definirlo en el brief.",
  },
  {
    q: "¿Quién paga el dominio y el hosting?",
    a: "El dominio va a tu nombre y tú lo pagas anual. El hosting y el despliegue los gestionamos nosotros en Vercel como parte del servicio, así no lidias con servidores ni configuraciones técnicas.",
  },
  {
    q: "¿Las landings funcionan en inglés o en otros países?",
    a: "Hoy construimos en español para Colombia. Si necesitas una versión en inglés u otro país de LatAm, lo acordamos en el brief y lo entregamos como una segunda versión de la misma landing.",
  },
];

// FAQPage JSON-LD — mirrors visible Q/A 1:1. Typed object → JSON.stringify
// keeps the payload valid by construction (no string templates).
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="faq-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Preguntas frecuentes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            Lo que la mayoría de pymes nos preguntan antes de pedir una
            cotización. Si tienes otra duda, escríbenos.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-10 w-full"
          defaultValue="faq-0"
        >
          {FAQ_ITEMS.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="border-border"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline hover:bg-accent/40 rounded-md px-2">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground px-2">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <script
        type="application/ld+json"
        // Structured data mirror of the visible FAQ. Built from a typed object
        // via JSON.stringify so the payload is always valid JSON.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </section>
  );
}
