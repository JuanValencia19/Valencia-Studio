"use client";

import type { WebAudit } from "@/types";

interface AuditViewProps {
  audit: WebAudit | null;
}

export function AuditView({ audit }: AuditViewProps) {
  if (!audit) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">
          Auditoría Web
        </h3>
        <p className="mt-2 text-sm text-neutral-400">
          No hay auditoría disponible para este lead.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">Auditoría Web</h3>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <ScoreCard
            label="Mobile"
            score={audit.pagespeed_mobile_score}
            color="text-emerald-400"
          />
          <ScoreCard
            label="Desktop"
            score={audit.pagespeed_desktop_score}
            color="text-emerald-400"
          />
          <ScoreCard
            label="SEO"
            score={audit.seo_score}
            color="text-blue-400"
          />
          <ScoreCard
            label="UX"
            score={audit.ux_score}
            color="text-violet-400"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <ScoreCard
            label="Contenido"
            score={audit.content_score}
            color="text-amber-400"
          />
          <ScoreCard
            label="Conversión"
            score={audit.conversion_score}
            color="text-rose-400"
          />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">
          Core Web Vitals
        </h4>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <MetricCard label="FCP" value={audit.first_contentful_paint} />
          <MetricCard label="LCP" value={audit.largest_contentful_paint} />
          <MetricCard label="TBT" value={audit.total_blocking_time} />
          <MetricCard label="CLS" value={audit.cumulative_layout_shift} />
          <MetricCard label="SI" value={audit.speed_index} />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">
          Análisis SEO
        </h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <BooleanBadge
            label="Meta Description"
            value={audit.has_meta_description}
          />
          <BooleanBadge label="OG Tags" value={audit.has_og_tags} />
          <BooleanBadge label="Sitemap" value={audit.has_sitemap} />
          <BooleanBadge label="Robots.txt" value={audit.has_robots_txt} />
          <BooleanBadge label="SSL" value={audit.has_ssl} />
          <BooleanBadge
            label="Mobile Friendly"
            value={audit.mobile_friendly}
          />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h4 className="text-sm font-medium text-neutral-400 mb-3">
          Análisis UX
        </h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <BooleanBadge
            label="CTA Above Fold"
            value={audit.has_cta_above_fold}
          />
          <BooleanBadge
            label="Testimonios"
            value={audit.has_testimonials}
          />
          <BooleanBadge
            label="Formulario"
            value={audit.has_contact_form}
          />
          <BooleanBadge
            label="WhatsApp"
            value={audit.has_whatsapp_button}
          />
          <BooleanBadge
            label="Reservas Online"
            value={audit.has_online_booking}
          />
          <BooleanBadge
            label="Responsive"
            value={audit.responsive_design}
          />
        </div>
      </div>

      {audit.ai_summary && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h4 className="text-sm font-medium text-neutral-400 mb-3">
            Resumen IA
          </h4>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {audit.ai_summary}
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  score,
  color,
}: {
  label: string;
  score: number | null;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-neutral-800/50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {score !== null ? score : "—"}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg bg-neutral-800/50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  );
}

function BooleanBadge({
  label,
  value,
}: {
  label: string;
  value: boolean | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm text-neutral-300">{label}</span>
    </div>
  );
}
