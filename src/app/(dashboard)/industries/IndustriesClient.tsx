"use client";

import { useState } from "react";
import { IndustryCard } from "@/components/features/dashboard/IndustryCard";
import { IndustryForm } from "@/components/features/dashboard/IndustryForm";
import type { Industry } from "@/types";

interface IndustriesClientProps {
  initialIndustries: Industry[];
}

export function IndustriesClient({ initialIndustries }: IndustriesClientProps) {
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);
  const [showForm, setShowForm] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);

  async function refresh() {
    const res = await fetch("/api/industries");
    if (res.ok) {
      const data = await res.json();
      setIndustries(data);
    }
  }

  function handleEdit(industry: Industry) {
    setEditingIndustry(industry);
    setShowForm(true);
  }

  function handleCancel() {
    setEditingIndustry(null);
    setShowForm(false);
  }

  async function handleSave(data: Partial<Industry>) {
    if (editingIndustry) {
      await fetch(`/api/industries/${editingIndustry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/industries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setEditingIndustry(null);
    setShowForm(false);
    await refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/industries/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Industrias
          </h1>
          <p className="mt-2 text-neutral-400">
            Gestiona las industrias para las que generas leads.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Industria
        </button>
      </div>

      {showForm && (
        <IndustryForm
          initialData={editingIndustry}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {industries.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">
            No hay industrias
          </h3>
          <p className="mt-2 text-sm text-neutral-400">
            Crea tu primera industria para empezar a generar leads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <IndustryCard
              key={industry.id}
              industry={industry}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
