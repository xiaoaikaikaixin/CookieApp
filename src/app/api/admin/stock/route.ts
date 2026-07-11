import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const { id, isGiftSet, stockQty } = body ?? {};

  if (typeof id !== "string" || !Number.isInteger(stockQty) || stockQty < 0) {
    return NextResponse.json({ error: "Invalid id or stockQty" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const table = isGiftSet ? "gift_sets" : "products";
  const { data, error } = await supabase
    .from(table)
    .update({ stock_qty: stockQty })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update stock" }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
