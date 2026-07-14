import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const deliveryFee = Number(body?.deliveryFee);
  const freeDeliveryThreshold = Number(body?.freeDeliveryThreshold);

  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    return NextResponse.json({ error: "Invalid delivery fee" }, { status: 400 });
  }
  if (!Number.isFinite(freeDeliveryThreshold) || freeDeliveryThreshold < 0) {
    return NextResponse.json({ error: "Invalid free delivery threshold" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("settings")
    .update({ delivery_fee: deliveryFee, free_delivery_threshold: freeDeliveryThreshold })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
