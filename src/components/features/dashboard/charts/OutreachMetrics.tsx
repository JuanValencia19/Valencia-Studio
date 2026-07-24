"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { OutreachMetricsData } from "@/lib/analytics/queries";

interface OutreachMetricsProps {
  data: OutreachMetricsData[];
}

export function OutreachMetrics({ data }: OutreachMetricsProps) {
  const chartData = data.map((item) => ({
    name: new Date(item.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    contactos: item.total_contacts,
    respuestas: item.replies,
    positivos: item.positive,
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Métricas de Outreach
        </h3>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-neutral-500">No hay datos de contacto aún</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Métricas de Outreach
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="name" stroke="#737373" fontSize={12} />
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
            <Legend />
            <Line type="monotone" dataKey="contactos" stroke="#7c3aed" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="respuestas" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="positivos" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
