import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod";

const CreateIndustrySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(10).optional(),
  search_queries: z.array(z.string()).min(1),
  prospecting_prompt: z.string().optional(),
  research_prompt: z.string().optional(),
  proposal_template: z.string().optional(),
  scoring_weights: z
    .object({
      digitalPresence: z.number().min(0).max(2).optional(),
      websiteQuality: z.number().min(0).max(2).optional(),
      conversionPotential: z.number().min(0).max(2).optional(),
      marketOpportunity: z.number().min(0).max(2).optional(),
    })
    .optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("industries")
    .select("*")
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();

  const parsed = CreateIndustrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Generate slug from name
  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const { data, error } = await auth.supabase
    .from("industries")
    .insert({
      user_id: auth.user!.id,
      name: parsed.data.name,
      slug,
      icon: parsed.data.icon || null,
      search_queries: parsed.data.search_queries,
      prospecting_prompt: parsed.data.prospecting_prompt || null,
      research_prompt: parsed.data.research_prompt || null,
      proposal_template: parsed.data.proposal_template || null,
      scoring_weights: parsed.data.scoring_weights || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
