import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data: leads, error } = await auth.supabase
    .from("leads")
    .select(
      `
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
    `
    )
    .order("opportunity_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csvHeader = [
    "Name",
    "Address",
    "Phone",
    "Email",
    "Website",
    "Google Rating",
    "Reviews",
    "Opportunity Score",
    "Status",
    "Has Website",
    "Has Social",
    "Mobile Score",
    "SEO Score",
    "UX Score",
    "Conversion Score",
  ].join(",");

  const csvRows =
    leads?.map((lead) =>
      [
        `"${lead.name}"`,
        `"${lead.address || ""}"`,
        lead.phone || "",
        lead.email || "",
        lead.website_url || "",
        lead.google_rating || "",
        lead.google_reviews_count || "",
        lead.opportunity_score || "",
        lead.status,
        lead.has_website ? "Yes" : "No",
        lead.has_social_media ? "Yes" : "No",
        lead.web_audits?.[0]?.pagespeed_mobile_score || "",
        lead.web_audits?.[0]?.seo_score || "",
        lead.web_audits?.[0]?.ux_score || "",
        lead.web_audits?.[0]?.conversion_score || "",
      ].join(",")
    ) || [];

  const csv = [csvHeader, ...csvRows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
