"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScoreBreakdownView } from "@/components/features/dashboard/ScoreBreakdown";
import { AuditView } from "@/components/features/dashboard/AuditView";
import { ProposalView } from "@/components/features/dashboard/ProposalView";
import { OutreachTimeline } from "@/components/features/dashboard/OutreachTimeline";
import { ExportPdfButton } from "@/components/features/dashboard/ExportPdfButton";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { ScoreBadge } from "@/components/features/shared/ScoreBadge";
import type { Lead, WebAudit, Proposal, ContactAttempt } from "@/types";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [audit, setAudit] = useState<WebAudit | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [contacts, setContacts] = useState<ContactAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      const res = await fetch(`/api/leads/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        if (data.web_audits?.[0]) setAudit(data.web_audits[0]);
        if (data.proposals?.[0]) setProposal(data.proposals[0]);
      }

      const contactsRes = await fetch(`/api/leads/${params.id}/contacts`);
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData);
      }

      setLoading(false);
    }
    fetchLead();
  }, [params.id]);

  async function handleAudit() {
    setAuditing(true);
    try {
      const res = await fetch(`/api/leads/${params.id}/audit`, {
        method: "POST",
      });
      if (res.ok) {
        const newAudit = await res.json();
        setAudit(newAudit);
      }
    } finally {
      setAuditing(false);
    }
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

  if (!lead) {
    return (
      <div className="py-20 text-center">
        <p className="text-neutral-400">Lead no encontrado.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-violet-400 hover:text-violet-300"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {lead.name}
          </h1>
          <p className="mt-2 text-neutral-400">
            {lead.address || "Sin dirección"}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={lead.status} />
            <ScoreBadge score={lead.opportunity_score} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lead.website_url && (
            <a
              href={lead.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver web
            </a>
          )}

          {lead.website_url && (
            <button
              onClick={handleAudit}
              disabled={auditing}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors"
            >
              {auditing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Auditando...
                </>
              ) : (
                "Auditar web"
              )}
            </button>
          )}

          <ExportPdfButton
            leadId={lead.id}
            leadName={lead.name}
            hasProposal={!!proposal}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          <InfoRow label="Teléfono" value={lead.phone} />
          <InfoRow label="Email" value={lead.email} />
          <InfoRow
            label="Rating Google"
            value={
              lead.google_rating
                ? `${lead.google_rating} (${lead.google_reviews_count} reseñas)`
                : null
            }
          />
          <InfoRow
            label="Instagram"
            value={lead.instagram_url}
            href={lead.instagram_url || undefined}
          />
          <InfoRow
            label="Facebook"
            value={lead.facebook_url}
            href={lead.facebook_url || undefined}
          />
        </div>

        <div className="lg:col-span-2">
          <ScoreBreakdownView
            score={lead.opportunity_score}
            breakdown={lead.score_breakdown}
          />
        </div>
      </div>

      <AuditView audit={audit} />

      <ProposalView
        proposal={proposal}
        leadId={lead.id}
        leadEmail={lead.email}
        leadName={lead.name}
      />

      <OutreachTimeline leadId={lead.id} initialContacts={contacts} />
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null;
  href?: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-900/50 px-4 py-2.5 border border-neutral-800">
      <span className="text-sm text-neutral-400">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-400 hover:text-violet-300 truncate max-w-[200px]"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm text-white truncate max-w-[200px]">
          {value}
        </span>
      )}
    </div>
  );
}
