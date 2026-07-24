"use client";

import type { ContactStatus } from "@/types";

interface ContactStatusBadgeProps {
  status: ContactStatus;
}

const statusConfig: Record<ContactStatus, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-400",
  },
  sent: {
    label: "Enviado",
    className: "bg-blue-500/10 text-blue-400",
  },
  delivered: {
    label: "Entregado",
    className: "bg-green-500/10 text-green-400",
  },
  opened: {
    label: "Abierto",
    className: "bg-purple-500/10 text-purple-400",
  },
  replied: {
    label: "Respondido",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  bounced: {
    label: "Rebotado",
    className: "bg-red-500/10 text-red-400",
  },
};

export function ContactStatusBadge({ status }: ContactStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
