import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod";

const UpdateContactSchema = z.object({
  status: z.enum(["pending", "sent", "delivered", "opened", "replied", "bounced"]).optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  response_received: z.boolean().optional(),
  response_summary: z.string().optional(),
  outcome: z.string().optional(),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { contactId } = await params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();

  const parsed = UpdateContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("contact_attempts")
    .update(parsed.data)
    .eq("id", contactId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const { contactId } = await params;
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { error } = await auth.supabase
    .from("contact_attempts")
    .delete()
    .eq("id", contactId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
