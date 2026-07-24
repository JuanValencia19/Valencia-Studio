import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("opportunity_score", { ascending: false })
    .limit(50);

  const leads = data || [];

  return (
    <DashboardClient initialLeads={leads} initialTotal={leads.length} />
  );
}
