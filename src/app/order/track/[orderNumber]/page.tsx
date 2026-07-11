import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { formatSGD } from "@/lib/format";

const STATUS_STEPS = ["placed", "preparing", "ready", "completed"] as const;

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  preparing: "Preparing",
  ready: "Ready for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-beige text-brown",
  preparing: "bg-gold-light text-brown",
  ready: "bg-gold text-white",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red/10 text-red",
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = getSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-4xl">🔍</span>
        <p className="text-[14px] text-soft-brown">
          We couldn&apos;t find an order with number #{orderNumber}.
        </p>
        <Link href="/" className="rounded-md bg-gold px-5 py-2.5 text-[13px] font-semibold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="flex min-h-screen flex-col gap-5 px-5 py-6">
      <div>
        <h1 className="font-heading text-[22px] font-bold text-brown">Track Order</h1>
        <p className="text-[13px] text-soft-brown">#{order.order_number}</p>
      </div>

      <span
        className={`w-fit rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize ${
          STATUS_COLORS[order.status] ?? "bg-beige text-brown"
        }`}
      >
        {STATUS_LABELS[order.status] ?? order.status}
      </span>

      {!isCancelled && (
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center gap-1">
              <span
                className={`h-2 flex-1 rounded-full ${
                  i <= stepIndex ? "bg-gold" : "bg-beige"
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5 rounded-lg bg-white p-4 card-shadow">
        {order.items.map((item: { id: string; name: string; qty: number; price: number }) => (
          <div key={item.id} className="flex justify-between text-[13px] text-brown">
            <span>
              {item.name} × {item.qty}
            </span>
            <span className="font-semibold">{formatSGD(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="h-px w-full bg-beige" />
        <div className="flex justify-between text-[13px] text-soft-brown">
          <span>Subtotal</span>
          <span className="font-semibold text-brown">{formatSGD(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between text-[13px] text-soft-brown">
          <span>Delivery Fee</span>
          <span className="font-semibold text-brown">{formatSGD(Number(order.delivery_fee))}</span>
        </div>
        <div className="h-px w-full bg-beige" />
        <div className="flex justify-between text-[15px] font-bold text-brown">
          <span>Total</span>
          <span className="text-red">{formatSGD(Number(order.total))}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-lg bg-white p-4 card-shadow">
        <div className="flex justify-between text-[13px]">
          <span className="text-soft-brown">Placed</span>
          <span className="font-semibold text-brown">
            {new Date(order.created_at).toLocaleString("en-SG")}
          </span>
        </div>
        {order.delivery_date && (
          <div className="flex justify-between text-[13px]">
            <span className="text-soft-brown">Delivery Date</span>
            <span className="font-semibold text-brown">{order.delivery_date}</span>
          </div>
        )}
        {order.delivery_address && (
          <div className="flex flex-col gap-1 text-left text-[13px]">
            <span className="text-soft-brown">Delivery Address</span>
            <span className="font-semibold text-brown">{order.delivery_address}</span>
          </div>
        )}
      </div>

      <Link
        href="/"
        className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95"
      >
        Back to Home
      </Link>
    </div>
  );
}
