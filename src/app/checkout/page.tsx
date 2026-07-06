"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { useCart, formatSGD } from "@/lib/cart-context";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function buildDeliveryDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      dayLabel: DAY_LABELS[d.getDay()],
      dateNum: String(d.getDate()).padStart(2, "0"),
      full: d.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
    });
  }
  return days;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clear } = useCart();
  const deliveryDays = useMemo(buildDeliveryDays, []);
  const [selectedDate, setSelectedDate] = useState(deliveryDays[1]?.key ?? deliveryDays[0].key);
  const selected = deliveryDays.find((d) => d.key === selectedDate)!;

  const placeOrder = () => {
    const orderId = `LC${Date.now().toString().slice(-8)}`;
    const params = new URLSearchParams({
      orderId,
      total: total.toFixed(2),
      date: selected.full,
    });
    clear();
    router.push(`/order/confirmation?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="Checkout" />

      <div className="flex flex-col gap-4 px-5 py-5">
        <div className="flex items-center gap-3 rounded-lg bg-white p-3.5 card-shadow">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">📍</span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[12px] font-medium text-soft-brown">Delivery Address</span>
            <span className="text-[13px] font-semibold text-brown">
              123 Orchard Road, #04-12, Singapore 238841
            </span>
          </div>
          <button className="text-[12px] font-semibold text-gold">Change</button>
        </div>

        <div className="flex flex-col gap-3 rounded-lg bg-white p-3.5 card-shadow">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">📅</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[12px] font-medium text-soft-brown">Delivery Date</span>
              <span className="text-[13px] font-semibold text-brown">{selected.full}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {deliveryDays.map((d) => {
              const active = d.key === selectedDate;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`flex h-[60px] w-[50px] flex-col items-center justify-center gap-1 rounded-md ${
                    active ? "bg-gold text-white" : "bg-beige text-brown"
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${active ? "text-white" : "text-soft-brown"}`}>
                    {d.dayLabel}
                  </span>
                  <span className="text-[16px] font-bold">{d.dateNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-white p-3.5 card-shadow">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">💳</span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[12px] font-medium text-soft-brown">Payment Method</span>
            <span className="text-[13px] font-semibold text-brown">Visa •••• 4242</span>
          </div>
          <button className="text-[12px] font-semibold text-gold">Change</button>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-[14px] font-bold text-brown">Order Items ({items.length})</h2>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1 text-[13px] font-medium text-brown">
                {item.name} x{item.qty}
              </div>
              <span className="text-[13px] font-bold text-red">{formatSGD(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-beige" />

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-[13px] text-soft-brown">
            <span>Subtotal</span>
            <span className="font-semibold text-brown">{formatSGD(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-soft-brown">
            <span>Delivery Fee</span>
            <span className="font-semibold text-brown">{formatSGD(deliveryFee)}</span>
          </div>
          <div className="h-px w-full bg-beige" />
          <div className="flex justify-between text-[15px] font-bold text-brown">
            <span>Total</span>
            <span className="text-[16px] text-red">{formatSGD(total)}</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-beige bg-white px-5 pb-7 pt-4 shadow-[0_-2px_8px_rgba(60,36,21,0.03)]">
        <button
          onClick={placeOrder}
          disabled={items.length === 0}
          className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          Place Order · {formatSGD(total)}
        </button>
      </div>
    </div>
  );
}
