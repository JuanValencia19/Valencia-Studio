import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { generateWebhookSecret } from "@/lib/webhooks/dispatcher";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { data: webhooks, error } = await auth.supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", auth.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error("Webhooks GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { name, url, events, secret } = body;

    if (!name || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Name, url, and events array are required" },
        { status: 400 }
      );
    }

    // Generate secret if not provided
    const webhookSecret = secret || generateWebhookSecret();

    const { data: webhook, error } = await auth.supabase
      .from("webhooks")
      .insert({
        user_id: auth.user!.id,
        name,
        url,
        events,
        secret: webhookSecret,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error("Webhooks POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
