import { createAdminClient } from "@/lib/supabase/admin";
import { runProspector } from "./prospector";
import { runResearcher } from "./researcher";
import { runAuditor } from "./auditor";
import { runScorer } from "./scorer";
import { runProposer } from "./proposer";

export interface PipelineConfig {
  city: string;
  query: string;
  maxResults: number;
  industryId?: string;
  location?: string;
  radius?: number;
  placeType?: string;
  queries?: string[];
  runProspector?: boolean;
  runResearcher?: boolean;
  runAuditor?: boolean;
  runScorer?: boolean;
  runProposer?: boolean;
}

async function updateRun(
  supabase: ReturnType<typeof createAdminClient>,
  runId: string,
  updates: Record<string, unknown>
) {
  await supabase.from("pipeline_runs").update(updates).eq("id", runId);
}

export async function runPipeline(config: PipelineConfig) {
  const supabase = createAdminClient();

  // Fetch industry config if industryId is provided
  let industryConfig: {
    search_queries: string[];
    prospecting_prompt: string | null;
    research_prompt: string | null;
    proposal_template: string | null;
    scoring_weights: Record<string, number> | null;
  } | null = null;

  if (config.industryId) {
    const { data: industry } = await supabase
      .from("industries")
      .select("search_queries, prospecting_prompt, research_prompt, proposal_template, scoring_weights")
      .eq("id", config.industryId)
      .single();

    industryConfig = industry;
  }

  const { data: run, error: runError } = await supabase
    .from("pipeline_runs")
    .insert({
      target_city: config.city,
      target_query: config.query,
      max_results: config.maxResults,
      status: "running",
      current_step: "prospecting",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (runError || !run) {
    throw new Error("Failed to create pipeline run");
  }

  try {
    const leads: Array<{ id: string; website_url: string | null; [key: string]: unknown }> = [];

    // Step 1: Prospector
    if (config.runProspector !== false) {
      const prospectorResult = await runProspector({
        city: config.city,
        query: config.query,
        maxResults: config.maxResults,
        location: config.location,
        radius: config.radius,
        placeType: config.placeType,
        queries: config.queries,
      });

      if (!prospectorResult.success) {
        throw new Error(prospectorResult.error);
      }

      for (const rawLead of prospectorResult.data!.leads) {
        const { data: existingLead } = await supabase
          .from("leads")
          .select("id")
          .eq("google_place_id", rawLead.placeId)
          .single();

        if (!existingLead) {
          const { data: newLead } = await supabase
            .from("leads")
            .insert({
              name: rawLead.name,
              google_place_id: rawLead.placeId,
              address: rawLead.address,
              phone: rawLead.phone,
              website_url: rawLead.website,
              google_rating: rawLead.rating,
              google_reviews_count: rawLead.reviewsCount || 0,
              google_maps_url: rawLead.mapsUrl,
              latitude: rawLead.latitude,
              longitude: rawLead.longitude,
              has_website: !!rawLead.website,
              has_google_business: true,
              industry_id: config.industryId || null,
              status: "discovered",
              pipeline_run_id: run.id,
            })
            .select()
            .single();

          if (newLead) leads.push(newLead);
        }
      }

      await updateRun(supabase, run.id, {
        total_leads: leads.length,
        current_step: "researching",
      });
    }

    // Step 2: Researcher
    if (config.runResearcher !== false) {
      for (const lead of leads) {
        const researchResult = await runResearcher({
          leadId: lead.id,
          websiteUrl: lead.website_url || undefined,
          name: lead.name as string,
        });

        if (researchResult.success) {
          await supabase
            .from("leads")
            .update({
              instagram_url: researchResult.data!.socialMedia.instagram,
              facebook_url: researchResult.data!.socialMedia.facebook,
              twitter_url: researchResult.data!.socialMedia.twitter,
              has_social_media:
                researchResult.data!.digitalPresence.hasSocialMedia,
              status: "researched",
              last_researched_at: new Date().toISOString(),
            })
            .eq("id", lead.id);
        }
      }

      await updateRun(supabase, run.id, {
        leads_processed: leads.length,
        current_step: "auditing",
      });
    }

    // Step 3: Auditor
    const leadsWithWebsite = leads.filter((l) => l.website_url);

    if (config.runAuditor !== false) {
      for (const lead of leadsWithWebsite) {
        const auditResult = await runAuditor({
          leadId: lead.id,
          websiteUrl: lead.website_url!,
        });

        if (auditResult.success) {
          const d = auditResult.data!;
          await supabase.from("web_audits").insert({
            lead_id: lead.id,
            status: "completed",
            pagespeed_mobile_score: d.pagespeed.mobileScore,
            pagespeed_desktop_score: d.pagespeed.desktopScore,
            first_contentful_paint: d.pagespeed.metrics.fcp,
            largest_contentful_paint: d.pagespeed.metrics.lcp,
            total_blocking_time: d.pagespeed.metrics.tbt,
            cumulative_layout_shift: d.pagespeed.metrics.cls,
            speed_index: d.pagespeed.metrics.si,
            seo_score: d.seo.score,
            has_meta_description: d.seo.hasMetaDescription,
            has_og_tags: d.seo.hasOgTags,
            has_sitemap: d.seo.hasSitemap,
            has_robots_txt: d.seo.hasRobotsTxt,
            has_ssl: d.seo.hasSsl,
            mobile_friendly: d.seo.mobileFriendly,
            ux_score: d.ux.score,
            has_cta_above_fold: d.ux.hasCtaAboveFold,
            has_testimonials: d.ux.hasTestimonials,
            has_contact_form: d.ux.hasContactForm,
            has_whatsapp_button: d.ux.hasWhatsApp,
            has_online_booking: d.ux.hasOnlineBooking,
            responsive_design: d.ux.responsiveDesign,
            content_score: d.content.score,
            page_title: d.content.pageTitle,
            meta_description: d.content.metaDescription,
            headings_structure: d.content.headings,
            image_count: d.content.imageCount,
            images_without_alt: d.content.imagesWithoutAlt,
            conversion_score: d.conversion.score,
            has_phone_number: d.conversion.hasPhoneNumber,
            has_email_visible: d.conversion.hasEmailVisible,
            has_map_embed: d.conversion.hasMapEmbed,
            ai_summary: d.aiSummary,
            ai_recommendations: d.aiRecommendations,
            completed_at: new Date().toISOString(),
          });

          await supabase
            .from("leads")
            .update({
              status: "audited",
              last_audited_at: new Date().toISOString(),
            })
            .eq("id", lead.id);
        }
      }

      await updateRun(supabase, run.id, {
        leads_audited: leadsWithWebsite.length,
        current_step: "scoring",
      });
    }

    // Step 4: Scorer
    if (config.runScorer !== false) {
      for (const lead of leads) {
        const { data: audit } = await supabase
          .from("web_audits")
          .select("*")
          .eq("lead_id", lead.id)
          .single();

        if (!audit) continue;

        const scorerResult = await runScorer({
          leadId: lead.id,
          audit,
          research: {
            hasSocialMedia: lead.has_social_media as boolean,
            hasOnlineBooking: audit.has_online_booking || false,
          },
          leadData: {
            name: lead.name as string,
            website_url: lead.website_url,
            google_rating: lead.google_rating as number | null,
            google_reviews_count: (lead.google_reviews_count as number) || 0,
          },
          scoringWeights: industryConfig?.scoring_weights || null,
        });

        if (scorerResult.success) {
          await supabase
            .from("leads")
            .update({
              opportunity_score: scorerResult.data!.opportunityScore,
              score_breakdown: scorerResult.data!.breakdown,
              status: "scored",
              last_scored_at: new Date().toISOString(),
            })
            .eq("id", lead.id);
        }
      }

      await updateRun(supabase, run.id, {
        leads_scored: leads.length,
        current_step: "proposing",
      });
    }

    // Step 5: Proposer
    if (config.runProposer !== false) {
      const { data: scoredLeads } = await supabase
        .from("leads")
        .select("*")
        .eq("pipeline_run_id", run.id)
        .not("opportunity_score", "is", null)
        .gte("opportunity_score", 50)
        .order("opportunity_score", { ascending: false })
        .limit(10);

      if (scoredLeads) {
        for (const lead of scoredLeads) {
          const { data: audit } = await supabase
            .from("web_audits")
            .select("*")
            .eq("lead_id", lead.id)
            .single();

          if (!audit) continue;

          const proposerResult = await runProposer({
            leadId: lead.id,
            leadData: {
              name: lead.name,
              address: lead.address,
              website_url: lead.website_url,
              google_rating: lead.google_rating,
              google_reviews_count: lead.google_reviews_count,
            },
            audit,
            score: {
              opportunityScore: lead.opportunity_score,
              breakdown: lead.score_breakdown,
              reasoning: "",
            },
            proposalTemplate: industryConfig?.proposal_template || null,
          });

          if (proposerResult.success) {
            await supabase.from("proposals").insert({
              lead_id: lead.id,
              subject: proposerResult.data!.subject,
              body: proposerResult.data!.body,
              proposed_service: proposerResult.data!.proposedService,
              proposed_price_range: proposerResult.data!.proposedPriceRange,
              model_used: "gpt-4o",
              status: "draft",
            });

            await supabase
              .from("leads")
              .update({ status: "proposal_ready" })
              .eq("id", lead.id);
          }
        }

        await updateRun(supabase, run.id, {
          leads_proposed: scoredLeads.length,
          current_step: "completed",
          status: "completed",
          completed_at: new Date().toISOString(),
        });
      }
    }

    return { success: true, runId: run.id };
  } catch (error) {
    await updateRun(supabase, run.id, {
      status: "failed",
      error_message: error instanceof Error ? error.message : "Pipeline failed",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Pipeline failed",
    };
  }
}
