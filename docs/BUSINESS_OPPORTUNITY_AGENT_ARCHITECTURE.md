# Business Opportunity Agent — Architecture & Implementation Plan

> **Product:** Lead generation SaaS for dental clinics in Valencia, Spain
> **Stack:** Next.js 16 + Supabase + Vercel AI SDK + Playwright
> **Timeline:** 2 weeks MVP
> **Date:** 2026-07-23

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Agent Pipeline](#3-agent-pipeline)
4. [API Routes](#4-api-routes)
5. [Dashboard UI](#5-dashboard-ui)
6. [External APIs & Services](#6-external-apis--services)
7. [AI Integration](#7-ai-integration)
8. [File Structure](#8-file-structure)
9. [Dependencies](#9-dependencies)
10. [Sprint Breakdown](#10-sprint-breakdown)
11. [Risk Analysis](#11-risk-analysis)
12. [Cost Projections](#12-cost-projections)

---

## 1. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VALENCIA STUDIO (SaaS)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Dashboard   │    │  Landing     │    │   Auth Pages         │  │
│  │   (Next.js)   │    │  Page        │    │   (Next.js)          │  │
│  │   /dashboard  │    │  /           │    │   /login /register   │  │
│  └──────┬───────┘    └──────────────┘    └──────────┬───────────┘  │
│         │                                           │               │
│         │            ┌──────────────────────────────┘               │
│         │            │                                              │
│         ▼            ▼                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    NEXT.JS API LAYER                         │  │
│  │                                                              │  │
│  │  /api/leads          CRUD + manual input                    │  │
│  │  /api/pipeline       Trigger agent pipeline                 │  │
│  │  /api/audit          Run website audit                      │  │
│  │  /api/proposals      Generate AI proposals                  │  │
│  │  /api/export         Export leads to CSV                    │  │
│  └──────────┬──────────────────┬───────────────────────────────┘  │
│             │                  │                                    │
│             ▼                  ▼                                    │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐   │
│  │   SUPABASE       │  │   AGENT PIPELINE (Server Actions)   │   │
│  │                  │  │                                      │   │
│  │  PostgreSQL      │  │  1. Prospector Agent                │   │
│  │  Auth            │  │     └─ Google Places API            │   │
│  │  Storage         │  │  2. Researcher Agent                │   │
│  │  RLS             │  │     └─ Web Scraping (Playwright)    │   │
│  │  Realtime        │  │  3. Auditor Agent                   │   │
│  │                  │  │     └─ PageSpeed Insights API       │   │
│  └──────────────────┘  │  4. Scorer Agent                    │   │
│                        │     └─ AI Analysis (Vercel AI SDK)  │   │
│                        │  5. Proposer Agent                   │   │
│                        │     └─ Content Generation (AI)      │   │
│                        └──────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   EXTERNAL SERVICES                          │  │
│  │                                                              │  │
│  │  Google Places API ──── Discovery (clinics in Valencia)     │  │
│  │  PageSpeed Insights ──── Performance/SEO audit              │  │
│  │  OpenAI/Anthropic ──── Scoring + Proposal generation        │  │
│  │  Playwright ──── Deep website analysis                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User triggers pipeline
        │
        ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Prospector  │────▶│  Researcher │────▶│   Auditor   │
│  (Discover)  │     │  (Enrich)   │     │  (Analyze)  │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │  leads  │        │  leads  │        │  audits  │
   │  table  │◀───────│  table  │◀───────│  table   │
   └─────────┘        └─────────┘        └─────────┘
                                                 │
                                                 ▼
                                        ┌─────────────┐
                                        │   Scorer    │
                                        │  (Score)    │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Proposer   │
                                        │  (Generate) │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Dashboard  │
                                        │  (Display)  │
                                        └─────────────┘
```

---

## 2. Database Schema

### Overview

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE lead_status AS ENUM (
  'discovered',      -- Found via Prospector, no research yet
  'researched',      -- Enriched with web data
  'audited',         -- Website audit completed
  'scored',          -- Opportunity score calculated
  'proposal_ready',  -- AI proposal generated
  'contacted',       -- User sent proposal
  'qualified',       -- User marked as qualified
  'rejected',        -- User rejected
  'converted'        -- Became a customer
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
-- CORE TABLES
-- ============================================================

-- Leads: Discovered dental clinics
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info (from Google Places / manual input)
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Contact info
  phone TEXT,
  email TEXT,
  website_url TEXT,
  
  -- Location
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Valencia',
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Google Places data
  google_place_id TEXT UNIQUE,
  google_rating DECIMAL(2, 1),
  google_reviews_count INTEGER DEFAULT 0,
  google_maps_url TEXT,
  google_business_status TEXT,
  
  -- Social media
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  
  -- Digital presence signals
  has_website BOOLEAN DEFAULT false,
  has_google_business BOOLEAN DEFAULT false,
  has_social_media BOOLEAN DEFAULT false,
  
  -- Scoring
  opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  score_breakdown JSONB,  -- { seo: 85, performance: 60, ux: 70, ... }
  
  -- Status & pipeline
  status lead_status NOT NULL DEFAULT 'discovered',
  pipeline_run_id UUID,
  
  -- Manual input flag
  is_manually_added BOOLEAN DEFAULT false,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_researched_at TIMESTAMPTZ,
  last_audited_at TIMESTAMPTZ,
  last_scored_at TIMESTAMPTZ
);

-- Indexes for leads
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(opportunity_score DESC NULLS LAST);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_slug ON leads(slug);
CREATE INDEX idx_leads_name_trgm ON leads USING gin(name gin_trgm_ops);

-- Pipeline runs: Track each pipeline execution
CREATE TABLE pipeline_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Configuration
  target_city TEXT NOT NULL DEFAULT 'Valencia',
  target_query TEXT,  -- e.g., "dental clinics", "dentistas"
  max_results INTEGER DEFAULT 50,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed
  current_step TEXT,  -- prospecting, researching, auditing, scoring, proposing
  
  -- Progress
  total_leads INTEGER DEFAULT 0,
  leads_processed INTEGER DEFAULT 0,
  leads_audited INTEGER DEFAULT 0,
  leads_scored INTEGER DEFAULT 0,
  leads_proposed INTEGER DEFAULT 0,
  
  -- Results summary
  results_summary JSONB,
  
  -- Error tracking
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Web audits: Detailed analysis per lead
CREATE TABLE web_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Status
  status audit_status NOT NULL DEFAULT 'pending',
  
  -- PageSpeed Insights data
  pagespeed_mobile_score INTEGER CHECK (pagespeed_mobile_score >= 0 AND pagespeed_mobile_score <= 100),
  pagespeed_desktop_score INTEGER CHECK (pagespeed_desktop_score >= 0 AND pagespeed_desktop_score <= 100),
  
  -- Performance metrics
  first_contentful_paint TEXT,    -- e.g., "1.2s"
  largest_contentful_paint TEXT,  -- e.g., "2.5s"
  total_blocking_time TEXT,       -- e.g., "150ms"
  cumulative_layout_shift TEXT,   -- e.g., "0.05"
  speed_index TEXT,               -- e.g., "1.8s"
  
  -- SEO analysis
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  has_meta_description BOOLEAN,
  has_og_tags BOOLEAN,
  hasStructuredData BOOLEAN,
  has_sitemap BOOLEAN,
  has_robots_txt BOOLEAN,
  has_ssl BOOLEAN,
  mobile_friendly BOOLEAN,
  
  -- UX analysis
  ux_score INTEGER CHECK (ux_score >= 0 AND ux_score <= 100),
  has_cta_above_fold BOOLEAN,
  has_testimonials BOOLEAN,
  has_contact_form BOOLEAN,
  has_whatsapp_button BOOLEAN,
  has_online_booking BOOLEAN,
  responsive_design BOOLEAN,
  
  -- Content analysis
  content_score INTEGER CHECK (content_score >= 0 AND content_score <= 100),
  page_title TEXT,
  meta_description TEXT,
  headings_structure JSONB,      -- [{ level: 1, text: "..." }, ...]
  image_count INTEGER,
  images_without_alt INTEGER,
  
  -- Conversion analysis
  conversion_score INTEGER CHECK (conversion_score >= 0 AND conversion_score <= 100),
  has_phone_number BOOLEAN,
  has_email_visible BOOLEAN,
  has_map_embed BOOLEAN,
  has_services_page BOOLEAN,
  has_pricing_page BOOLEAN,
  has_gallery BOOLEAN,
  
  -- Raw data
  raw_pagespeed JSONB,
  raw_html_analysis JSONB,
  
  -- AI analysis
  ai_summary TEXT,
  ai_recommendations JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(lead_id)  -- One audit per lead at a time
);

CREATE INDEX idx_audits_lead_id ON web_audits(lead_id);
CREATE INDEX idx_audits_status ON web_audits(status);

-- Proposals: AI-generated outreach proposals
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Proposal details
  proposed_service TEXT NOT NULL,  -- e.g., "Landing Page + SEO"
  proposed_price_range TEXT,       -- e.g., "€1,500 - €2,500"
  
  -- Status
  status proposal_status NOT NULL DEFAULT 'draft',
  
  -- AI metadata
  model_used TEXT,  -- e.g., "gpt-4o", "claude-sonnet-4"
  generation_tokens INTEGER,
  generation_cost DECIMAL(10, 6),
  
  -- Customization
  user_edits TEXT,  -- Track if user modified the proposal
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_lead_id ON proposals(lead_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- Contact attempts: Track outreach
CREATE TABLE contact_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  
  channel TEXT NOT NULL,  -- email, phone, whatsapp, linkedin
  message TEXT,
  
  -- Outcome
  outcome TEXT,  -- no_response, interested, not_interested, meeting_booked
  follow_up_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_lead_id ON contact_attempts(lead_id);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  
  -- API usage tracking
  pipeline_runs_count INTEGER DEFAULT 0,
  leads_generated_count INTEGER DEFAULT 0,
  proposals_generated_count INTEGER DEFAULT 0,
  
  -- Settings
  default_city TEXT DEFAULT 'Valencia',
  notification_preferences JSONB DEFAULT '{"email": true}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- For MVP: single-user mode (service role bypasses RLS)
-- Policies will be added when multi-user is needed

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
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

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    -- Append random suffix if slug already exists
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
-- VIEWS (for dashboard queries)
-- ============================================================

-- Dashboard summary view
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

-- Top opportunities view
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
```

---

## 3. Agent Pipeline

### Pipeline Architecture

Each agent is a **pure function** that takes input and returns output. Agents are orchestrated by a pipeline runner.

```typescript
// lib/agents/types.ts

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  tokensUsed?: number;
}

export interface ProspectorInput {
  city: string;
  query: string;
  maxResults: number;
}

export interface ProspectorOutput {
  leads: RawLead[];
  totalFound: number;
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

export interface ResearcherInput {
  leadId: string;
  websiteUrl?: string;
  name: string;
}

export interface ResearcherOutput {
  socialMedia: SocialMediaLinks;
  digitalPresence: DigitalPresenceSignals;
  rawHtml?: string;
}

export interface AuditorInput {
  leadId: string;
  websiteUrl: string;
}

export interface AuditorOutput {
  pagespeed: PageSpeedResult;
  seo: SEOAnalysis;
  ux: UXAnalysis;
  content: ContentAnalysis;
  conversion: ConversionAnalysis;
}

export interface ScorerInput {
  leadId: string;
  audit: AuditorOutput;
  research: ResearcherOutput;
  leadData: any;
}

export interface ScorerOutput {
  opportunityScore: number;
  breakdown: ScoreBreakdown;
  reasoning: string;
}

export interface ScoreBreakdown {
  digitalPresence: number;  // 0-25 points
  websiteQuality: number;   // 0-25 points
  conversionPotential: number; // 0-25 points
  marketOpportunity: number;  // 0-25 points
}

export interface ProposerInput {
  leadId: string;
  leadData: any;
  audit: AuditorOutput;
  score: ScorerOutput;
}

export interface ProposerOutput {
  subject: string;
  body: string;
  proposedService: string;
  proposedPriceRange: string;
}
```

### Agent 1: Prospector (Discovery)

```typescript
// lib/agents/prospector.ts

import { google } from 'googleapis';

export async function runProspector(
  input: ProspectorInput
): Promise<AgentResult<ProspectorOutput>> {
  const startTime = Date.now();
  
  try {
    const places = google.places('v1');
    
    // Search for dental clinics in the target city
    const response = await places.places.textSearch({
      params: {
        query: `${input.query} in ${input.city}`,
        key: process.env.GOOGLE_PLACES_API_KEY!,
        type: 'dentist',
        language: 'es',
        location: '39.4699,-0.3763',  // Valencia, Spain coordinates
        radius: 50000,  // 50km radius
      },
    });
    
    const results = response.data.results || [];
    const leads: RawLead[] = [];
    
    // Process up to maxResults
    for (const place of results.slice(0, input.maxResults)) {
      leads.push({
        name: place.name || '',
        placeId: place.place_id || '',
        address: place.formatted_address || '',
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        reviewsCount: place.user_ratings_total,
        mapsUrl: place.url,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
      });
      
      // Respect rate limits (10 requests per second for Places API)
      await sleep(100);
    }
    
    // Also search with variations to get more results
    const variations = [
      'clínica dental',
      'dentista',
      'odontólogo',
      'centro dental',
    ];
    
    for (const variation of variations) {
      if (leads.length >= input.maxResults) break;
      
      const variationResponse = await places.places.textSearch({
        params: {
          query: `${variation} ${input.city}`,
          key: process.env.GOOGLE_PLACES_API_KEY!,
          language: 'es',
          location: '39.4699,-0.3763',
          radius: 50000,
        },
      });
      
      for (const place of variationResponse.data.results || []) {
        if (leads.length >= input.maxResults) break;
        if (leads.some(l => l.placeId === place.place_id)) continue;
        
        leads.push({
          name: place.name || '',
          placeId: place.place_id || '',
          address: place.formatted_address || '',
          phone: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          reviewsCount: place.user_ratings_total,
          mapsUrl: place.url,
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
        });
        
        await sleep(100);
      }
    }
    
    return {
      success: true,
      data: { leads, totalFound: leads.length },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Prospector failed',
      duration: Date.now() - startTime,
    };
  }
}
```

### Agent 2: Researcher (Web Enrichment)

```typescript
// lib/agents/researcher.ts

import { chromium } from 'playwright';

export async function runResearcher(
  input: ResearcherInput
): Promise<AgentResult<ResearcherOutput>> {
  const startTime = Date.now();
  
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; ValenciaStudioBot/1.0)',
      locale: 'es-ES',
    });
    const page = await context.newPage();
    
    // Research social media presence
    const socialMedia = await findSocialMedia(input.name, page);
    
    // Analyze digital presence
    const digitalPresence = await analyzeDigitalPresence(input.websiteUrl, page);
    
    await browser.close();
    
    return {
      success: true,
      data: { socialMedia, digitalPresence },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Researcher failed',
      duration: Date.now() - startTime,
    };
  }
}

async function findSocialMedia(
  businessName: string,
  page: any
): Promise<SocialMediaLinks> {
  const socialMedia: SocialMediaLinks = {};
  
  // Search Google for social profiles
  const searchQuery = `"${businessName}" dentist instagram facebook`;
  
  try {
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
    await page.waitForTimeout(2000);
    
    const links = await page.$$eval('a[href]', (anchors: any[]) =>
      anchors.map(a => a.href)
    );
    
    // Extract social media URLs
    for (const link of links) {
      if (link.includes('instagram.com')) {
        socialMedia.instagram = link;
      } else if (link.includes('facebook.com')) {
        socialMedia.facebook = link;
      } else if (link.includes('twitter.com') || link.includes('x.com')) {
        socialMedia.twitter = link;
      }
    }
  } catch {
    // Social media search failed, continue
  }
  
  return socialMedia;
}

async function analyzeDigitalPresence(
  websiteUrl: string | undefined,
  page: any
): Promise<DigitalPresenceSignals> {
  const signals: DigitalPresenceSignals = {
    hasWebsite: !!websiteUrl,
    hasGoogleBusiness: false,  // Already set from Prospector
    hasSocialMedia: false,
    hasOnlineBooking: false,
    hasWhatsApp: false,
  };
  
  if (!websiteUrl) return signals;
  
  try {
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const html = await page.content();
    
    // Check for online booking
    signals.hasOnlineBooking = /book|reservar|cita|appointment/i.test(html);
    
    // Check for WhatsApp
    signals.hasWhatsApp = /wa\.me|whatsapp|api\.whatsapp/i.test(html);
    
    // Check for contact form
    signals.hasContactForm = /form|contacto|contact/i.test(html);
    
    // Extract social links from the page
    const socialLinks = await page.$$eval('a[href]', (anchors: any[]) =>
      anchors
        .map(a => a.href)
        .filter(h => /instagram|facebook|twitter|x\.com/i.test(h))
    );
    
    signals.hasSocialMedia = socialLinks.length > 0;
    signals.instagram = socialLinks.find((l: string) => l.includes('instagram'));
    signals.facebook = socialLinks.find((l: string) => l.includes('facebook'));
    
  } catch {
    // Website analysis failed
  }
  
  return signals;
}
```

### Agent 3: Auditor (Website Analysis)

```typescript
// lib/agents/auditor.ts

import { chromium } from 'playwright';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function runAuditor(
  input: AuditorInput
): Promise<AgentResult<AuditorOutput>> {
  const startTime = Date.now();
  
  try {
    // Step 1: Get PageSpeed Insights data
    const pagespeed = await getPageSpeedData(input.websiteUrl);
    
    // Step 2: Analyze HTML structure with Playwright
    const htmlAnalysis = await analyzeHTML(input.websiteUrl);
    
    // Step 3: Use AI to generate comprehensive analysis
    const analysis = await generateAuditAnalysis(pagespeed, htmlAnalysis);
    
    return {
      success: true,
      data: analysis,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Auditor failed',
      duration: Date.now() - startTime,
    };
  }
}

async function getPageSpeedData(url: string): Promise<any> {
  const strategy = ['mobile', 'desktop'];
  const results: any = {};
  
  for (const s of strategy) {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${s}&category=performance&category=seo&category=accessibility&category=best-practices`
    );
    
    if (response.ok) {
      const data = await response.json();
      results[s] = {
        score: Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100),
        seo: Math.round((data.lighthouseResult?.categories?.seo?.score || 0) * 100),
        accessibility: Math.round((data.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
        bestPractices: Math.round((data.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
        metrics: {
          fcp: data.lighthouseResult?.audits?.['first-contentful-paint']?.displayValue,
          lcp: data.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue,
          tbt: data.lighthouseResult?.audits?.['total-blocking-time']?.displayValue,
          cls: data.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue,
          si: data.lighthouseResult?.audits?.['speed-index']?.displayValue,
        },
      };
    }
  }
  
  return results;
}

async function analyzeHTML(url: string): Promise<any> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; ValenciaStudioBot/1.0)',
  });
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const analysis = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(h => ({ level: parseInt(h.tagName[1]), text: h.textContent?.trim() }));
      
      const images = Array.from(document.querySelectorAll('img'));
      const imagesWithoutAlt = images.filter(img => !img.alt).length;
      
      const forms = document.querySelectorAll('form');
      const hasContactForm = Array.from(forms).some(f => 
        /contact|contacto|email|message/i.test(f.innerHTML)
      );
      
      const hasWhatsApp = !!document.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
      const hasOnlineBooking = !!document.querySelector('[class*="booking"], [class*="reservar"], [id*="booking"]');
      
      const hasCtaAboveFold = (() => {
        const buttons = document.querySelectorAll('button, a[class*="cta"], a[class*="btn"]');
        return Array.from(buttons).some(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.top < window.innerHeight * 0.5;
        });
      })();
      
      const hasTestimonials = !!document.querySelector('[class*="testimonial"], [class*="review"], [class*="opinion"]');
      const hasMap = !!document.querySelector('iframe[src*="maps"], iframe[src*="google"]');
      
      return {
        title: document.title,
        metaDescription: meta?.content || null,
        hasOgTags: !!(ogTitle && ogDesc && ogImage),
        headings,
        imageCount: images.length,
        imagesWithoutAlt,
        hasContactForm,
        hasWhatsApp,
        hasOnlineBooking,
        hasCtaAboveFold,
        hasTestimonials,
        hasMap,
        hasPhone: !!document.querySelector('a[href^="tel:"]'),
        hasEmail: !!document.querySelector('a[href^="mailto:"]'),
      };
    });
    
    await browser.close();
    return analysis;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function generateAuditAnalysis(
  pagespeed: any,
  htmlAnalysis: any
): Promise<AuditorOutput> {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),  // Cost-efficient for analysis
    schema: z.object({
      seoScore: z.number().min(0).max(100),
      uxScore: z.number().min(0).max(100),
      contentScore: z.number().min(0).max(100),
      conversionScore: z.number().min(0).max(100),
      hasSitemap: z.boolean(),
      hasRobotsTxt: z.boolean(),
      hasSsl: z.boolean(),
      mobileFriendly: z.boolean(),
      responsiveDesign: z.boolean(),
      aiSummary: z.string(),
      aiRecommendations: z.array(z.object({
        category: z.string(),
        issue: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
        fix: z.string(),
      })),
    }),
    prompt: `Analyze this dental clinic website and provide scores and recommendations.

PageSpeed Data:
${JSON.stringify(pagespeed, null, 2)}

HTML Analysis:
${JSON.stringify(htmlAnalysis, null, 2)}

Provide:
1. SEO score (0-100) based on meta tags, structure, SSL, mobile-friendly
2. UX score (0-100) based on layout, CTAs, testimonials, navigation
3. Content score (0-100) based on headings, images, text quality
4. Conversion score (0-100) based on contact options, booking, CTAs
5. AI summary of the website's current state
6. Top 5 recommendations for improvement`,
    temperature: 0.3,
  });
  
  return {
    pagespeed: {
      mobileScore: pagespeed.mobile?.score || 0,
      desktopScore: pagespeed.desktop?.score || 0,
      metrics: pagespeed.mobile?.metrics || {},
    },
    seo: {
      score: object.seoScore,
      hasMetaDescription: !!htmlAnalysis.metaDescription,
      hasOgTags: htmlAnalysis.hasOgTags,
      hasSitemap: object.hasSitemap,
      hasRobotsTxt: object.hasRobotsTxt,
      hasSsl: object.hasSsl,
      mobileFriendly: object.mobileFriendly,
    },
    ux: {
      score: object.uxScore,
      hasCtaAboveFold: htmlAnalysis.hasCtaAboveFold,
      hasTestimonials: htmlAnalysis.hasTestimonials,
      hasContactForm: htmlAnalysis.hasContactForm,
      hasOnlineBooking: htmlAnalysis.hasOnlineBooking,
      responsiveDesign: object.responsiveDesign,
    },
    content: {
      score: object.contentScore,
      pageTitle: htmlAnalysis.title,
      metaDescription: htmlAnalysis.metaDescription,
      headings: htmlAnalysis.headings,
      imageCount: htmlAnalysis.imageCount,
      imagesWithoutAlt: htmlAnalysis.imagesWithoutAlt,
    },
    conversion: {
      score: object.conversionScore,
      hasPhoneNumber: htmlAnalysis.hasPhone,
      hasEmailVisible: htmlAnalysis.hasEmail,
      hasMapEmbed: htmlAnalysis.hasMap,
      hasServicesPage: false,  // Would need deeper crawl
      hasPricingPage: false,
      hasGallery: false,
    },
    aiSummary: object.aiSummary,
    aiRecommendations: object.aiRecommendations,
  };
}
```

### Agent 4: Scorer (Opportunity Scoring)

```typescript
// lib/agents/scorer.ts

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function runScorer(
  input: ScorerInput
): Promise<AgentResult<ScorerOutput>> {
  const startTime = Date.now();
  
  try {
    // Calculate deterministic scores first
    const deterministicScores = calculateDeterministicScores(input);
    
    // Use AI for contextual scoring
    const aiScore = await generateAIScore(input, deterministicScores);
    
    return {
      success: true,
      data: aiScore,
      duration: Date.now() - startTime,
      tokensUsed: aiScore.tokensUsed,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Scorer failed',
      duration: Date.now() - startTime,
    };
  }
}

function calculateDeterministicScores(input: ScorerInput): ScoreBreakdown {
  const { audit, research, leadData } = input;
  
  // Digital Presence (0-25 points)
  let digitalPresence = 0;
  if (research.hasWebsite) digitalPresence += 5;
  if (research.hasSocialMedia) digitalPresence += 5;
  if (leadData.googleRating) digitalPresence += Math.round(leadData.googleRating * 2);
  if (leadData.googleReviewsCount > 10) digitalPresence += 5;
  if (leadData.googleReviewsCount > 50) digitalPresence += 5;
  
  // Website Quality (0-25 points)
  let websiteQuality = 0;
  if (audit.pagespeed) {
    websiteQuality += Math.round(audit.pagespeed.mobileScore / 4);
  }
  if (audit.seo) {
    websiteQuality += Math.round(audit.seo.score / 4);
  }
  
  // Conversion Potential (0-25 points)
  let conversionPotential = 0;
  if (audit.ux) {
    conversionPotential += Math.round(audit.ux.score / 3);
  }
  if (audit.conversion) {
    conversionPotential += Math.round(audit.conversion.score / 3);
  }
  
  // Market Opportunity (0-25 points)
  // Higher score = more opportunity (bad website = good opportunity for us)
  let marketOpportunity = 0;
  if (!research.hasWebsite) marketOpportunity += 10;  // No website = huge opportunity
  if (audit.pagespeed && audit.pagespeed.mobileScore < 50) marketOpportunity += 5;
  if (audit.seo && audit.seo.score < 50) marketOpportunity += 5;
  if (!research.hasOnlineBooking) marketOpportunity += 5;
  
  // Clamp values
  return {
    digitalPresence: Math.min(25, digitalPresence),
    websiteQuality: Math.min(25, websiteQuality),
    conversionPotential: Math.min(25, conversionPotential),
    marketOpportunity: Math.min(25, marketOpportunity),
  };
}

async function generateAIScore(
  input: ScorerInput,
  deterministicScores: ScoreBreakdown
): Promise<ScorerOutput> {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      adjustedScore: z.number().min(0).max(100),
      reasoning: z.string(),
      adjustments: z.array(z.object({
        factor: z.string(),
        impact: z.number(),
        reason: z.string(),
      })),
    }),
    prompt: `You are analyzing a dental clinic in Valencia, Spain to determine the business opportunity for offering them digital marketing services (landing pages, SEO, Google Ads).

Lead Information:
- Name: ${input.leadData.name}
- Website: ${input.leadData.website_url || 'No website'}
- Google Rating: ${input.leadData.google_rating || 'N/A'} (${input.leadData.google_reviews_count || 0} reviews)
- Has Instagram: ${input.research.hasSocialMedia}

Deterministic Scores:
- Digital Presence: ${deterministicScores.digitalPresence}/25
- Website Quality: ${deterministicScores.websiteQuality}/25
- Conversion Potential: ${deterministicScores.conversionPotential}/25
- Market Opportunity: ${deterministicScores.marketOpportunity}/25
- Total: ${Object.values(deterministicScores).reduce((a, b) => a + b, 0)}/100

Audit Results:
${JSON.stringify(input.audit, null, 2)}

Based on this analysis, provide:
1. An adjusted opportunity score (0-100) that considers:
   - High opportunity = bad website + good business indicators (many reviews, good rating)
   - Low opportunity = already excellent website (harder sell)
   - Medium opportunity = decent business but clear improvement areas
2. Detailed reasoning for the score
3. Any adjustments to the deterministic scores`,
    temperature: 0.3,
  });
  
  return {
    opportunityScore: object.adjustedScore,
    breakdown: deterministicScores,
    reasoning: object.reasoning,
  };
}
```

### Agent 5: Proposer (Content Generation)

```typescript
// lib/agents/proposer.ts

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function runProposer(
  input: ProposerInput
): Promise<AgentResult<ProposerOutput>> {
  const startTime = Date.now();
  
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),  // Premium for final output
      schema: z.object({
        subject: z.string().describe('Email subject line, max 60 chars, compelling'),
        body: z.string().describe('Full email body in Spanish, professional, personalized'),
        proposedService: z.string().describe('Main service to propose'),
        proposedPriceRange: z.string().describe('Estimated price range in euros'),
      }),
      prompt: `You are a B2B sales expert writing a personalized outreach email to a dental clinic in Valencia, Spain.

YOUR COMPANY: Valencia Studio — we create AI-powered landing pages and digital marketing solutions for local businesses.

RECIPIENT CLINIC:
- Name: ${input.leadData.name}
- Address: ${input.leadData.address}
- Website: ${input.leadData.website_url || 'No website'}
- Google Rating: ${input.leadData.google_rating || 'N/A'}
- Reviews: ${input.leadData.google_reviews_count || 0}

WEBSITE ANALYSIS:
${input.audit.aiSummary || 'No audit available'}

TOP ISSUES FOUND:
${JSON.stringify(input.audit.aiRecommendations?.slice(0, 3) || [], null, 2)}

OPPORTUNITY SCORE: ${input.score.opportunityScore}/100
REASONING: ${input.score.reasoning}

Write a personalized email that:
1. Opens with a genuine compliment about their clinic (use the rating/reviews data)
2. Points out 2-3 specific issues you found with their website (be specific, not generic)
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
      error: error instanceof Error ? error.message : 'Proposer failed',
      duration: Date.now() - startTime,
    };
  }
}
```

