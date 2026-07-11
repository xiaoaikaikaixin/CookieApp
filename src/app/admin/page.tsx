import { getSupabaseServerClient } from "@/lib/supabase-server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextDayISO(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; all?: string }>;
}) {
  const params = await searchParams;
  const today = todayISO();
  const from = params.from ?? today;
  const to = params.to ?? today;
  const showAll = params.all === "1";

  const supabase = getSupabaseServerClient();

  let ordersQuery = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (!showAll) {
    ordersQuery = ordersQuery.gte("created_at", `${from}T00:00:00Z`).lt("created_at", `${nextDayISO(to)}T00:00:00Z`);
  }

  const [ordersRes, productsRes, giftSetsRes] = await Promise.all([
    ordersQuery.limit(200),
    supabase.from("products").select("id, name, stock_qty").order("name"),
    supabase.from("gift_sets").select("id, name, stock_qty").order("name"),
  ]);

  return (
    <AdminDashboard
      key={`${from}-${to}-${showAll}`}
      initialOrders={ordersRes.data ?? []}
      initialProducts={productsRes.data ?? []}
      initialGiftSets={giftSetsRes.data ?? []}
      from={from}
      to={to}
      showAll={showAll}
      today={today}
    />
  );
}
