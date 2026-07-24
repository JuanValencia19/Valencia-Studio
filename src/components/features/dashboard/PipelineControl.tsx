"use client";

import { useState, useEffect } from "react";
import { usePipeline } from "@/hooks/usePipeline";
import type { Industry } from "@/types";

interface PipelineControlProps {
  onPipelineComplete: () => void;
}

export function PipelineControl({ onPipelineComplete }: PipelineControlProps) {
  const [city, setCity] = useState("Valencia");
  const [query, setQuery] = useState("dental clinics");
  const [maxResults, setMaxResults] = useState(20);
  const [industryId, setIndustryId] = useState<string>("");
  const [industries, setIndustries] = useState<Industry[]>([]);
  const { running, error, runPipeline } = usePipeline();

  useEffect(() => {
    fetch("/api/industries")
      .then((res) => res.json())
      .then((data) => setIndustries(data))
      .catch(() => {});
  }, []);

  // Auto-fill query from industry search_queries
  function handleIndustryChange(id: string) {
    setIndustryId(id);
    if (id) {
      const industry = industries.find((i) => i.id === id);
      if (industry && industry.search_queries.length > 0) {
        setQuery(industry.search_queries[0]);
      }
    }
  }

  async function handleRun() {
    const runId = await runPipeline({ city, query, maxResults, industryId: industryId || undefined });
    if (runId) {
      onPipelineComplete();
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Ejecutar Pipeline
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Industria
          </label>
          <select
            value={industryId}
            onChange={(e) => handleIndustryChange(e.target.value)}
            disabled={running}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          >
            <option value="">Sin industria</option>
            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.icon} {industry.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={running}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Búsqueda
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={running}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Máximo resultados
          </label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value) || 20)}
            min={1}
            max={100}
            disabled={running}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        onClick={handleRun}
        disabled={running}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {running ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Ejecutando pipeline...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ejecutar Pipeline
          </>
        )}
      </button>
    </div>
  );
}
