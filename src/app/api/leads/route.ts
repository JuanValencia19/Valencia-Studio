import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { dispatchWebhook } from "@/lib/webhooks/dispatcher";
import { z } from "zod";

const CreateLeadSchema = z.object({
  name: z.string().min(1).max(200),
  website_url: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().default("Valencia"),
  industry_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const industryId = searchParams.get("industry_id");
  const sortBy = searchParams.get("sort") || "opportunity_score";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  let query = auth.supabase
    .from("leads")
    .select("*, web_audits(*), proposals(*), industries(id, name, icon)", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  if (industryId) {
    query = query.eq("industry_id", industryId);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order(sortBy, { ascending: order === "asc" })
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
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const body = await request.json();

  const parsed = CreateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("leads")
    .insert({
      ...parsed.data,
      website_url: parsed.data.website_url || null,
      is_manually_added: true,
      status: "discovered",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await dispatchWebhook("lead.created", {
    lead: data,
    userId: auth.user!.id,
  });

  return NextResponse.json(data, { status: 201 });
}
