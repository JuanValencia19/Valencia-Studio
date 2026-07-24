import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { runAuditor } from "@/lib/agents/auditor";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  const { data: lead, error: leadError } = await auth.supabase
    .from("leads")
    .select("id, website_url")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (!lead.website_url) {
    return NextResponse.json(
      { error: "Lead has no website to audit" },
      { status: 400 }
    );
  }

  await auth.supabase.from("web_audits").delete().eq("lead_id", id);

  const auditResult = await runAuditor({
    leadId: id,
    websiteUrl: lead.website_url,
  });

  if (!auditResult.success) {
    return NextResponse.json({ error: auditResult.error }, { status: 500 });
  }

  const d = auditResult.data!;
  const { data: audit, error: auditError } = await auth.supabase
    .from("web_audits")
    .insert({
      lead_id: id,
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
    })
    .select()
    .single();

  if (auditError) {
    return NextResponse.json({ error: auditError.message }, { status: 500 });
  }

  await auth.supabase
    .from("leads")
    .update({ status: "audited", last_audited_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json(audit);
}
