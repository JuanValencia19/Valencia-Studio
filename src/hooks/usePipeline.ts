"use client";

import { useState } from "react";

interface UsePipelineReturn {
  running: boolean;
  error: string | null;
  runPipeline: (config?: PipelineConfig) => Promise<string | null>;
}

interface PipelineConfig {
  city?: string;
  query?: string;
  maxResults?: number;
  industryId?: string;
  location?: string;
  radius?: number;
  placeType?: string;
  queries?: string[];
}

export function usePipeline(): UsePipelineReturn {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runPipeline(config?: PipelineConfig): Promise<string | null> {
    setRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: config?.city || "Valencia",
          query: config?.query || "dental clinics",
          maxResults: config?.maxResults || 20,
          industryId: config?.industryId || undefined,
          location: config?.location || undefined,
          radius: config?.radius || undefined,
          placeType: config?.placeType || undefined,
          queries: config?.queries || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Pipeline failed");
      }

      const data = await response.json();
      return data.runId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setRunning(false);
    }
  }

  return { running, error, runPipeline };
}
