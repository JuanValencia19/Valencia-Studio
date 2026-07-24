"use client";

import { PipelineFunnel } from "@/components/features/dashboard/charts/PipelineFunnel";
import { ScoreDistribution } from "@/components/features/dashboard/charts/ScoreDistribution";
import { IndustryBreakdown } from "@/components/features/dashboard/charts/IndustryBreakdown";
import { OutreachMetrics } from "@/components/features/dashboard/charts/OutreachMetrics";
import type { PipelineFunnelData, ScoreDistributionData, OutreachMetricsData, IndustryStatsData } from "@/lib/analytics/queries";

interface AnalyticsClientProps {
  funnelData: PipelineFunnelData[];
  scoreDistribution: ScoreDistributionData[];
  outreachMetrics: OutreachMetricsData[];
  industryStats: IndustryStatsData[];
}

export function AnalyticsClient({
  funnelData,
  scoreDistribution,
  outreachMetrics,
  industryStats,
}: AnalyticsClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Analytics
        </h1>
        <p className="mt-2 text-neutral-400">
          Insights y métricas de tu pipeline de ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PipelineFunnel data={funnelData} />
        <ScoreDistribution data={scoreDistribution} />
        <IndustryBreakdown data={industryStats} />
        <OutreachMetrics data={outreachMetrics} />
      </div>
    </div>
  );
}
