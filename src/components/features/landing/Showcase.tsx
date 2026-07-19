import {
  ShoppingBag,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

// COPY DIRECTION:
//   Each card label — a real business TYPE, not a fake client name.
//   Badge — FIXED: "Próximamente" (preview-labeled per spec).
//   NO fake client logos, NO invented business names beyond the 3 type labels.
//   Real Figma / HTML→screenshot mockups can swap in via next/image without
//   layout change (design § Mockup Asset Strategy) — kept as gradient cards now.

type ShowcaseItem = {
  icon: LucideIcon;
  label: string;
  desc: string;
};

const ITEMS: ReadonlyArray<ShowcaseItem> = [
  {
    icon: Stethoscope,
    label: "Clínica",
    desc: "Agenda citas y servicios destacados.",
  },
  {
    icon: UtensilsCrossed,
    label: "Restaurante",
    desc: "Menú, reservas y ubicación en un toque.",
  },
  {
    icon: ShoppingBag,
    label: "Retail",
    desc: "Catálogo y pedidos por WhatsApp.",
  },
];

export function Showcase() {
  return (
    <section
      id="showcase"
      aria-labelledby="showcase-heading"
      className="py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-border text-muted-foreground">
            Plantillas
          </Badge>
          <h2
            id="showcase-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Plantillas por tipo de negocio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
            Maquetas en desarrollo para clínicas, restaurantes y retail. Pronto
            podrás elegir y lanzar en días.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <div className="group relative overflow-hidden rounded-xl border border-border shadow-soft transition-transform duration-200 ease-out hover:-translate-y-1 focus-within:-translate-y-1">
                  <div className="relative aspect-[4/3] w-full bg-mockup-card-gradient">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                      <Icon
                        className="size-12 text-primary-foreground"
                        aria-hidden="true"
                      />
                      <div className="text-sm font-medium text-primary-foreground/90">
                        {item.label}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 bg-primary-foreground/95 text-primary"
                    >
                      Próximamente
                    </Badge>
                  </div>
                  <div className="bg-card px-6 py-4">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
