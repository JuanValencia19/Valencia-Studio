"use client";

import type { Industry } from "@/types";

interface IndustryCardProps {
  industry: Industry;
  onEdit: (industry: Industry) => void;
  onDelete: (id: string) => void;
}

export function IndustryCard({ industry, onEdit, onDelete }: IndustryCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{industry.icon || "📊"}</span>
          <div>
            <h3 className="font-semibold text-white">{industry.name}</h3>
            <p className="text-sm text-neutral-500">
              {industry.leads_count} leads ·{" "}
              {industry.avg_score ? `${industry.avg_score} avg` : "Sin datos"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(industry)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(industry.id)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Queries de búsqueda
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {industry.search_queries.slice(0, 3).map((query, i) => (
            <span
              key={i}
              className="inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
            >
              {query}
            </span>
          ))}
          {industry.search_queries.length > 3 && (
            <span className="inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
              +{industry.search_queries.length - 3} más
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            industry.status === "active"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-neutral-500/10 text-neutral-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              industry.status === "active" ? "bg-emerald-400" : "bg-neutral-400"
            }`}
          />
          {industry.status === "active" ? "Activa" : "Archivada"}
        </span>
      </div>
    </div>
  );
}