### Pipeline Orchestrator

```typescript
// lib/agents/pipeline.ts

import { createClient } from '@/lib/supabase/server';
import { runProspector } from './prospector';
import { runResearcher } from './researcher';
import { runAuditor } from './auditor';
import { runScorer } from './scorer';
import { runProposer } from './proposer';

export interface PipelineConfig {
  city: string;
  query: string;
  maxResults: number;
  runProspector?: boolean;
  runResearcher?: boolean;
  runAuditor?: boolean;
  runScorer?: boolean;
  runProposer?: boolean;
}

export async function runPipeline(config: PipelineConfig) {
  const supabase = await createClient();
  
  // Create pipeline run record
  const { data: run, error: runError } = await supabase
    .from('pipeline_runs')
    .insert({
      target_city: config.city,
      target_query: config.query,
      max_results: config.maxResults,
      status: 'running',
      current_step: 'prospecting',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (runError || !run) {
    throw new Error('Failed to create pipeline run');
  }
  
  try {
    let leads: any[] = [];
    
    // Step 1: Prospector
    if (config.runProspector !== false) {
      console.log('🔍 Running Prospector...');
      const prospectorResult = await runProspector({
        city: config.city,
        query: config.query,
        maxResults: config.maxResults,
      });
      
      if (!prospectorResult.success) {
        throw new Error(prospectorResult.error);
      }
      
      // Save leads to database
      for (const rawLead of prospectorResult.data!.leads) {
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('google_place_id', rawLead.placeId)
          .single();
        
        if (!existingLead) {
          const { data: newLead } = await supabase
            .from('leads')
            .insert({
              name: rawLead.name,
              google_place_id: rawLead.placeId,
              address: rawLead.address,
              phone: rawLead.phone,
              website_url: rawLead.website,
              google_rating: rawLead.rating,
              google_reviews_count: rawLead.reviewsCount,
              google_maps_url: rawLead.mapsUrl,
              latitude: rawLead.latitude,
              longitude: rawLead.longitude,
              has_website: !!rawLead.website,
              has_google_business: true,
              status: 'discovered',
              pipeline_run_id: run.id,
            })
            .select()
            .single();
          
          if (newLead) leads.push(newLead);
        }
      }
      
      await updateRun(supabase, run.id, {
        total_leads: leads.length,
        current_step: 'researching',
      });
    }
    
    // Step 2: Researcher
    if (config.runResearcher !== false) {
      console.log('🔬 Running Researcher...');
      for (const lead of leads) {
        if (!lead.website_url) continue;
        
        const researchResult = await runResearcher({
          leadId: lead.id,
          websiteUrl: lead.website_url,
          name: lead.name,
        });
        
        if (researchResult.success) {
          await supabase
            .from('leads')
            .update({
              instagram_url: researchResult.data!.socialMedia.instagram,
              facebook_url: researchResult.data!.socialMedia.facebook,
              twitter_url: researchResult.data!.socialMedia.twitter,
              has_social_media: researchResult.data!.digitalPresence.hasSocialMedia,
              status: 'researched',
              last_researched_at: new Date().toISOString(),
            })
            .eq('id', lead.id);
        }
      }
      
      await updateRun(supabase, run.id, {
        leads_processed: leads.length,
        current_step: 'auditing',
      });
    }
    
    // Step 3: Auditor
    if (config.runAuditor !== false) {
      console.log('📊 Running Auditor...');
      for (const lead of leads) {
        if (!lead.website_url) continue;
        
        const auditResult = await runAuditor({
          leadId: lead.id,
          websiteUrl: lead.website_url,
        });
        
        if (auditResult.success) {
          await supabase
            .from('web_audits')
            .insert({
              lead_id: lead.id,
              status: 'completed',
              pagespeed_mobile_score: auditResult.data!.pagespeed.mobileScore,
              pagespeed_desktop_score: auditResult.data!.pagespeed.desktopScore,
              seo_score: auditResult.data!.seo.score,
              ux_score: auditResult.data!.ux.score,
              content_score: auditResult.data!.content.score,
              conversion_score: auditResult.data!.conversion.score,
              has_meta_description: auditResult.data!.seo.hasMetaDescription,
              has_og_tags: auditResult.data!.seo.hasOgTags,
              has_sitemap: auditResult.data!.seo.hasSitemap,
              has_robots_txt: auditResult.data!.seo.hasRobotsTxt,
              has_ssl: auditResult.data!.seo.hasSsl,
              mobile_friendly: auditResult.data!.seo.mobileFriendly,
              has_cta_above_fold: auditResult.data!.ux.hasCtaAboveFold,
              has_testimonials: auditResult.data!.ux.hasTestimonials,
              has_contact_form: auditResult.data!.ux.hasContactForm,
              has_online_booking: auditResult.data!.ux.hasOnlineBooking,
              responsive_design: auditResult.data!.ux.responsiveDesign,
              ai_summary: auditResult.data!.aiSummary,
              ai_recommendations: auditResult.data!.aiRecommendations,
              page_title: auditResult.data!.content.pageTitle,
              meta_description: auditResult.data!.content.metaDescription,
              headings_structure: auditResult.data!.content.headings,
              image_count: auditResult.data!.content.imageCount,
              images_without_alt: auditResult.data!.content.imagesWithoutAlt,
              has_phone_number: auditResult.data!.conversion.hasPhoneNumber,
              has_email_visible: auditResult.data!.conversion.hasEmailVisible,
              has_map_embed: auditResult.data!.conversion.hasMapEmbed,
              completed_at: new Date().toISOString(),
            });
          
          await supabase
            .from('leads')
            .update({
              status: 'audited',
              last_audited_at: new Date().toISOString(),
            })
            .eq('id', lead.id);
        }
      }
      
      await updateRun(supabase, run.id, {
        leads_audited: leads.length,
        current_step: 'scoring',
      });
    }
    
    // Step 4: Scorer
    if (config.runScorer !== false) {
      console.log('🎯 Running Scorer...');
      for (const lead of leads) {
        const { data: audit } = await supabase
          .from('web_audits')
          .select('*')
          .eq('lead_id', lead.id)
          .single();
        
        if (!audit) continue;
        
        const scorerResult = await runScorer({
          leadId: lead.id,
          audit: audit,
          research: {
            hasSocialMedia: lead.has_social_media,
            hasOnlineBooking: audit.has_online_booking,
          },
          leadData: lead,
        });
        
        if (scorerResult.success) {
          await supabase
            .from('leads')
            .update({
              opportunity_score: scorerResult.data!.opportunityScore,
              score_breakdown: scorerResult.data!.breakdown,
              status: 'scored',
              last_scored_at: new Date().toISOString(),
            })
            .eq('id', lead.id);
        }
      }
      
      await updateRun(supabase, run.id, {
        leads_scored: leads.length,
        current_step: 'proposing',
      });
    }
    
    // Step 5: Proposer
    if (config.runProposer !== false) {
      console.log('✉️ Running Proposer...');
      const topLeads = leads
        .filter(l => l.opportunity_score && l.opportunity_score >= 50)
        .sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0))
        .slice(0, 10);  // Only propose for top 10 leads
      
      for (const lead of topLeads) {
        const { data: audit } = await supabase
          .from('web_audits')
          .select('*')
          .eq('lead_id', lead.id)
          .single();
        
        const { data: score } = await supabase
          .from('leads')
          .select('opportunity_score, score_breakdown')
          .eq('id', lead.id)
          .single();
        
        if (!audit || !score) continue;
        
        const proposerResult = await runProposer({
          leadId: lead.id,
          leadData: lead,
          audit: audit,
          score: {
            opportunityScore: score.opportunity_score,
            breakdown: score.score_breakdown,
            reasoning: '',
          },
        });
        
        if (proposerResult.success) {
          await supabase
            .from('proposals')
            .insert({
              lead_id: lead.id,
              subject: proposerResult.data!.subject,
              body: proposerResult.data!.body,
              proposed_service: proposerResult.data!.proposedService,
              proposed_price_range: proposerResult.data!.proposedPriceRange,
              model_used: 'gpt-4o',
              status: 'draft',
            });
          
          await supabase
            .from('leads')
            .update({ status: 'proposal_ready' })
            .eq('id', lead.id);
        }
      }
      
      await updateRun(supabase, run.id, {
        leads_proposed: topLeads.length,
        current_step: 'completed',
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    }
    
    return { success: true, runId: run.id };
  } catch (error) {
    await updateRun(supabase, run.id, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Pipeline failed',
    });
    
    return { success: false, error: error instanceof Error ? error.message : 'Pipeline failed' };
  }
}

async function updateRun(supabase: any, runId: string, updates: any) {
  await supabase
    .from('pipeline_runs')
    .update(updates)
    .eq('id', runId);
}
```

