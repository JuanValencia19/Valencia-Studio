import { Sparkles, type LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// COPY DIRECTION:
//   heading         — es_CO, credibility framing, no fabricated proof.
//   founderInitials — honest (founder's real initials), NO fake photo.
//   founderBio      — 2-3 sentences, es_CO, names what the founder does.
//   disclosure      — FIXED direction: "en construcción / early-stage".
// Prohibited: invented client quotes, fake ratings, fabricated logos,
// "cientos de clientes", "proyectos exitosos" metrics or any unverifiable claim.

type ProofPillar = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const PILLARS: ReadonlyArray<ProofPillar> = [
  {
    icon: Sparkles,
    title: "Stack real y moderno",
    desc: "Next.js, TypeScript, Tailwind y Supabase — las mismas herramientas que usan productos en producción.",
  },
  {
    icon: Sparkles,
    title: "Proceso transparente",
    desc: "Cuatro pasos claros, brief breve y una sola ronda de iteración. Sin cajas negras ni sorpresas.",
  },
  {
    icon: Sparkles,
    title: "Timeline honesta",
    desc: "Entregamos en días cuando el brief está claro. Si algo lo pone en riesgo, te lo decimos antes de empezar.",
  },
];

export function HonestProof() {
  return (
    <section
      aria-labelledby="proof-heading"
      className="py-20 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="proof-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Por qué confiar en Valencia Studio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
            Somos un estudio early-stage. En vez de inventar cifras o
            testimonios, te decimos exactamente qué hay y qué no.
          </p>
        </div>

        <Card className="mx-auto mt-12 max-w-3xl rounded-xl border-border shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-12 bg-primary text-primary-foreground">
                <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                  JV
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Juan Valencia
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fundador · Valencia Studio
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Llevo años construyendo software — elegí empezar Valencia Studio
              para que los negocios locales de Colombia tengan landings premium
              sin pagar agencia grande ni esperar meses. Trabajo directo
              contigo: yo escribo el brief, yo genero la primera versión con IA
              y yo despacho los ajustes.
            </p>
            <p>
              Hoy el estudio está <strong className="font-medium text-foreground">en
              construcción</strong>: las plantillas del showcase son maquetas y
              todavía no tenemos casos públicos que mostrarte. Cuando existan,
              aparecerán aquí con nombre real y datos verificables.
            </p>
          </CardContent>
        </Card>

        <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title}>
                <Card className="h-full rounded-xl border-border shadow-soft">
                  <CardHeader>
                    <div
                      aria-hidden="true"
                      className="flex size-11 items-center justify-center rounded-lg border border-border bg-accent text-accent-foreground"
                    >
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>

        <Separator className="mx-auto mt-16 max-w-5xl" />
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-muted-foreground">
          Sin reseñas inventadas · sin métricas fabricadas · sin logos de
          clientes falsos. Si algo no podemos probar, no lo decimos.
        </p>
      </div>
    </section>
  );
}
