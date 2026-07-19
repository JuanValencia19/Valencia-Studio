"use client";

import { useState } from "react";
import { Menu, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type NavLink = { label: string; href: string };

type MobileNavProps = {
  links: ReadonlyArray<NavLink>;
};

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-12 min-w-12 rounded-md text-foreground"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false} className="w-3/4 max-w-xs">
        <SheetHeader className="flex flex-row items-center justify-between pr-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Valencia Studio
          </SheetTitle>
          <SheetClose
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Cerrar menú"
          >
            <XIcon className="size-5" />
          </SheetClose>
        </SheetHeader>
        <Separator />
        <nav className="flex flex-col gap-1 p-4" aria-label="Navegación móvil">
          {links.map((item) => (
            <SheetClose asChild key={item.href}>
              <a
                href={item.href}
                className="flex min-h-12 items-center rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
              </a>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button asChild className="min-h-12 w-full rounded-full">
            <SheetClose asChild>
              <a href="#contacto">Solicitar cotización</a>
            </SheetClose>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}