import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { z } from "zod";

const CreateContactSchema = z.object({
  contact_type: z.enum(["email", "phone", "whatsapp", "linkedin", "other"]).default("email"),
  message: z.string().optional(),
  outcome: z.string().optional(),
  status: z.enum(["pending", "sent", "delivered", "opened", "replied", "bounced"]).default("pending"),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  response_received: z.boolean().default(false),
  response_summary: z.string().optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
  proposal_id: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("contact_attempts")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  const parsed = CreateContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("contact_attempts")
    .insert({
      lead_id: id,
      user_id: auth.user!.id,
      channel: parsed.data.contact_type,
      contact_type: parsed.data.contact_type,
      message: parsed.data.message || null,
      outcome: parsed.data.outcome || null,
      status: parsed.data.status,
      sentiment: parsed.data.sentiment || null,
      response_received: parsed.data.response_received,
      response_summary: parsed.data.response_summary || null,
      next_action: parsed.data.next_action || null,
      next_action_date: parsed.data.next_action_date || null,
      proposal_id: parsed.data.proposal_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { count } = await auth.supabase
    .from("contact_attempts")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", id);

  if (count === 1) {
    await auth.supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", id);
  }

  return NextResponse.json(data, { status: 201 });
}