---

## 4. API Routes

### Route Structure

```
app/
├── api/
│   ├── leads/
│   │   ├── route.ts           # GET (list), POST (manual create)
│   │   └── [id]/
│   │       ├── route.ts       # GET (detail), PATCH (update), DELETE
│   │       └── audit/
│   │           └── route.ts   # POST (run audit)
│   ├── pipeline/
│   │   └── route.ts           # POST (start pipeline)
│   ├── proposals/
│   │   └── route.ts           # GET (list), POST (generate)
│   └── export/
│       └── route.ts           # GET (CSV export)
```

### API Route Implementations

```typescript
// app/api/leads/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateLeadSchema = z.object({
  name: z.string().min(1).max(200),
  website_url: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().default('Valencia'),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sort') || 'opportunity_score';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  
  let query = supabase
    .from('leads')
    .select('*, web_audits(*), proposals(*)', { count: 'exact' });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  }
  
  const { data, count, error } = await query
    .order(sortBy, { ascending: order === 'asc' })
    .range((page - 1) * limit, page * limit - 1);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    leads: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  
  const parsed = CreateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...parsed.data,
      is_manually_added: true,
      status: 'discovered',
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
}

// app/api/pipeline/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { runPipeline } from '@/lib/agents/pipeline';
import { z } from 'zod';

const PipelineSchema = z.object({
  city: z.string().default('Valencia'),
  query: z.string().default('dental clinics'),
  maxResults: z.number().min(1).max(100).default(20),
  steps: z.object({
    prospector: z.boolean().default(true),
    researcher: z.boolean().default(true),
    auditor: z.boolean().default(true),
    scorer: z.boolean().default(true),
    proposer: z.boolean().default(true),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const parsed = PipelineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  
  // Run pipeline in background (for MVP, we'll run synchronously)
  // In production, use a job queue (Inngest, Trigger.dev, etc.)
  const result = await runPipeline({
    city: parsed.data.city,
    query: parsed.data.query,
    maxResults: parsed.data.maxResults,
    runProspector: parsed.data.steps?.prospector,
    runResearcher: parsed.data.steps?.researcher,
    runAuditor: parsed.data.steps?.auditor,
    runScorer: parsed.data.steps?.scorer,
    runProposer: parsed.data.steps?.proposer,
  });
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  return NextResponse.json({ runId: result.runId, success: true });
}

// app/api/proposals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supababase = await createClient();
  const { searchParams } = new URL(request.url);
  
  const leadId = searchParams.get('leadId');
  const status = searchParams.get('status');
  
  let query = supabase
    .from('proposals')
    .select('*, leads(name, slug, website_url)');
  
  if (leadId) {
    query = query.eq('lead_id', leadId);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// app/api/export/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      name,
      address,
      phone,
      email,
      website_url,
      google_rating,
      google_reviews_count,
      opportunity_score,
      status,
      has_website,
      has_social_media,
      web_audits(pagespeed_mobile_score, seo_score, ux_score, conversion_score)
    `)
    .order('opportunity_score', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Convert to CSV
  const csvHeader = [
    'Name', 'Address', 'Phone', 'Email', 'Website',
    'Google Rating', 'Reviews', 'Opportunity Score', 'Status',
    'Has Website', 'Has Social', 'Mobile Score', 'SEO Score',
    'UX Score', 'Conversion Score'
  ].join(',');
  
  const csvRows = leads?.map(lead => [
    `"${lead.name}"`,
    `"${lead.address || ''}"`,
    lead.phone || '',
    lead.email || '',
    lead.website_url || '',
    lead.google_rating || '',
    lead.google_reviews_count || '',
    lead.opportunity_score || '',
    lead.status,
    lead.has_website ? 'Yes' : 'No',
    lead.has_social_media ? 'Yes' : 'No',
    lead.web_audits?.[0]?.pagespeed_mobile_score || '',
    lead.web_audits?.[0]?.seo_score || '',
    lead.web_audits?.[0]?.ux_score || '',
    lead.web_audits?.[0]?.conversion_score || '',
  ].join(','));
  
  const csv = [csvHeader, ...(csvRows || [])].join('\n');
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
```

---

## 5. Dashboard UI

### Screen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Valencia Studio              [Dashboard] [Leads] [Proposals]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Total Leads │ │ High Priority│ │ Audited    │ │ Converted  │ │
│  │     47      │ │     12       │ │     35     │ │      3     │ │
│  │  +12 today  │ │  Score > 80  │ │  74% done  │ │  6.4%      │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Pipeline Control                                            │   │
│  │  [▶ Run New Pipeline]  City: [Valencia ▼]  Query: [____]   │   │
│  │  Max Results: [20 ▼]   Steps: [✓] All                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Leads Table                                                 │   │
│  │  ┌───┬──────────────┬──────────┬────────┬───────┬────────┐  │   │
│  │  │ # │ Name         │ Score    │ Status │ Audit │ Action │  │   │
│  │  ├───┼──────────────┼──────────┼────────┼───────┼────────┤  │   │
│  │  │ 1 │ Clínica牙    │   92     │ Ready  │  85   │ View ▼ │  │   │
│  │  │ 2 │ Dr. Martínez │   87     │ Scored │  72   │ View ▼ │  │   │
│  │  │ 3 │ DentalVLC    │   78     │ Audited│  68   │ View ▼ │  │   │
│  │  └───┴──────────────┴──────────┴────────┴───────┴────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
components/
├── features/
│   ├── dashboard/
│   │   ├── DashboardPage.tsx          # Main dashboard layout
│   │   ├── StatsCards.tsx             # Summary statistics
│   │   ├── PipelineControl.tsx        # Pipeline trigger UI
│   │   ├── LeadsTable.tsx             # Leads list with sorting/filtering
│   │   ├── LeadDetail.tsx             # Individual lead view
│   │   ├── AuditView.tsx              # Audit results display
│   │   ├── ProposalView.tsx           # Proposal preview/edit
│   │   ├── ScoreBreakdown.tsx         # Visual score breakdown
│   │   └── PipelineStatus.tsx         # Real-time pipeline progress
│   └── shared/
│       ├── DataTable.tsx              # Reusable table component
│       ├── ScoreBadge.tsx             # Color-coded score display
│       ├── StatusBadge.tsx            # Status indicator
│       └── ExportButton.tsx           # CSV export trigger
```

### Key Components

```typescript
// components/features/dashboard/StatsCards.tsx

export function StatsCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_leads}</div>
          <p className="text-xs text-muted-foreground">
            +{summary.discovered_count} new today
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {summary.high_priority_count}
          </div>
          <p className="text-xs text-muted-foreground">
            Score {'>'} 80
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.avg_score}</div>
          <p className="text-xs text-muted-foreground">
            Across all leads
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proposals Ready</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.proposal_ready_count}
          </div>
          <p className="text-xs text-muted-foreground">
            Ready to send
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// components/features/dashboard/ScoreBreakdown.tsx

export function ScoreBreakdown({ score, breakdown }: ScoreBreakdownProps) {
  const categories = [
    { name: 'Digital Presence', score: breakdown.digitalPresence, max: 25, color: 'bg-blue-500' },
    { name: 'Website Quality', score: breakdown.websiteQuality, max: 25, color: 'bg-green-500' },
    { name: 'Conversion Potential', score: breakdown.conversionPotential, max: 25, color: 'bg-purple-500' },
    { name: 'Market Opportunity', score: breakdown.marketOpportunity, max: 25, color: 'bg-orange-500' },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Opportunity Score</h3>
        <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'outline'}>
          {score}/100
        </Badge>
      </div>
      
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.name}</span>
              <span className="font-medium">{cat.score}/{cat.max}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${cat.color}`}
                style={{ width: `${(cat.score / cat.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. External APIs & Services

### API Comparison

| Service | Purpose | Cost | Free Tier | Recommendation |
|---------|---------|------|-----------|----------------|
| **Google Places API** | Lead discovery | $200/mo per 1000 requests | $200 credit/month | ✅ Use |
| **PageSpeed Insights** | Website audit | Free | Unlimited | ✅ Use |
| **OpenAI GPT-4o-mini** | Analysis + scoring | $0.15/$0.60 per 1M tokens | Pay-as-you-go | ✅ Use |
| **OpenAI GPT-4o** | Proposal generation | $2.50/$10.00 per 1M tokens | Pay-as-you-go | ✅ Use |
| **Playwright** | Web scraping | Free (self-hosted) | N/A | ✅ Use |
| **Supabase** | Database + Auth | Free tier: 500MB | 50K MAU | ✅ Use |

### Google Places API Setup

```typescript
// lib/google/places.ts

import { google } from 'googleapis';

const placesClient = google.places('v1');

export async function searchDentalClinics(
  city: string,
  query: string = 'dental clinics'
): Promise<PlaceResult[]> {
  const results: PlaceResult[] = [];
  let pageToken: string | undefined;
  
  do {
    const response = await placesClient.places.textSearch({
      params: {
        query: `${query} in ${city}`,
        key: process.env.GOOGLE_PLACES_API_KEY!,
        type: 'dentist',
        language: 'es',
        location: '39.4699,-0.3763',  // Valencia
        radius: 50000,
        pagetoken: pageToken,
      },
    });
    
    for (const place of response.data.results || []) {
      results.push({
        name: place.name || '',
        placeId: place.place_id || '',
        address: place.formatted_address || '',
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        reviewsCount: place.user_ratings_total,
        mapsUrl: place.url,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
      });
    }
    
    pageToken = response.data.next_page_token;
    if (pageToken) await sleep(2000);  // Required delay for next page
  } while (pageToken);
  
  return results;
}
```

---

## 7. AI Integration

### Cost-Optimized Model Strategy

| Task | Model | Reason | Cost per 1000 leads |
|------|-------|--------|---------------------|
| Website analysis | GPT-4o-mini | Structured output, simple analysis | ~$0.50 |
| Opportunity scoring | GPT-4o-mini | Classification task | ~$0.30 |
| Proposal generation | GPT-4o | High-quality, personalized content | ~$2.00 |
| **Total per 1000 leads** | | | **~$2.80** |

### Vercel AI SDK Integration

```typescript
// lib/ai/client.ts

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// Model selection based on task complexity
export function selectModel(task: 'simple' | 'moderate' | 'complex') {
  const models = {
    simple: openai('gpt-4o-mini'),      // Analysis, scoring
    moderate: openai('gpt-4o-mini'),    // Structured output
    complex: openai('gpt-4o'),          // Proposal generation
  };
  return models[task];
}

// Fallback chain
export const MODEL_FALLBACK = [
  openai('gpt-4o-mini'),
  anthropic('claude-3-5-haiku-latest'),
];
```

---

## 8. File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Main dashboard
│   │   │   ├── loading.tsx                 # Loading skeleton
│   │   │   └── components/
│   │   │       ├── StatsCards.tsx
│   │   │       ├── PipelineControl.tsx
│   │   │       ├── LeadsTable.tsx
│   │   │       └── PipelineStatus.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx                    # Leads list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx                # Lead detail
│   │   │   │   ├── audit/
│   │   │   │   │   └── page.tsx            # Audit results
│   │   │   │   └── proposal/
│   │   │   │       └── page.tsx            # Proposal view
│   │   │   └── components/
│   │   │       ├── LeadDetail.tsx
│   │   │       ├── AuditView.tsx
│   │   │       ├── ProposalView.tsx
│   │   │       └── ScoreBreakdown.tsx
│   │   └── layout.tsx                      # Dashboard shell
│   ├── api/
│   │   ├── leads/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── audit/
│   │   │           └── route.ts
│   │   ├── pipeline/
│   │   │   └── route.ts
│   │   ├── proposals/
│   │   │   └── route.ts
│   │   └── export/
│   │       └── route.ts
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Landing page (existing)
│   └── globals.css
├── components/
│   ├── ui/                                 # shadcn/ui (existing)
│   └── features/
│       ├── landing/                        # Existing landing components
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   └── RegisterForm.tsx
│       ├── dashboard/
│       │   ├── StatsCards.tsx
│       │   ├── PipelineControl.tsx
│       │   ├── LeadsTable.tsx
│       │   ├── LeadDetail.tsx
│       │   ├── AuditView.tsx
│       │   ├── ProposalView.tsx
│       │   ├── ScoreBreakdown.tsx
│       │   └── PipelineStatus.tsx
│       └── shared/
│           ├── DataTable.tsx
│           ├── ScoreBadge.tsx
│           ├── StatusBadge.tsx
│           └── ExportButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser client
│   │   ├── server.ts                       # Server client
│   │   └── middleware.ts                   # Auth middleware
│   ├── agents/
│   │   ├── types.ts                        # Agent type definitions
│   │   ├── prospector.ts                   # Discovery agent
│   │   ├── researcher.ts                   # Research agent
│   │   ├── auditor.ts                      # Audit agent
│   │   ├── scorer.ts                       # Scoring agent
│   │   ├── proposer.ts                     # Proposal agent
│   │   └── pipeline.ts                     # Pipeline orchestrator
│   ├── google/
│   │   └── places.ts                       # Google Places API
│   ├── ai/
│   │   └── client.ts                       # Vercel AI SDK config
│   └── utils.ts                            # Existing utils
├── hooks/
│   ├── useLeads.ts                         # Leads data fetching
│   ├── usePipeline.ts                      # Pipeline management
│   └── useAuth.ts                          # Auth hook
├── types/
│   └── index.ts                            # Shared TypeScript types
├── middleware.ts                            # Next.js middleware
└── public/                                 # Static assets (existing)
```

---

## 9. Dependencies

### New Dependencies to Install

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr
npm install ai @ai-sdk/openai
npm install googleapis
npm install playwright
npm install zod

# UI enhancements (optional)
npm install @tanstack/react-table  # For advanced table features
npm install recharts               # For charts/graphs
npm install react-hook-form        # For forms
npm install @hookform/resolvers    # Zod integration
```

### Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Places API
GOOGLE_PLACES_API_KEY=your-places-api-key

# OpenAI (via Vercel AI SDK)
OPENAI_API_KEY=your-openai-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Sprint Breakdown

### Week 1: Foundation + Pipeline

**Day 1-2: Infrastructure Setup**
- [ ] Initialize Supabase project
- [ ] Run database migrations
- [ ] Set up Supabase clients (browser, server, admin)
- [ ] Configure middleware for auth
- [ ] Install all dependencies
- [ ] Set up environment variables

**Day 3: Auth System**
- [ ] Create login/register pages
- [ ] Implement email/password auth
- [ ] Set up auth middleware
- [ ] Create profile management

**Day 4-5: Agent Pipeline**
- [ ] Implement Prospector agent
- [ ] Implement Researcher agent
- [ ] Implement Auditor agent
- [ ] Implement Scorer agent
- [ ] Implement Proposer agent
- [ ] Create pipeline orchestrator
- [ ] Test with manual leads first

**Day 6-7: API Routes**
- [ ] Create leads CRUD endpoints
- [ ] Create pipeline trigger endpoint
- [ ] Create proposals endpoints
- [ ] Create export endpoint
- [ ] Test all endpoints

### Week 2: Dashboard + Polish

**Day 8-9: Dashboard UI**
- [ ] Create dashboard layout
- [ ] Build StatsCards component
- [ ] Build PipelineControl component
- [ ] Build LeadsTable component
- [ ] Build LeadDetail view
- [ ] Build AuditView component
- [ ] Build ProposalView component

**Day 10-11: Interactivity**
- [ ] Add real-time pipeline status
- [ ] Implement filtering/sorting
- [ ] Add search functionality
- [ ] Implement CSV export
- [ ] Add manual lead input form

**Day 12-13: Polish & Testing**
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty states
- [ ] Mobile responsive testing
- [ ] Fix any bugs

**Day 14: Deploy**
- [ ] Deploy to Vercel
- [ ] Configure production environment
- [ ] Test production deployment
- [ ] Document setup instructions

---

## 11. Risk Analysis

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Places API rate limits | Pipeline fails | Implement exponential backoff, batch requests |
| Playwright crashes on complex sites | Audit fails | Add try/catch, timeout handling, fallback to PageSpeed only |
| AI hallucinations in proposals | Bad proposals | Add human review step, validate output schema |
| Supabase free tier limits | Data loss | Monitor usage, upgrade plan if needed |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Website blocks scraping | Research fails | Rotate user agents, respect robots.txt |
| PageSpeed Insights slow | Pipeline takes long | Run audits in parallel, cache results |
| AI costs exceed budget | Unexpected bill | Set token budgets per task, monitor usage |
| Next.js 16 API changes | Build errors | Pin versions, test early |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| TypeScript type errors | Build fails | Strict mode, generated types |
| Tailwind v4 breaking changes | Styling issues | Use stable utilities |
| shadcn/ui updates | Component issues | Pin versions, test updates |

---

## 12. Cost Projections

### Monthly Costs (MVP)

| Service | Usage | Cost |
|---------|-------|------|
| **Supabase Free** | 500MB DB, 50K MAU | $0 |
| **Vercel Free** | 100GB bandwidth | $0 |
| **Google Places API** | 1000 requests/month | $0 (free tier) |
| **PageSpeed Insights** | 1000 audits/month | $0 (free) |
| **OpenAI GPT-4o-mini** | ~500K tokens | ~$0.10 |
| **OpenAI GPT-4o** | ~200K tokens | ~$0.50 |
| **Total MVP** | | **~$0.60/month** |

### Scale Costs (1000 leads/month)

| Service | Usage | Cost |
|---------|-------|------|
| **Supabase Pro** | 8GB DB | $25 |
| **Vercel Pro** | 1TB bandwidth | $20 |
| **Google Places API** | 10K requests | $200 |
| **OpenAI** | 5M tokens | ~$5 |
| **Total Scale** | | **~$250/month** |

---

## Implementation Priority

### MVP Must-Haves (Week 1-2)

1. ✅ Supabase setup + database schema
2. ✅ Auth (login/register)
3. ✅ Manual lead input
4. ✅ Prospector agent (Google Places)
5. ✅ Auditor agent (PageSpeed + Playwright)
6. ✅ Scorer agent (AI analysis)
7. ✅ Proposer agent (AI content)
8. ✅ Pipeline orchestrator
9. ✅ Dashboard with leads table
10. ✅ Lead detail view

### Post-MVP Enhancements

1. Real-time pipeline updates (WebSocket)
2. Email integration (send proposals directly)
3. Multi-city support
4. Custom scoring rules
5. Team collaboration
6. API access for integrations
7. Advanced analytics
8. Mobile app

---

*Architecture designed by Valencia Studio CTO*
*Last updated: 2026-07-23*
