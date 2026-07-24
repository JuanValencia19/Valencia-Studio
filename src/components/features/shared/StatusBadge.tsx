import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const statusConfig: Record<
  LeadStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  discovered: { label: "Descubierto", variant: "secondary" },
  researched: { label: "Investigado", variant: "secondary" },
  audited: { label: "Auditado", variant: "secondary" },
  scored: { label: "Puntuado", variant: "default" },
  proposal_ready: { label: "Propuesta lista", variant: "default" },
  contacted: { label: "Contactado", variant: "outline" },
  qualified: { label: "Calificado", variant: "default" },
  rejected: { label: "Rechazado", variant: "destructive" },
  converted: { label: "Convertido", variant: "default" },
};

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
        secondary:
          "bg-neutral-500/10 text-neutral-400 ring-1 ring-neutral-500/20",
        outline:
          "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
        destructive:
          "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn(badgeVariants({ variant: config.variant }), className)}>
      {config.label}
    </span>
  );
}
