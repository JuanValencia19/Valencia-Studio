import { NextRequest, NextResponse } from "next/server";
import { runPipeline, type PipelineConfig } from "@/lib/agents/pipeline";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod";

const PipelineSchema = z.object({
  city: z.string().default("Valencia"),
  query: z.string().default("dental clinics"),
  maxResults: z.number().min(1).max(100).default(20),
  industryId: z.string().uuid().optional(),
  location: z.string().optional(),
  radius: z.number().min(1000).max(100000).optional(),
  placeType: z.string().optional(),
  queries: z.array(z.string()).optional(),
  steps: z
    .object({
      prospector: z.boolean().default(true),
      researcher: z.boolean().default(true),
      auditor: z.boolean().default(true),
      scorer: z.boolean().default(true),
      proposer: z.boolean().default(true),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();

  const parsed = PipelineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const config: PipelineConfig = {
    city: parsed.data.city,
    query: parsed.data.query,
    maxResults: parsed.data.maxResults,
    industryId: parsed.data.industryId,
    location: parsed.data.location,
    radius: parsed.data.radius,
    placeType: parsed.data.placeType,
    queries: parsed.data.queries,
    runProspector: parsed.data.steps?.prospector,
    runResearcher: parsed.data.steps?.researcher,
    runAuditor: parsed.data.steps?.auditor,
    runScorer: parsed.data.steps?.scorer,
    runProposer: parsed.data.steps?.proposer,
  };

  const result = await runPipeline(config);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await dispatchWebhook("pipeline.completed", {
    runId: result.runId,
    userId: auth.user!.id,
    config: {
      city: config.city,
      query: config.query,
      maxResults: config.maxResults,
    },
  });

  return NextResponse.json({ runId: result.runId, success: true });
}
