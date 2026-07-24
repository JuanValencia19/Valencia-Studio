"use client";

import { useState } from "react";
import { ContactAttemptForm } from "./ContactAttemptForm";
import type { ContactAttempt } from "@/types";

interface OutreachTimelineProps {
  leadId: string;
  initialContacts: ContactAttempt[];
}

const contactTypeLabels: Record<string, string> = {
  email: "Email",
  phone: "Teléfono",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  other: "Otro",
};

const contactTypeIcons: Record<string, string> = {
  email: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  other: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  sent: "bg-blue-500/10 text-blue-400",
  delivered: "bg-green-500/10 text-green-400",
  opened: "bg-purple-500/10 text-purple-400",
  replied: "bg-emerald-500/10 text-emerald-400",
  bounced: "bg-red-500/10 text-red-400",
};

export function OutreachTimeline({ leadId, initialContacts }: OutreachTimelineProps) {
  const [contacts, setContacts] = useState<ContactAttempt[]>(initialContacts);
  const [showForm, setShowForm] = useState(false);

  async function fetchContacts() {
    const res = await fetch(`/api/leads/${leadId}/contacts`);
    if (res.ok) {
      const data = await res.json();
      setContacts(data);
    }
  }

  async function handleCreate(data: Partial<ContactAttempt>) {
    await fetch(`/api/leads/${leadId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    await fetchContacts();
  }

  async function handleUpdate(id: string, data: Partial<ContactAttempt>) {
    await fetch(`/api/leads/${leadId}/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchContacts();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/leads/${leadId}/contacts/${id}`, {
      method: "DELETE",
    });
    await fetchContacts();
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Historial de Contactos
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar contacto
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ContactAttemptForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {contacts.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No hay contactos registrados aún.
        </p>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-start gap-4 rounded-lg border border-neutral-800 bg-neutral-800/30 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
                <svg className="h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d={contactTypeIcons[contact.contact_type] || contactTypeIcons.other} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {contactTypeLabels[contact.contact_type] || contact.contact_type}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[contact.status] || "bg-neutral-500/10 text-neutral-400"}`}>
                    {contact.status}
                  </span>
                  {contact.sentiment && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      contact.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400" :
                      contact.sentiment === "negative" ? "bg-red-500/10 text-red-400" :
                      "bg-neutral-500/10 text-neutral-400"
                    }`}>
                      {contact.sentiment}
                    </span>
                  )}
                </div>
                {contact.message && (
                  <p className="mt-1 text-sm text-neutral-400 line-clamp-2">
                    {contact.message}
                  </p>
                )}
                {contact.outcome && (
                  <p className="mt-1 text-xs text-neutral-500">
                    Resultado: {contact.outcome}
                  </p>
                )}
                {contact.response_summary && (
                  <p className="mt-1 text-xs text-emerald-400">
                    Respuesta: {contact.response_summary}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral-600">
                  {new Date(contact.created_at).toLocaleString("es-ES")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUpdate(contact.id, { response_received: true })}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-700 hover:text-white transition-colors"
                  title="Marcar como respondido"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-700 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
