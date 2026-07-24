"use client";

import { ScoreBadge } from "@/components/features/shared/ScoreBadge";
import type { ScoreBreakdown } from "@/types";

interface ScoreBreakdownProps {
  score: number | null;
  breakdown: ScoreBreakdown | null;
}

export function ScoreBreakdownView({ score, breakdown }: ScoreBreakdownProps) {
  if (!breakdown) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">Opportunity Score</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Aún no hay datos de scoring disponibles.
        </p>
      </div>
    );
  }

  const categories = [
    {
      name: "Presencia Digital",
      score: breakdown.digitalPresence,
      max: 25,
      color: "bg-blue-500",
    },
    {
      name: "Calidad Web",
      score: breakdown.websiteQuality,
      max: 25,
      color: "bg-emerald-500",
    },
    {
      name: "Potencial Conversión",
      score: breakdown.conversionPotential,
      max: 25,
      color: "bg-violet-500",
    },
    {
      name: "Oportunidad Mercado",
      score: breakdown.marketOpportunity,
      max: 25,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Opportunity Score</h3>
        <ScoreBadge score={score} />
      </div>

      <div className="mt-4 space-y-3">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">{cat.name}</span>
              <span className="font-medium text-white">
                {cat.score}/{cat.max}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-neutral-800">
              <div
                className={`h-full rounded-full ${cat.color} transition-all`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
