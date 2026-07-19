import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import {
  Faq,
  FinalCta,
  Footer,
  HeaderBrand,
  HonestProof,
  Hero,
  ProblemSolution,
  Process,
  Showcase,
  StickyMobileCta,
} from "@/components/features/landing";

// COPY DIRECTION:
//   metadata.title — es_CO, descriptive, includes the studio name. Uses
//   `absolute` so the root layout template (`%s | Valencia Studio`) does NOT
//   append the brand a second time (the title already starts with "Valencia
//   Studio"). This is an apply-pass refinement over design's plain string
//   form, documented in apply-progress.
//   JSON-LD — real studio fields only. NO fabricated reviews / ratings
//   (would violate Google's spam policies). `ProfessionalService` is the
//   correct schema for an early-stage service business.

export const metadata: Metadata = {
  title: {
    absolute:
      "Valencia Studio — Landing pages premium con IA para negocios locales",
  },
};

// Multi-type entity (Organization + ProfessionalService) per design § SEO.
// Typed object → JSON.stringify → valid JSON by construction.
const orgLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  name: "Valencia Studio",
  description:
    "Landing pages premium construidas con IA para negocios locales en Colombia.",
  url: "https://valenciastudio.co",
  email: "hello@valenciastudio.co",
  knowsLanguage: ["es"],
  areaServed: { "@type": "Country", name: "Colombia" },
  serviceType: "AI-powered landing pages for local businesses",
};

export default function Home() {
  return (
    <>
      {/* Organization + ProfessionalService structured data (page-level) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />

      <HeaderBrand />
      <main>
        <Hero />
        <ProblemSolution />
        <Process />
        <Showcase />
        <HonestProof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />

      {/* Vercel Analytics — runtime dep installed in T1. No consent UI in
          Fase 2 (non-blocking per spec). Script present in built HTML. */}
      <Analytics />
    </>
  );
}
