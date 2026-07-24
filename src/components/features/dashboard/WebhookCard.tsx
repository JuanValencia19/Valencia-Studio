"use client";

import { Webhook } from "@/types";
import { ExternalLink, Trash2, Edit, Eye } from "lucide-react";

interface WebhookCardProps {
  webhook: Webhook;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (isActive: boolean) => void;
  onViewDeliveries: () => void;
}

export function WebhookCard({
  webhook,
  isSelected,
  onEdit,
  onDelete,
  onToggle,
  onViewDeliveries,
}: WebhookCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isSelected
          ? "border-violet-500 bg-violet-500/10"
          : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white truncate">{webhook.name}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                webhook.is_active
                  ? "bg-green-500/20 text-green-400"
                  : "bg-neutral-500/20 text-neutral-400"
              }`}
            >
              {webhook.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400 truncate">{webhook.url}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {webhook.events.map((event) => (
              <span
                key={event}
                className="inline-flex items-center rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300"
              >
                {event}
              </span>
            ))}
          </div>
          {webhook.last_triggered_at && (
            <p className="mt-2 text-xs text-neutral-500">
              Último envío: {new Date(webhook.last_triggered_at).toLocaleString()}
              {webhook.last_status_code && ` (${webhook.last_status_code})`}
            </p>
          )}
          {webhook.failure_count > 0 && (
            <p className="mt-1 text-xs text-red-400">
              {webhook.failure_count} fallos consecutivos
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onToggle(!webhook.is_active)}
            className={`rounded p-1.5 transition-colors ${
              webhook.is_active
                ? "text-green-400 hover:bg-green-500/20"
                : "text-neutral-500 hover:bg-neutral-700"
            }`}
            title={webhook.is_active ? "Desactivar" : "Activar"}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
          <button
            onClick={onViewDeliveries}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            title="Ver entregas"
          >
            <Eye className="h-4 w-4" />
          </button>
          <a
            href={webhook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            title="Abrir URL"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={onEdit}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-neutral-400 hover:bg-red-500/20 hover:text-red-400"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
