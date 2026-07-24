"use client";

import { useState } from "react";
import type { Proposal } from "@/types";

interface SendEmailDialogProps {
  leadId: string;
  proposal: Proposal;
  leadEmail: string | null;
  leadName: string;
  onSent: () => void;
  onCancel: () => void;
}

export function SendEmailDialog({
  leadId,
  proposal,
  leadEmail,
  leadName,
  onSent,
  onCancel,
}: SendEmailDialogProps) {
  const [email, setEmail] = useState(leadEmail || "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!email) {
      setError("Ingresa un email válido");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          to: email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar email");
      }

      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar email");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white">
          Enviar propuesta por email
        </h3>
        <p className="mt-1 text-sm text-neutral-400">
          Enviar propuesta a {leadName}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Email del destinatario
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-800/50 p-3">
          <p className="text-xs font-medium text-neutral-400">Asunto:</p>
          <p className="text-sm text-white">{proposal.subject}</p>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !email}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
