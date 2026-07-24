"use client";

import { useState } from "react";
import { SendEmailDialog } from "./SendEmailDialog";
import type { Proposal } from "@/types";

interface ProposalViewProps {
  proposal: Proposal | null;
  leadId: string;
  leadEmail: string | null;
  leadName: string;
}

export function ProposalView({ proposal, leadId, leadEmail, leadName }: ProposalViewProps) {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sent, setSent] = useState(proposal?.is_sent || false);

  if (!proposal) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">
          Propuesta
        </h3>
        <p className="mt-2 text-sm text-neutral-400">
          No hay propuesta generada para este lead.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Propuesta</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/20">
              {proposal.status}
            </span>
            {!sent && proposal.status === "draft" && (
              <button
                onClick={() => setShowSendDialog(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar
              </button>
            )}
            {sent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enviado
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Asunto</p>
            <p className="text-sm font-medium text-white">
              {proposal.subject}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-1">Servicio Propuesto</p>
            <p className="text-sm text-neutral-300">
              {proposal.proposed_service}
            </p>
          </div>

          {proposal.proposed_price_range && (
            <div>
              <p className="text-xs text-neutral-500 mb-1">Rango de Precio</p>
              <p className="text-sm text-neutral-300">
                {proposal.proposed_price_range}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-neutral-500 mb-1">Cuerpo del Email</p>
            <div className="mt-1 rounded-lg bg-neutral-800/50 p-4">
              <p className="whitespace-pre-wrap text-sm text-neutral-300 leading-relaxed">
                {proposal.body}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>Modelo: {proposal.model_used}</span>
            {proposal.generation_cost && (
              <span>Costo: ${proposal.generation_cost.toFixed(4)}</span>
            )}
          </div>
        </div>
      </div>

      {showSendDialog && (
        <SendEmailDialog
          leadId={leadId}
          proposal={proposal}
          leadEmail={leadEmail}
          leadName={leadName}
          onSent={() => {
            setSent(true);
            setShowSendDialog(false);
          }}
          onCancel={() => setShowSendDialog(false)}
        />
      )}
    </>
  );
}
