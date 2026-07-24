"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { IndustryStatsData } from "@/lib/analytics/queries";

interface IndustryBreakdownProps {
  data: IndustryStatsData[];
}

const COLORS = ["#7c3aed", "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function IndustryBreakdown({ data }: IndustryBreakdownProps) {
  const chartData = data
    .filter((item) => item.total_leads > 0)
    .map((item) => ({
      name: `${item.icon || ""} ${item.name}`.trim(),
      value: item.total_leads,
      avgScore: item.avg_score,
    }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Leads por Industria
        </h3>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-neutral-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Leads por Industria
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#a3a3a3" }}
              formatter={(value: unknown, _name: unknown, props: { payload?: { avgScore?: number | null } }) => [
                `${value} leads (avg: ${props.payload?.avgScore || "N/A"})`,
                "Leads",
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
