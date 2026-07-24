import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Fetch all analytics data in parallel
  const [
    funnelResult,
    scoreDistResult,
    outreachResult,
    industryResult,
  ] = await Promise.all([
    supabase.from("analytics_pipeline_funnel").select("*"),
    supabase.from("analytics_score_distribution").select("*"),
    supabase.from("analytics_outreach_metrics").select("*"),
    supabase.from("industry_stats").select("*"),
  ]);

  return (
    <AnalyticsClient
      funnelData={funnelResult.data || []}
      scoreDistribution={scoreDistResult.data || []}
      outreachMetrics={outreachResult.data || []}
      industryStats={industryResult.data || []}
    />
  );
}
