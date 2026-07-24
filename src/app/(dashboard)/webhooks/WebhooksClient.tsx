"use client";

import { useState, useEffect } from "react";
import { Webhook, WebhookDelivery, WebhookEvent } from "@/types";
import { WebhookForm } from "@/components/features/dashboard/WebhookForm";
import { WebhookCard } from "@/components/features/dashboard/WebhookCard";

const AVAILABLE_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: "lead.created", label: "Lead creado" },
  { value: "lead.scored", label: "Lead scoreado" },
  { value: "lead.audited", label: "Lead auditado" },
  { value: "lead.proposal_ready", label: "Propuesta lista" },
  { value: "lead.contacted", label: "Lead contactado" },
  { value: "lead.converted", label: "Lead convertido" },
  { value: "pipeline.completed", label: "Pipeline completado" },
];

export function WebhooksClient() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  async function fetchWebhooks() {
    try {
      const res = await fetch("/api/webhooks");
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeliveries(webhookId: string) {
    setLoadingDeliveries(true);
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/deliveries`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } finally {
      setLoadingDeliveries(false);
    }
  }

  useEffect(() => {
    fetchWebhooks();
  }, []);

  async function handleCreate(data: {
    name: string;
    url: string;
    events: WebhookEvent[];
  }) {
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const webhook = await res.json();
      setWebhooks([webhook, ...webhooks]);
      setShowForm(false);
    }
  }

  async function handleUpdate(
    id: string,
    data: { name: string; url: string; events: WebhookEvent[]; is_active: boolean }
  ) {
    const res = await fetch(`/api/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const updated = await res.json();
      setWebhooks(webhooks.map((w) => (w.id === id ? updated : w)));
      setEditingWebhook(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este webhook?")) return;

    const res = await fetch(`/api/webhooks/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setWebhooks(webhooks.filter((w) => w.id !== id));
      if (selectedWebhook?.id === id) {
        setSelectedWebhook(null);
        setDeliveries([]);
      }
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    const webhook = webhooks.find((w) => w.id === id);
    if (!webhook) return;

    await handleUpdate(id, {
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      is_active: isActive,
    });
  }

  function handleViewDeliveries(webhook: Webhook) {
    setSelectedWebhook(webhook);
    fetchDeliveries(webhook.id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-8 w-8 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Configura notificaciones para integraciones externas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Crear webhook
        </button>
      </div>

      {showForm && (
        <WebhookForm
          availableEvents={AVAILABLE_EVENTS}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingWebhook && (
        <WebhookForm
          availableEvents={AVAILABLE_EVENTS}
          webhook={editingWebhook}
          onSubmit={(data) =>
            handleUpdate(editingWebhook.id, {
              ...data,
              is_active: editingWebhook.is_active,
            })
          }
          onCancel={() => setEditingWebhook(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Webhooks ({webhooks.length})
          </h2>

          {webhooks.length === 0 ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
              <p className="text-neutral-400">
                No hay webhooks configurados
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Crea uno para recibir notificaciones de eventos
              </p>
            </div>
          ) : (
            webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                isSelected={selectedWebhook?.id === webhook.id}
                onEdit={() => setEditingWebhook(webhook)}
                onDelete={() => handleDelete(webhook.id)}
                onToggle={(isActive) => handleToggle(webhook.id, isActive)}
                onViewDeliveries={() => handleViewDeliveries(webhook)}
              />
            ))
          )}
        </div>

        <div>
          {selectedWebhook ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Entregas - {selectedWebhook.name}
              </h2>

              {loadingDeliveries ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="h-6 w-6 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : deliveries.length === 0 ? (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
                  <p className="text-neutral-400">No hay entregas registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {delivery.event}
                        </span>
                        <span
                          className={`text-xs ${
                            delivery.status_code && delivery.status_code < 400
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {delivery.status_code || "Error"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {new Date(delivery.created_at).toLocaleString()}
                        {delivery.duration_ms && ` • ${delivery.duration_ms}ms`}
                      </p>
                      {delivery.error_message && (
                        <p className="mt-2 text-xs text-red-400">
                          {delivery.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
              <p className="text-neutral-400">
                Selecciona un webhook para ver sus entregas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
