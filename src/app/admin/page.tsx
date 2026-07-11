import { getSupabaseServerClient } from "@/lib/supabase-server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = getSupabaseServerClient();

  const [ordersRes, productsRes, giftSetsRes] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("products").select("id, name, stock_qty").order("name"),
    supabase.from("gift_sets").select("id, name, stock_qty").order("name"),
  ]);

  return (
    <AdminDashboard
      initialOrders={ordersRes.data ?? []}
      initialProducts={productsRes.data ?? []}
      initialGiftSets={giftSetsRes.data ?? []}
    />
  );
}
