import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);

  const leadId = searchParams.get("leadId");
  const status = searchParams.get("status");

  let query = auth.supabase
    .from("proposals")
    .select("*, leads(name, slug, website_url)");

  if (leadId) {
    query = query.eq("lead_id", leadId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
