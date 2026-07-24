import { createAdminClient } from "@/lib/supabase/admin";

export interface PipelineFunnelData {
  status: string;
  count: number;
  percentage: number;
}

export interface ScoreDistributionData {
  range: string;
  count: number;
}

export interface OutreachMetricsData {
  date: string;
  total_contacts: number;
  replies: number;
  responses_received: number;
  positive: number;
  negative: number;
}

export interface IndustryStatsData {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  total_leads: number;
  avg_score: number | null;
  high_priority_count: number;
  converted_count: number;
}

export async function getPipelineFunnel(): Promise<PipelineFunnelData[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("analytics_pipeline_funnel").select("*");
  return data || [];
}

export async function getScoreDistribution(): Promise<ScoreDistributionData[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("analytics_score_distribution").select("*");
  return data || [];
}

export async function getOutreachMetrics(): Promise<OutreachMetricsData[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("analytics_outreach_metrics").select("*");
  return data || [];
}

export async function getIndustryStats(): Promise<IndustryStatsData[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("industry_stats").select("*");
  return data || [];
}

export async function getDashboardSummary() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("dashboard_summary").select("*").single();
  return data;
}
