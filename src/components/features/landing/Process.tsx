import { PenLine, Rocket, Search, WandSparkles, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// COPY DIRECTION:
//   Section heading — es_CO, "Cómo funciona".
//   Each step — lucide icon + Badge step number + title + 1-sentence desc.
//   Per spec direction: 4 steps (1. Cuéntanos tu negocio / 2. La IA genera tu
//   landing / 3. Revisamos juntos / 4. Publicamos y medimos).

type StepItem = {
  icon: LucideIcon;
  step: number;
  title: string;
  desc: string;
};

const STEPS: ReadonlyArray<StepItem> = [
  {
    icon: PenLine,
    step: 1,
    title: "Cuéntanos tu negocio",
    desc: "Compartes en un formulario breve qué vendes, a quién y qué acción quieres que tus visitantes hagan.",
  },
  {
    icon: WandSparkles,
    step: 2,
    title: "La IA genera tu landing",
    desc: "Construimos la primera versión de tu página con IA, copy y estructura pensadas para convertir.",
  },
  {
    icon: Search,
    step: 3,
    title: "Revisamos juntos",
    desc: "Ajustamos copy, colores y detalles en una sola ronda de iteración rápida contigo.",
  },
  {
    icon: Rocket,
    step: 4,
    title: "Publicamos y medimos",
    desc: "Desplegamos en tu dominio con hosting gestionado y dejamos listo el seguimiento de visitas.",
  },
];

export function Process() {
  return (
    <section
      id="proceso"
      aria-labelledby="process-heading"
      className="border-y border-border bg-accent/30 py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 border-border text-muted-foreground">
            Proceso
          </Badge>
          <h2
            id="process-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
            De la idea a la publicación en cuatro pasos claros, sin demoras
            técnicas ni reuniones interminables.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.step}>
                <Card className="h-full rounded-xl border-border shadow-soft">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                      >
                        <Icon className="size-5" />
                      </div>
                      <Badge className="tabular-nums">
                        Paso {item.step}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
