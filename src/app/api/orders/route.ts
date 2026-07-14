import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getDeliverySettings } from "@/lib/settings-server";

interface IncomingItem {
  id: string;
  qty: number;
  isGiftSet?: boolean;
}

export async function POST(req: Request) {
  let body: {
    items?: IncomingItem[];
    deliveryDate?: string;
    address?: string;
    customerName?: string;
    customerPhone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  for (const item of items) {
    if (!item.id || !Number.isInteger(item.qty) || item.qty < 1) {
      return NextResponse.json({ error: "Invalid item in cart" }, { status: 400 });
    }
  }
  if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Look up current prices/names server-side — never trust client-submitted
  // prices, since the request body can be tampered with before it reaches us.
  const productIds = items.filter((i) => !i.isGiftSet).map((i) => i.id);
  const giftIds = items.filter((i) => i.isGiftSet).map((i) => i.id);

  const [{ data: products, error: productsError }, { data: giftSets, error: giftSetsError }] =
    await Promise.all([
      productIds.length
        ? supabase.from("products").select("id, name, price").in("id", productIds)
        : Promise.resolve({ data: [], error: null }),
      giftIds.length
        ? supabase.from("gift_sets").select("id, name, price").in("id", giftIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (productsError || giftSetsError) {
    return NextResponse.json({ error: "Failed to look up items" }, { status: 500 });
  }

  const catalog = new Map(
    [...(products ?? []), ...(giftSets ?? [])].map((row) => [row.id, row])
  );

  let subtotal = 0;
  const priceCheckedItems = items.map((item) => {
    const catalogItem = catalog.get(item.id);
    if (!catalogItem) throw new Error(`Unknown item: ${item.id}`);
    subtotal += Number(catalogItem.price) * item.qty;
    return {
      id: item.id,
      qty: item.qty,
      is_gift_set: !!item.isGiftSet,
      name: catalogItem.name,
      price: catalogItem.price,
    };
  });

  const { deliveryFee: baseDeliveryFee, freeDeliveryThreshold } = await getDeliverySettings();
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
  const total = subtotal + deliveryFee;
  const orderNumber = `LC${Date.now().toString().slice(-8)}`;

  const { data: order, error: orderError } = await supabase.rpc("place_order", {
    p_order_number: orderNumber,
    p_items: priceCheckedItems,
    p_subtotal: subtotal,
    p_delivery_fee: deliveryFee,
    p_total: total,
    p_delivery_date: body.deliveryDate ?? null,
    p_delivery_address: body.address ?? null,
    p_customer_name: body.customerName!.trim(),
    p_customer_phone: body.customerPhone!.trim(),
  });

  if (orderError) {
    const message = orderError.message.includes("Insufficient stock")
      ? "One or more items are out of stock."
      : "Could not place order.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ order });
}
