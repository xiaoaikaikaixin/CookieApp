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
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const today = todayISO();
  const from = params.from ?? today;
  const to = params.to ?? today;

  const supabase = getSupabaseServerClient();

  const [ordersRes, productsRes, giftSetsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .gte("created_at", `${from}T00:00:00Z`)
      .lt("created_at", `${nextDayISO(to)}T00:00:00Z`)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("products").select("id, name, stock_qty").order("name"),
    supabase.from("gift_sets").select("id, name, stock_qty").order("name"),
  ]);

  return (
    <AdminDashboard
      key={`${from}-${to}`}
      initialOrders={ordersRes.data ?? []}
      initialProducts={productsRes.data ?? []}
      initialGiftSets={giftSetsRes.data ?? []}
      from={from}
      to={to}
      today={today}
    />
  );
}
