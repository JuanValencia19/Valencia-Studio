import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
            Valencia Studio
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Landing pages impulsadas por IA para negocios locales
          </p>
          <div className="flex gap-4">
            <Button>Empezar</Button>
            <Button variant="outline">Documentación</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
