import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const scoreVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        high: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
        medium: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
        low: "bg-neutral-500/10 text-neutral-400 ring-1 ring-neutral-500/20",
      },
    },
    defaultVariants: {
      variant: "low",
    },
  }
);

interface ScoreBadgeProps extends VariantProps<typeof scoreVariants> {
  score: number | null;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-500/10 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
        —
      </span>
    );
  }

  const variant = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

  return (
    <span className={cn(scoreVariants({ variant }), className)}>
      {score}
    </span>
  );
}
