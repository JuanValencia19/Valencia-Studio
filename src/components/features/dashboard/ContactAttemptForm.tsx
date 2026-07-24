"use client";

import { useState } from "react";
import type { ContactAttempt } from "@/types";

interface ContactAttemptFormProps {
  onSave: (data: Partial<ContactAttempt>) => Promise<void>;
  onCancel: () => void;
}

export function ContactAttemptForm({ onSave, onCancel }: ContactAttemptFormProps) {
  const [contactType, setContactType] = useState<ContactAttempt["contact_type"]>("email");
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState("");
  const [status, setStatus] = useState<ContactAttempt["status"]>("sent");
  const [sentiment, setSentiment] = useState<ContactAttempt["sentiment"]>(null);
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await onSave({
      contact_type: contactType,
      message: message || undefined,
      outcome: outcome || undefined,
      status,
      sentiment: sentiment || undefined,
      next_action: nextAction || undefined,
      next_action_date: nextActionDate || undefined,
    });

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Tipo de contacto
          </label>
          <select
            value={contactType}
            onChange={(e) => setContactType(e.target.value as ContactAttempt["contact_type"])}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="email">Email</option>
            <option value="phone">Teléfono</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="linkedin">LinkedIn</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContactAttempt["status"])}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="pending">Pendiente</option>
            <option value="sent">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="opened">Abierto</option>
            <option value="replied">Respondido</option>
            <option value="bounced">Rebotado</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-neutral-400 mb-1">
          Mensaje
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Describe el mensaje enviado..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Resultado
          </label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="ej: Interesado, No contestó..."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Sentimiento
          </label>
          <select
            value={sentiment || ""}
            onChange={(e) => setSentiment(e.target.value as ContactAttempt["sentiment"])}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Sin especificar</option>
            <option value="positive">Positivo</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negativo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Próxima acción
          </label>
          <input
            type="text"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="ej: Llamar en 3 días..."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Fecha próxima acción
          </label>
          <input
            type="date"
            value={nextActionDate}
            onChange={(e) => setNextActionDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : "Registrar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
