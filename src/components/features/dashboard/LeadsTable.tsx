"use client";

import Link from "next/link";
import { ScoreBadge } from "@/components/features/shared/ScoreBadge";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import type { Lead } from "@/types";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-white">
          No hay leads aún
        </h3>
        <p className="mt-2 text-sm text-neutral-400">
          Ejecuta el pipeline para descubrir clínicas dentales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Industria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Reseñas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Website
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-400">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-neutral-800/50 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {lead.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                      {lead.address || "Sin dirección"}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {lead.industries ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                      {lead.industries.icon} {lead.industries.name}
                    </span>
                  ) : (
                    <span className="text-sm text-neutral-500">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <ScoreBadge score={lead.opportunity_score} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-300">
                  {lead.google_rating ? (
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {lead.google_rating}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-300">
                  {lead.google_reviews_count || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {lead.website_url ? (
                    <a
                      href={lead.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-violet-400 hover:text-violet-300"
                    >
                      Abrir
                    </a>
                  ) : (
                    <span className="text-sm text-neutral-500">Sin web</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
