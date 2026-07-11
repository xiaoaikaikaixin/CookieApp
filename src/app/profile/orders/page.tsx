"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BackHeader from "@/components/BackHeader";
import { getOrderHistory, type OrderHistoryEntry } from "@/lib/orderHistory";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderHistoryEntry[] | null>(null);

  useEffect(() => {
    setOrders(getOrderHistory());
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="My Orders" />

      {orders === null ? null : orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-4xl">📦</span>
          <p className="text-[14px] text-soft-brown">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="rounded-md bg-gold px-5 py-2.5 text-[13px] font-semibold text-white">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 py-5">
          {orders.map((order) => (
            <Link
              key={order.orderNumber}
              href={`/order/track/${order.orderNumber}`}
              className="flex flex-col gap-1 rounded-lg bg-white p-4 card-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-brown">#{order.orderNumber}</span>
                <span className="text-[13px] font-bold text-red">SG {order.total}</span>
              </div>
              <span className="text-[12px] text-soft-brown">
                Placed {new Date(order.placedAt).toLocaleString("en-SG")}
              </span>
              <span className="text-[12px] text-soft-brown">Delivery {order.deliveryDate}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
