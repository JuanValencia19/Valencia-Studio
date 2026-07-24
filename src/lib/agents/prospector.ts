import { searchPlaces } from "@/lib/google/places";
import type { AgentResult, RawLead } from "@/types";

interface ProspectorInput {
  city: string;
  query: string;
  maxResults: number;
  location?: string;
  radius?: number;
  placeType?: string;
  queries?: string[];
}

interface ProspectorOutput {
  leads: RawLead[];
  totalFound: number;
}

export async function runProspector(
  input: ProspectorInput
): Promise<AgentResult<ProspectorOutput>> {
  const startTime = Date.now();

  try {
    const leads = await searchPlaces({
      queries: input.queries || [`${input.query} in ${input.city}`],
      location: input.location || "0,0",
      radius: input.radius || 50000,
      maxResults: input.maxResults,
      placeType: input.placeType,
    });

    return {
      success: true,
      data: { leads, totalFound: leads.length },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Prospector failed",
      duration: Date.now() - startTime,
    };
  }
}
