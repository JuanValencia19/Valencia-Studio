import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { ProposalDocument } from "@/lib/pdf/ProposalDocument";
import { LeadReportDocument } from "@/lib/pdf/LeadReportDocument";
import { renderToBuffer } from "@react-pdf/renderer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "report";

    const { data: lead, error: leadError } = await auth.supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const leadData = {
      id: lead.id,
      name: lead.name,
      slug: lead.slug,
      phone: lead.phone,
      email: lead.email,
      website_url: lead.website_url,
      address: lead.address,
      city: lead.city,
      postal_code: lead.postal_code,
      latitude: lead.latitude,
      longitude: lead.longitude,
      google_place_id: lead.google_place_id,
      google_rating: lead.google_rating,
      google_reviews_count: lead.google_reviews_count,
      google_maps_url: lead.google_maps_url,
      instagram_url: lead.instagram_url,
      facebook_url: lead.facebook_url,
      twitter_url: lead.twitter_url,
      has_website: lead.has_website,
      has_google_business: lead.has_google_business,
      has_social_media: lead.has_social_media,
      opportunity_score: lead.opportunity_score,
      score_breakdown: lead.score_breakdown,
      status: lead.status,
      pipeline_run_id: lead.pipeline_run_id,
      industry_id: lead.industry_id,
      is_manually_added: lead.is_manually_added,
      notes: lead.notes,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      last_researched_at: lead.last_researched_at,
      last_audited_at: lead.last_audited_at,
      last_scored_at: lead.last_scored_at,
    };

    let pdfBuffer: Buffer;

    if (type === "proposal") {
      const { data: proposal } = await auth.supabase
        .from("proposals")
        .select("body")
        .eq("lead_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!proposal) {
        return NextResponse.json(
          { error: "No proposal found" },
          { status: 404 }
        );
      }

      const doc = ProposalDocument({
        lead: leadData,
        proposal: proposal.body,
      });
      pdfBuffer = await renderToBuffer(doc);
    } else {
      const { data: contacts } = await auth.supabase
        .from("contact_attempts")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false });

      const { data: proposal } = await auth.supabase
        .from("proposals")
        .select("body")
        .eq("lead_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const doc = LeadReportDocument({
        lead: leadData,
        proposal: proposal?.body,
        contacts: (contacts || []).map((c) => ({
          id: c.id,
          lead_id: c.lead_id,
          proposal_id: c.proposal_id,
          user_id: c.user_id,
          channel: c.channel,
          contact_type: c.contact_type,
          message: c.message,
          outcome: c.outcome,
          status: c.status,
          sentiment: c.sentiment,
          response_received: c.response_received,
          response_summary: c.response_summary,
          next_action: c.next_action,
          next_action_date: c.next_action_date,
          attachments: c.attachments || [],
          metadata: c.metadata || {},
          follow_up_date: c.follow_up_date,
          created_at: c.created_at,
        })),
      });
      pdfBuffer = await renderToBuffer(doc);
    }

    const filename =
      type === "proposal"
        ? `propuesta-${lead.name.replace(/\s+/g, "-").toLowerCase()}.pdf`
        : `reporte-${lead.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
