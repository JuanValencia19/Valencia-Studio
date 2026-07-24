import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { supabase, user, error: null };
}

export async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.error) return auth;

  if (!isAdmin(auth.user!.email ?? "")) {
    return {
      supabase: null,
      user: null,
      error: NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 }),
    };
  }

  return auth;
}
