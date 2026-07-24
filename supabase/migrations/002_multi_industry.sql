-- ============================================================
-- Multi-Industry Support
-- ============================================================

CREATE TYPE industry_status AS ENUM ('active', 'archived');

CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  search_queries JSONB NOT NULL DEFAULT '[]'::jsonb,
  prospecting_prompt TEXT,
  research_prompt TEXT,
  proposal_template TEXT,
  scoring_weights JSONB,
  status industry_status NOT NULL DEFAULT 'active',
  leads_count INTEGER DEFAULT 0,
  avg_score DECIMAL(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_industries_user_id ON industries(user_id);
CREATE INDEX idx_industries_status ON industries(status);

-- Add industry_id to leads
ALTER TABLE leads ADD COLUMN industry_id UUID REFERENCES industries(id) ON DELETE SET NULL;
CREATE INDEX idx_leads_industry_id ON leads(industry_id);

-- Update leads_count trigger
CREATE OR REPLACE FUNCTION update_industry_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.industry_id IS NOT NULL THEN
    UPDATE industries SET leads_count = leads_count + 1 WHERE id = NEW.industry_id;
  ELSIF TG_OP = 'DELETE' AND OLD.industry_id IS NOT NULL THEN
    UPDATE industries SET leads_count = leads_count - 1 WHERE id = OLD.industry_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.industry_id IS DISTINCT FROM NEW.industry_id THEN
      IF OLD.industry_id IS NOT NULL THEN
        UPDATE industries SET leads_count = leads_count - 1 WHERE id = OLD.industry_id;
      END IF;
      IF NEW.industry_id IS NOT NULL THEN
        UPDATE industries SET leads_count = leads_count + 1 WHERE id = NEW.industry_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_industry_leads_count
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_industry_leads_count();

-- Updated_at trigger for industries
CREATE TRIGGER set_industries_updated_at
  BEFORE UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update dashboard_summary view to include industry breakdown
DROP VIEW IF EXISTS dashboard_summary;
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
  COUNT(*) FILTER (WHERE opportunity_score >= 80) as high_priority_count,
  COUNT(DISTINCT industry_id) FILTER (WHERE industry_id IS NOT NULL) as industries_count
FROM leads;

-- Industry analytics view
CREATE VIEW industry_stats AS
SELECT
  i.id,
  i.name,
  i.slug,
  i.icon,
  i.status,
  COUNT(l.id) as total_leads,
  ROUND(AVG(l.opportunity_score), 1) as avg_score,
  COUNT(l.id) FILTER (WHERE l.opportunity_score >= 80) as high_priority_count,
  COUNT(l.id) FILTER (WHERE l.status = 'converted') as converted_count
FROM industries i
LEFT JOIN leads l ON l.industry_id = i.id
GROUP BY i.id, i.name, i.slug, i.icon, i.status;
