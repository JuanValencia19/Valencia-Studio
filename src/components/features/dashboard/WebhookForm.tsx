"use client";

import { useState } from "react";
import { Webhook, WebhookEvent } from "@/types";

interface WebhookFormProps {
  availableEvents: { value: WebhookEvent; label: string }[];
  webhook?: Webhook;
  onSubmit: (data: {
    name: string;
    url: string;
    events: WebhookEvent[];
  }) => void;
  onCancel: () => void;
}

export function WebhookForm({
  availableEvents,
  webhook,
  onSubmit,
  onCancel,
}: WebhookFormProps) {
  const [name, setName] = useState(webhook?.name || "");
  const [url, setUrl] = useState(webhook?.url || "");
  const [events, setEvents] = useState<WebhookEvent[]>(
    webhook?.events || []
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !url || events.length === 0) return;
    onSubmit({ name, url, events });
  }

  function toggleEvent(event: WebhookEvent) {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6"
    >
      <h3 className="mb-4 text-lg font-semibold text-white">
        {webhook ? "Editar webhook" : "Nuevo webhook"}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none"
            placeholder="Mi webhook"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none"
            placeholder="https://example.com/webhook"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Eventos
          </label>
          <div className="flex flex-wrap gap-2">
            {availableEvents.map((event) => (
              <button
                key={event.value}
                type="button"
                onClick={() => toggleEvent(event.value)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  events.includes(event.value)
                    ? "bg-violet-600 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {event.label}
              </button>
            ))}
          </div>
          {events.length === 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              Selecciona al menos un evento
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={!name || !url || events.length === 0}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {webhook ? "Guardar cambios" : "Crear webhook"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
