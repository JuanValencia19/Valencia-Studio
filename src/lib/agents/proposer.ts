import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { AgentResult, WebAudit, ScoreBreakdown } from "@/types";

interface ProposerInput {
  leadId: string;
  leadData: {
    name: string;
    address: string | null;
    website_url: string | null;
    google_rating: number | null;
    google_reviews_count: number;
  };
  audit: WebAudit;
  score: {
    opportunityScore: number;
    breakdown: ScoreBreakdown;
    reasoning: string;
  };
  proposalTemplate?: string | null;
}

interface ProposerOutput {
  subject: string;
  body: string;
  proposedService: string;
  proposedPriceRange: string;
}

export async function runProposer(
  input: ProposerInput
): Promise<AgentResult<ProposerOutput>> {
  const startTime = Date.now();

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        subject: z
          .string()
          .describe("Email subject line, max 60 chars, compelling"),
        body: z
          .string()
          .describe("Full email body in Spanish, professional, personalized"),
        proposedService: z.string().describe("Main service to propose"),
        proposedPriceRange: z
          .string()
          .describe("Estimated price range in euros"),
      }),
      prompt: `You are a B2B sales expert writing a personalized outreach email to a local business in Valencia, Spain.

YOUR COMPANY: Valencia Studio — we create AI-powered landing pages and digital marketing solutions for local businesses.

RECIPIENT:
- Name: ${input.leadData.name}
- Address: ${input.leadData.address}
- Website: ${input.leadData.website_url || "No website"}
- Google Rating: ${input.leadData.google_rating || "N/A"}
- Reviews: ${input.leadData.google_reviews_count}

WEBSITE ANALYSIS:
${input.audit.ai_summary || "No audit available"}

OPPORTUNITY SCORE: ${input.score.opportunityScore}/100
REASONING: ${input.score.reasoning}

${input.proposalTemplate ? `CUSTOM TEMPLATE TO FOLLOW:\n${input.proposalTemplate}\n\n` : ""}Write a personalized email that:
1. Opens with a genuine compliment about their business
2. Points out 2-3 specific issues found with their website
3. Explains how Valencia Studio can fix these issues
4. Includes a clear call-to-action (free audit, quick call, etc.)
5. Feels personal, NOT spammy or templated
6. Is written in professional Spanish
7. Keeps the tone friendly but authoritative

The email should be 150-250 words max.`,
    });

    return {
      success: true,
      data: object,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Proposer failed",
      duration: Date.now() - startTime,
    };
  }
}
