"use client";

import { useState } from "react";
import type { Industry } from "@/types";

interface IndustryFormProps {
  initialData: Industry | null;
  onSave: (data: Partial<Industry>) => Promise<void>;
  onCancel: () => void;
}

export function IndustryForm({ initialData, onSave, onCancel }: IndustryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [searchQueries, setSearchQueries] = useState(
    initialData?.search_queries.join("\n") || ""
  );
  const [prospectingPrompt, setProspectingPrompt] = useState(
    initialData?.prospecting_prompt || ""
  );
  const [researchPrompt, setResearchPrompt] = useState(
    initialData?.research_prompt || ""
  );
  const [proposalTemplate, setProposalTemplate] = useState(
    initialData?.proposal_template || ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const queries = searchQueries
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    await onSave({
      name,
      icon: icon || null,
      search_queries: queries,
      prospecting_prompt: prospectingPrompt || null,
      research_prompt: researchPrompt || null,
      proposal_template: proposalTemplate || null,
    });

    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
    >
      <h3 className="mb-4 text-lg font-semibold text-white">
        {initialData ? "Editar Industria" : "Nueva Industria"}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="ej: Clínicas Dentales"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Icono (emoji)
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🦷"
            maxLength={10}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          Queries de búsqueda (una por línea) *
        </label>
        <textarea
          value={searchQueries}
          onChange={(e) => setSearchQueries(e.target.value)}
          required
          rows={3}
          placeholder={"dentistas en Valencia\nclínicas dentales Valencia\ndentista Valencia ciudad"}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          Prompt de prospección (opcional)
        </label>
        <textarea
          value={prospectingPrompt}
          onChange={(e) => setProspectingPrompt(e.target.value)}
          rows={2}
          placeholder="Personaliza cómo buscar leads para esta industria..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          Prompt de investigación (opcional)
        </label>
        <textarea
          value={researchPrompt}
          onChange={(e) => setResearchPrompt(e.target.value)}
          rows={2}
          placeholder="Personaliza cómo investigar leads para esta industria..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          Template de propuesta (opcional)
        </label>
        <textarea
          value={proposalTemplate}
          onChange={(e) => setProposalTemplate(e.target.value)}
          rows={3}
          placeholder="Personaliza el template del email de propuesta para esta industria..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : initialData ? "Guardar cambios" : "Crear industria"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
