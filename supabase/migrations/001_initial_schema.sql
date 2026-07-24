-- ============================================================
-- Business Opportunity Agent — Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE lead_status AS ENUM (
  'discovered',
  'researched',
  'audited',
  'scored',
  'proposal_ready',
  'contacted',
  'qualified',
  'rejected',
  'converted'
);

CREATE TYPE audit_status AS ENUM (
  'pending',
  'running',
  'completed',
  'failed'
);

CREATE TYPE proposal_status AS ENUM (
  'draft',
  'ready',
  'sent',
  'accepted',
  'rejected'
);

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Valencia',
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_place_id TEXT UNIQUE,
  google_rating DECIMAL(2, 1),
  google_reviews_count INTEGER DEFAULT 0,
  google_maps_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  has_website BOOLEAN DEFAULT false,
  has_google_business BOOLEAN DEFAULT false,
  has_social_media BOOLEAN DEFAULT false,
  opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  score_breakdown JSONB,
  status lead_status NOT NULL DEFAULT 'discovered',
  pipeline_run_id UUID,
  is_manually_added BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_researched_at TIMESTAMPTZ,
  last_audited_at TIMESTAMPTZ,
  last_scored_at TIMESTAMPTZ
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(opportunity_score DESC NULLS LAST);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_slug ON leads(slug);
CREATE INDEX idx_leads_name_trgm ON leads USING gin(name gin_trgm_ops);

CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_city TEXT NOT NULL DEFAULT 'Valencia',
  target_query TEXT,
  max_results INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  current_step TEXT,
  total_leads INTEGER DEFAULT 0,
  leads_processed INTEGER DEFAULT 0,
  leads_audited INTEGER DEFAULT 0,
  leads_scored INTEGER DEFAULT 0,
  leads_proposed INTEGER DEFAULT 0,
  results_summary JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE web_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status audit_status NOT NULL DEFAULT 'pending',
  pagespeed_mobile_score INTEGER CHECK (pagespeed_mobile_score >= 0 AND pagespeed_mobile_score <= 100),
  pagespeed_desktop_score INTEGER CHECK (pagespeed_desktop_score >= 0 AND pagespeed_desktop_score <= 100),
  first_contentful_paint TEXT,
  largest_contentful_paint TEXT,
  total_blocking_time TEXT,
  cumulative_layout_shift TEXT,
  speed_index TEXT,
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  has_meta_description BOOLEAN,
  has_og_tags BOOLEAN,
  hasStructuredData BOOLEAN,
  has_sitemap BOOLEAN,
  has_robots_txt BOOLEAN,
  has_ssl BOOLEAN,
  mobile_friendly BOOLEAN,
  ux_score INTEGER CHECK (ux_score >= 0 AND ux_score <= 100),
  has_cta_above_fold BOOLEAN,
  has_testimonials BOOLEAN,
  has_contact_form BOOLEAN,
  has_whatsapp_button BOOLEAN,
  has_online_booking BOOLEAN,
  responsive_design BOOLEAN,
  content_score INTEGER CHECK (content_score >= 0 AND content_score <= 100),
  page_title TEXT,
  meta_description TEXT,
  headings_structure JSONB,
  image_count INTEGER,
  images_without_alt INTEGER,
  conversion_score INTEGER CHECK (conversion_score >= 0 AND conversion_score <= 100),
  has_phone_number BOOLEAN,
  has_email_visible BOOLEAN,
  has_map_embed BOOLEAN,
  has_services_page BOOLEAN,
  has_pricing_page BOOLEAN,
  has_gallery BOOLEAN,
  raw_pagespeed JSONB,
  raw_html_analysis JSONB,
  ai_summary TEXT,
  ai_recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(lead_id)
);

CREATE INDEX idx_audits_lead_id ON web_audits(lead_id);
CREATE INDEX idx_audits_status ON web_audits(status);

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  proposed_service TEXT NOT NULL,
  proposed_price_range TEXT,
  status proposal_status NOT NULL DEFAULT 'draft',
  model_used TEXT,
  generation_tokens INTEGER,
  generation_cost DECIMAL(10, 6),
  user_edits TEXT,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_lead_id ON proposals(lead_id);
CREATE INDEX idx_proposals_status ON proposals(status);

CREATE TABLE contact_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  message TEXT,
  outcome TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_lead_id ON contact_attempts(lead_id);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  pipeline_runs_count INTEGER DEFAULT 0,
  leads_generated_count INTEGER DEFAULT 0,
  proposals_generated_count INTEGER DEFAULT 0,
  default_city TEXT DEFAULT 'Valencia',
  notification_preferences JSONB DEFAULT '{"email": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (bypass with service role for MVP)
-- ============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    IF EXISTS (SELECT 1 FROM leads WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::text, 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_slug
  BEFORE INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW dashboard_summary AS
SELECT
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'discovered') as discovered_count,
  COUNT(*) FILTER (WHERE status = 'researched') as researched_count,
  COUNT(*) FILTER (WHERE status = 'audited') as audited_count,
  COUNT(*) FILTER (WHERE status = 'scored') as scored_count,
  COUNT(*) FILTER (WHERE status = 'proposal_ready') as proposal_ready_count,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted_count,
  COUNT(*) FILTER (WHERE status = 'converted') as converted_count,
  ROUND(AVG(opportunity_score), 1) as avg_score,
  COUNT(*) FILTER (WHERE opportunity_score >= 80) as high_priority_count
FROM leads;

CREATE VIEW top_opportunities AS
SELECT
  l.id,
  l.name,
  l.slug,
  l.website_url,
  l.phone,
  l.google_rating,
  l.google_reviews_count,
  l.opportunity_score,
  l.score_breakdown,
  l.status,
  l.has_website,
  wa.pagespeed_mobile_score,
  wa.seo_score,
  wa.ux_score,
  wa.conversion_score,
  p.subject as proposal_subject,
  p.status as proposal_status
FROM leads l
LEFT JOIN web_audits wa ON wa.lead_id = l.id
LEFT JOIN proposals p ON p.lead_id = l.id AND p.status = 'draft'
WHERE l.opportunity_score IS NOT NULL
ORDER BY l.opportunity_score DESC;
