import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { AgentResult, ScoreBreakdown } from "@/types";

interface ScorerInput {
  leadId: string;
  audit: Record<string, unknown>;
  research: {
    hasSocialMedia: boolean;
    hasOnlineBooking: boolean;
  };
  leadData: {
    name: string;
    website_url: string | null;
    google_rating: number | null;
    google_reviews_count: number;
  };
  scoringWeights?: Record<string, number> | null;
}

interface ScorerOutput {
  opportunityScore: number;
  breakdown: ScoreBreakdown;
  reasoning: string;
}

function calculateDeterministicScores(input: ScorerInput): ScoreBreakdown {
  const audit = input.audit as {
    pagespeed_mobile_score?: number;
    seo_score?: number;
    ux_score?: number;
    conversion_score?: number;
    has_online_booking?: boolean;
  };

  // Default weights (each category max 25 points)
  const weights = {
    digitalPresence: input.scoringWeights?.digitalPresence ?? 1,
    websiteQuality: input.scoringWeights?.websiteQuality ?? 1,
    conversionPotential: input.scoringWeights?.conversionPotential ?? 1,
    marketOpportunity: input.scoringWeights?.marketOpportunity ?? 1,
  };

  let digitalPresence = 0;
  if (input.leadData.google_rating) {
    digitalPresence += Math.round(input.leadData.google_rating * 2);
  }
  if (input.leadData.google_reviews_count > 10) digitalPresence += 5;
  if (input.leadData.google_reviews_count > 50) digitalPresence += 5;
  if (input.research.hasSocialMedia) digitalPresence += 5;

  let websiteQuality = 0;
  if (audit.pagespeed_mobile_score) {
    websiteQuality += Math.round(audit.pagespeed_mobile_score / 4);
  }
  if (audit.seo_score) {
    websiteQuality += Math.round(audit.seo_score / 4);
  }

  let conversionPotential = 0;
  if (audit.ux_score) {
    conversionPotential += Math.round(audit.ux_score / 3);
  }
  if (audit.conversion_score) {
    conversionPotential += Math.round(audit.conversion_score / 3);
  }

  let marketOpportunity = 0;
  if (!input.leadData.website_url) marketOpportunity += 10;
  if (audit.pagespeed_mobile_score && audit.pagespeed_mobile_score < 50)
    marketOpportunity += 5;
  if (audit.seo_score && audit.seo_score < 50) marketOpportunity += 5;
  if (!input.research.hasOnlineBooking) marketOpportunity += 5;

  return {
    digitalPresence: Math.min(25, Math.round(digitalPresence * weights.digitalPresence)),
    websiteQuality: Math.min(25, Math.round(websiteQuality * weights.websiteQuality)),
    conversionPotential: Math.min(25, Math.round(conversionPotential * weights.conversionPotential)),
    marketOpportunity: Math.min(25, Math.round(marketOpportunity * weights.marketOpportunity)),
  };
}

export async function runScorer(
  input: ScorerInput
): Promise<AgentResult<ScorerOutput>> {
  const startTime = Date.now();

  try {
    const deterministicScores = calculateDeterministicScores(input);
    const totalScore =
      deterministicScores.digitalPresence +
      deterministicScores.websiteQuality +
      deterministicScores.conversionPotential +
      deterministicScores.marketOpportunity;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        adjustedScore: z.number().min(0).max(100),
        reasoning: z.string(),
      }),
      prompt: `You are analyzing a dental clinic in Valencia, Spain to determine the business opportunity for offering them digital marketing services.

Lead Information:
- Name: ${input.leadData.name}
- Website: ${input.leadData.website_url || "No website"}
- Google Rating: ${input.leadData.google_rating || "N/A"} (${input.leadData.google_reviews_count} reviews)
- Has Instagram: ${input.research.hasSocialMedia}

Deterministic Scores:
- Digital Presence: ${deterministicScores.digitalPresence}/25
- Website Quality: ${deterministicScores.websiteQuality}/25
- Conversion Potential: ${deterministicScores.conversionPotential}/25
- Market Opportunity: ${deterministicScores.marketOpportunity}/25
- Total: ${totalScore}/100

Based on this analysis, provide:
1. An adjusted opportunity score (0-100) that considers:
   - High opportunity = bad website + good business indicators (many reviews, good rating)
   - Low opportunity = already excellent website (harder sell)
   - Medium opportunity = decent business but clear improvement areas
2. Detailed reasoning for the score`,
      temperature: 0.3,
    });

    return {
      success: true,
      data: {
        opportunityScore: object.adjustedScore,
        breakdown: deterministicScores,
        reasoning: object.reasoning,
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Scorer failed",
      duration: Date.now() - startTime,
    };
  }
}
