import {
  MessageCircleWarning,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// COPY DIRECTION:
//   Each pain item — honest validation of a pyme web pain, ≤1 sentence, es_CO.
//   Each solution item — Valencia Studio answer, focused on outcome, es_CO.
//   NO fabricated case studies, NO client names, NO fake metrics.

type PainItem = { icon: LucideIcon; title: string; desc: string };
type SolutionItem = { icon: LucideIcon; title: string; desc: string };

const PROBLEMS: ReadonlyArray<PainItem> = [
  {
    icon: ShoppingCart,
    title: "Tu web no convierte",
    desc: "Tienes tráfico pero los visitantes se van sin contactarte ni comprar.",
  },
  {
    icon: MessageCircleWarning,
    title: "Dependes de WhatsApp y redes",
    desc: "Tu negocio vive en chats y perfiles que no controlas ni escalan.",
  },
  {
    icon: RefreshCw,
    title: "Actualizar es lento y costoso",
    desc: "Cada Cambio requiere un desarrollador, días de espera y presupuestos imprevistos.",
  },
];

const SOLUTIONS: ReadonlyArray<SolutionItem> = [
  {
    icon: Zap,
    title: "Landings construidas con IA",
    desc: "Generamos tu página con IA y criterio de diseño, enfocada en una sola acción.",
  },
  {
    icon: Timer,
    title: "Listas en días, no meses",
    desc: "Desde el brief hasta la publicación en internet en días, no semanas.",
  },
  {
    icon: Sparkles,
    title: "Diseño premium y optimizada",
    desc: "Estructura, copy y velocidad pensadas para que el visitante actúe.",
  },
];

function PainCard({ item }: { item: PainItem }) {
  const Icon = item.icon;
  return (
    <Card className="h-full rounded-xl border-border shadow-soft">
      <CardHeader>
        <div
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-lg border border-border bg-accent text-accent-foreground"
        >
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{item.desc}</p>
      </CardContent>
    </Card>
  );
}

function SolutionCard({ item }: { item: SolutionItem }) {
  const Icon = item.icon;
  return (
    <Card className="h-full rounded-xl border-border bg-primary/5 shadow-soft">
      <CardHeader>
        <div
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <Icon className="size-5" />
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{item.desc}</p>
      </CardContent>
    </Card>
  );
}

export function ProblemSolution() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-border text-muted-foreground">
            El problema
          </Badge>
          <h2
            id="problem-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Tener web no es lo mismo que tener clientes
          </h2>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PROBLEMS.map((item) => (
            <li key={item.title}>
              <PainCard item={item} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-20 max-w-7xl px-4 md:mt-24 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="mb-4">La solución</Badge>
          <h2
            id="solution-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Landings premium con IA, listas para convertir
          </h2>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {SOLUTIONS.map((item) => (
            <li key={item.title}>
              <SolutionCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
