-- ============================================================
-- Outreach Tracking Enhancement
-- ============================================================

-- Enhance contact_attempts table
ALTER TABLE contact_attempts
  ADD COLUMN user_id UUID REFERENCES auth.users(id),
  ADD COLUMN contact_type TEXT NOT NULL DEFAULT 'email',
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN sentiment TEXT,
  ADD COLUMN response_received BOOLEAN DEFAULT false,
  ADD COLUMN response_summary TEXT,
  ADD COLUMN next_action TEXT,
  ADD COLUMN next_action_date DATE,
  ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Add lead outreach summary view
CREATE VIEW lead_outreach_summary AS
SELECT
  l.id as lead_id,
  l.name as lead_name,
  COUNT(ca.id) as total_attempts,
  COUNT(ca.id) FILTER (WHERE ca.response_received = true) as responses_received,
  MAX(ca.created_at) as last_contact_at,
  MIN(ca.created_at) as first_contact_at,
  ca_outcome.most_recent_outcome
FROM leads l
LEFT JOIN contact_attempts ca ON ca.lead_id = l.id
LEFT JOIN (
  SELECT DISTINCT ON (lead_id) lead_id, outcome as most_recent_outcome
  FROM contact_attempts ORDER BY lead_id, created_at DESC
) ca_outcome ON ca_outcome.lead_id = l.id
GROUP BY l.id, l.name, ca_outcome.most_recent_outcome;

-- Indexes
CREATE INDEX idx_contact_attempts_user_id ON contact_attempts(user_id);
CREATE INDEX idx_contact_attempts_status ON contact_attempts(status);
CREATE INDEX idx_contact_attempts_contact_type ON contact_attempts(contact_type);
