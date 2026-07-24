"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { PipelineFunnelData } from "@/lib/analytics/queries";

interface PipelineFunnelProps {
  data: PipelineFunnelData[];
}

const statusColors: Record<string, string> = {
  discovered: "#a78bfa",
  researched: "#818cf8",
  audited: "#6366f1",
  scored: "#4f46e5",
  proposal_ready: "#7c3aed",
  contacted: "#2563eb",
  qualified: "#10b981",
  converted: "#059669",
  rejected: "#ef4444",
};

const statusLabels: Record<string, string> = {
  discovered: "Descubierto",
  researched: "Investigado",
  audited: "Auditado",
  scored: "Puntuado",
  proposal_ready: "Propuesta",
  contacted: "Contactado",
  converted: "Convertido",
  rejected: "Rechazado",
};

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    fill: statusColors[item.status] || "#6b7280",
  }));

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Pipeline Funnel
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis type="number" stroke="#737373" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="#737373" fontSize={12} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#a3a3a3" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
