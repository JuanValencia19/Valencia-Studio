"use client";

import { useState } from "react";
import { StatsCards } from "@/components/features/dashboard/StatsCards";
import { PipelineControl } from "@/components/features/dashboard/PipelineControl";
import { LeadsTable } from "@/components/features/dashboard/LeadsTable";
import type { Lead } from "@/types";

interface DashboardClientProps {
  initialLeads: Lead[];
  initialTotal: number;
}

export function DashboardClient({
  initialLeads,
  initialTotal,
}: DashboardClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [total, setTotal] = useState(initialTotal);

  async function refresh() {
    const res = await fetch("/api/leads?limit=50");
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    }
  }

  const highPriority = leads.filter(
    (l) => l.opportunity_score && l.opportunity_score >= 80
  ).length;

  const scoredLeads = leads.filter((l) => l.opportunity_score !== null);
  const avgScore =
    scoredLeads.length > 0
      ? Math.round(
          scoredLeads.reduce(
            (sum, l) => sum + (l.opportunity_score || 0),
            0
          ) / scoredLeads.length
        )
      : 0;

  const proposalsReady = leads.filter(
    (l) => l.status === "proposal_ready"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-neutral-400">
          Gestiona tus oportunidades de negocio.
        </p>
      </div>

      <StatsCards
        totalLeads={total}
        highPriority={highPriority}
        avgScore={avgScore}
        proposalsReady={proposalsReady}
      />

      <PipelineControl onPipelineComplete={refresh} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Leads ({total})
          </h2>
        </div>

        <LeadsTable leads={leads} />
      </div>
    </div>
  );
}
