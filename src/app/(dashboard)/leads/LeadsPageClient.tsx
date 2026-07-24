"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeadsTable } from "@/components/features/dashboard/LeadsTable";
import type { Lead } from "@/types";

interface LeadsPageClientProps {
  initialLeads: Lead[];
  initialTotal: number;
  initialTotalPages: number;
  initialPage: number;
  initialSearch: string;
  initialStatus: string;
}

export function LeadsPageClient({
  initialLeads,
  initialTotal,
  initialTotalPages,
  initialPage,
  initialSearch,
  initialStatus,
}: LeadsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/leads?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Leads</h1>
        <p className="mt-2 text-neutral-400">
          {initialTotal} leads encontrados
        </p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams("search", search);
          }}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updateParams("status", e.target.value);
          }}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">Todos los estados</option>
          <option value="discovered">Descubierto</option>
          <option value="researched">Investigado</option>
          <option value="audited">Auditado</option>
          <option value="scored">Puntuado</option>
          <option value="proposal_ready">Propuesta lista</option>
          <option value="contacted">Contactado</option>
          <option value="converted">Convertido</option>
        </select>
      </div>

      <LeadsTable leads={initialLeads} />

      {initialTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {initialPage > 1 && (
            <a
              href={`/leads?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(initialPage - 1) }).toString()}`}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              Anterior
            </a>
          )}
          <span className="text-sm text-neutral-400">
            Página {initialPage} de {initialTotalPages}
          </span>
          {initialPage < initialTotalPages && (
            <a
              href={`/leads?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(initialPage + 1) }).toString()}`}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              Siguiente
            </a>
          )}
        </div>
      )}
    </div>
  );
}
