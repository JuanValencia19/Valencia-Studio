import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { data: webhook, error } = await auth.supabase
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .single();

    if (error || !webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { name, url, events, is_active, secret } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (url !== undefined) updates.url = url;
    if (events !== undefined) updates.events = events;
    if (is_active !== undefined) updates.is_active = is_active;
    if (secret !== undefined) updates.secret = secret;

    const { data: webhook, error } = await auth.supabase
      .from("webhooks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("Webhook PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { error } = await auth.supabase
      .from("webhooks")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user!.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
