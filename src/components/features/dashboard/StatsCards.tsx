"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, BarChart3, FileText } from "lucide-react";

interface StatsCardsProps {
  totalLeads: number;
  highPriority: number;
  avgScore: number;
  proposalsReady: number;
}

export function StatsCards({
  totalLeads,
  highPriority,
  avgScore,
  proposalsReady,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Total Leads
          </CardTitle>
          <Users className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalLeads}</div>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Alta Prioridad
          </CardTitle>
          <Target className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-400">
            {highPriority}
          </div>
          <p className="text-xs text-neutral-500">Score &gt; 80</p>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Score Promedio
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{avgScore}</div>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">
            Propuestas Listas
          </CardTitle>
          <FileText className="h-4 w-4 text-neutral-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-violet-400">
            {proposalsReady}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
