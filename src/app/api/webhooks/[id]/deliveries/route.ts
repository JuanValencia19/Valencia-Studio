import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    // Verify webhook belongs to user
    const { data: webhook } = await auth.supabase
      .from("webhooks")
      .select("id")
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .single();

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const { data: deliveries, error } = await auth.supabase
      .from("webhook_deliveries")
      .select("*")
      .eq("webhook_id", id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Webhook deliveries GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
