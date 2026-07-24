import { createClient } from "@/lib/supabase/server";
import { LeadsPageClient } from "./LeadsPageClient";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "";
  const page = parseInt(typeof params.page === "string" ? params.page : "1");

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, count } = await query
    .order("opportunity_score", { ascending: false })
    .range((page - 1) * 20, page * 20 - 1);

  const leads = data || [];
  const total = count || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <LeadsPageClient
      initialLeads={leads}
      initialTotal={total}
      initialTotalPages={totalPages}
      initialPage={page}
      initialSearch={search}
      initialStatus={status}
    />
  );
}
