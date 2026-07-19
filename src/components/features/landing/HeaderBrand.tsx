import { Sparkles } from "lucide-react";

import { MobileNav } from "@/components/features/landing/MobileNav";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";

// COPY DIRECTION: anchor labels are kebab English ids; visible labels are es_CO.
const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Showcase", href: "#showcase" },
  { label: "Proceso", href: "#proceso" },
  { label: "FAQ", href: "#faq" },
];

export function HeaderBrand() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
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

          <nav
            className="hidden md:flex md:items-center md:gap-6"
            aria-label="Navegación principal"
          >
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                {NAV_LINKS.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <Button asChild size="default" className="min-h-12 rounded-full">
              <a href="#contacto">Solicitar cotización</a>
            </Button>
          </nav>

          <div className="md:hidden">
            <MobileNav links={NAV_LINKS} />
          </div>
        </div>
      </header>
      <Separator className="hidden" />
    </>
  );
}
