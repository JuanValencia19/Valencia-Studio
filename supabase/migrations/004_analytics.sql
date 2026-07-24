-- ============================================================
-- Analytics Views
-- ============================================================

-- Pipeline funnel view
CREATE VIEW analytics_pipeline_funnel AS
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::decimal / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) as percentage
FROM leads
GROUP BY status
ORDER BY
  CASE status
    WHEN 'discovered' THEN 1
    WHEN 'researched' THEN 2
    WHEN 'audited' THEN 3
    WHEN 'scored' THEN 4
    WHEN 'proposal_ready' THEN 5
    WHEN 'contacted' THEN 6
    WHEN 'qualified' THEN 7
    WHEN 'converted' THEN 8
    WHEN 'rejected' THEN 9
  END;

-- Score distribution view
CREATE VIEW analytics_score_distribution AS
SELECT
  CASE
    WHEN opportunity_score >= 90 THEN '90-100 (Excelente)'
    WHEN opportunity_score >= 80 THEN '80-89 (Muy Bueno)'
    WHEN opportunity_score >= 70 THEN '70-79 (Bueno)'
    WHEN opportunity_score >= 60 THEN '60-69 (Regular)'
    WHEN opportunity_score >= 50 THEN '50-59 (Bajo)'
    ELSE '0-49 (Muy Bajo)'
  END as range,
  COUNT(*) as count
FROM leads
WHERE opportunity_score IS NOT NULL
GROUP BY range
ORDER BY MIN(opportunity_score) DESC;

-- Outreach metrics view
CREATE VIEW analytics_outreach_metrics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE status = 'replied') as replies,
  COUNT(*) FILTER (WHERE response_received = true) as responses_received,
  COUNT(*) FILTER (WHERE sentiment = 'positive') as positive,
  COUNT(*) FILTER (WHERE sentiment = 'negative') as negative
FROM contact_attempts
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
