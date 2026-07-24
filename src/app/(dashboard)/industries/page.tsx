import { createClient } from "@/lib/supabase/server";
import { IndustriesClient } from "./IndustriesClient";

export default async function IndustriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: industries } = await supabase
    .from("industries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <IndustriesClient initialIndustries={industries || []} />;
}
