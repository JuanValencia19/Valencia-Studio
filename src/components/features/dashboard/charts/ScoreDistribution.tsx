"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ScoreDistributionData } from "@/lib/analytics/queries";

interface ScoreDistributionProps {
  data: ScoreDistributionData[];
}

const rangeColors = [
  "#059669",
  "#10b981",
  "#34d399",
  "#fbbf24",
  "#f59e0b",
  "#ef4444",
];

export function ScoreDistribution({ data }: ScoreDistributionProps) {
  const chartData = data.map((item, index) => ({
    name: item.range,
    value: item.count,
    fill: rangeColors[index] || "#6b7280",
  }));

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Distribución de Scores
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#737373" fontSize={10} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#a3a3a3" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
