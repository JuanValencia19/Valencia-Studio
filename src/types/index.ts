export type LeadStatus =
  | "discovered"
  | "researched"
  | "audited"
  | "scored"
  | "proposal_ready"
  | "contacted"
  | "qualified"
  | "rejected"
  | "converted";

export type AuditStatus = "pending" | "running" | "completed" | "failed";

export type ProposalStatus = "draft" | "ready" | "sent" | "accepted" | "rejected";

export type IndustryStatus = "active" | "archived";

export type ContactType = "email" | "phone" | "whatsapp" | "linkedin" | "other";

export type ContactStatus = "pending" | "sent" | "delivered" | "opened" | "replied" | "bounced";

export type ContactSentiment = "positive" | "neutral" | "negative";

export interface Industry {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  icon: string | null;
  search_queries: string[];
  prospecting_prompt: string | null;
  research_prompt: string | null;
  proposal_template: string | null;
  scoring_weights: Record<string, number> | null;
  status: IndustryStatus;
  leads_count: number;
  avg_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  address: string | null;
  city: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_reviews_count: number;
  google_maps_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  has_website: boolean;
  has_google_business: boolean;
  has_social_media: boolean;
  opportunity_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  status: LeadStatus;
  pipeline_run_id: string | null;
  industry_id: string | null;
  is_manually_added: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_researched_at: string | null;
  last_audited_at: string | null;
  last_scored_at: string | null;
  industries?: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
}

export interface ScoreBreakdown {
  digitalPresence: number;
  websiteQuality: number;
  conversionPotential: number;
  marketOpportunity: number;
}

export interface WebAudit {
  id: string;
  lead_id: string;
  status: AuditStatus;
  pagespeed_mobile_score: number | null;
  pagespeed_desktop_score: number | null;
  first_contentful_paint: string | null;
  largest_contentful_paint: string | null;
  total_blocking_time: string | null;
  cumulative_layout_shift: string | null;
  speed_index: string | null;
  seo_score: number | null;
  has_meta_description: boolean | null;
  has_og_tags: boolean | null;
  hasStructuredData: boolean | null;
  has_sitemap: boolean | null;
  has_robots_txt: boolean | null;
  has_ssl: boolean | null;
  mobile_friendly: boolean | null;
  ux_score: number | null;
  has_cta_above_fold: boolean | null;
  has_testimonials: boolean | null;
  has_contact_form: boolean | null;
  has_whatsapp_button: boolean | null;
  has_online_booking: boolean | null;
  responsive_design: boolean | null;
  content_score: number | null;
  page_title: string | null;
  meta_description: string | null;
  headings_structure: unknown | null;
  image_count: number | null;
  images_without_alt: number | null;
  conversion_score: number | null;
  has_phone_number: boolean | null;
  has_email_visible: boolean | null;
  has_map_embed: boolean | null;
  has_services_page: boolean | null;
  has_pricing_page: boolean | null;
  has_gallery: boolean | null;
  raw_pagespeed: unknown | null;
  raw_html_analysis: unknown | null;
  ai_summary: string | null;
  ai_recommendations: unknown | null;
  created_at: string;
  completed_at: string | null;
}

export interface Proposal {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  proposed_service: string;
  proposed_price_range: string | null;
  status: ProposalStatus;
  model_used: string | null;
  generation_tokens: number | null;
  generation_cost: number | null;
  user_edits: string | null;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineRun {
  id: string;
  target_city: string;
  target_query: string | null;
  max_results: number;
  status: string;
  current_step: string | null;
  total_leads: number;
  leads_processed: number;
  leads_audited: number;
  leads_scored: number;
  leads_proposed: number;
  results_summary: unknown | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ContactAttempt {
  id: string;
  lead_id: string;
  proposal_id: string | null;
  user_id: string | null;
  channel: string;
  contact_type: ContactType;
  message: string | null;
  outcome: string | null;
  status: ContactStatus;
  sentiment: ContactSentiment | null;
  response_received: boolean;
  response_summary: string | null;
  next_action: string | null;
  next_action_date: string | null;
  attachments: unknown[];
  metadata: Record<string, unknown>;
  follow_up_date: string | null;
  created_at: string;
}

export interface LeadOutreachSummary {
  lead_id: string;
  lead_name: string;
  total_attempts: number;
  responses_received: number;
  last_contact_at: string | null;
  first_contact_at: string | null;
  most_recent_outcome: string | null;
}

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  tokensUsed?: number;
}

export interface RawLead {
  name: string;
  placeId: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface DigitalPresenceSignals {
  hasWebsite: boolean;
  hasSocialMedia: boolean;
  hasOnlineBooking: boolean;
  hasWhatsApp: boolean;
  hasContactForm: boolean;
  instagram?: string;
  facebook?: string;
}

export interface DashboardSummary {
  total_leads: number;
  discovered_count: number;
  researched_count: number;
  audited_count: number;
  scored_count: number;
  proposal_ready_count: number;
  contacted_count: number;
  converted_count: number;
  avg_score: number;
  high_priority_count: number;
  industries_count: number;
}

export interface IndustryStats {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  status: IndustryStatus;
  total_leads: number;
  avg_score: number | null;
  high_priority_count: number;
  converted_count: number;
}

export type WebhookEvent =
  | "lead.created"
  | "lead.scored"
  | "lead.audited"
  | "lead.proposal_ready"
  | "lead.contacted"
  | "lead.converted"
  | "pipeline.completed";

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string | null;
  events: WebhookEvent[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  failure_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status_code: number | null;
  response_body: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}
