"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackHeader from "@/components/BackHeader";
import Calendar from "@/components/Calendar";
import { useCart, formatSGD } from "@/lib/cart-context";
import { ADDRESS_STORAGE_KEY, DEFAULT_ADDRESS } from "@/lib/address";
import { addOrderToHistory } from "@/lib/orderHistory";
import { getCustomer, saveCustomer } from "@/lib/customer";

const DATE_STORAGE_KEY = "lisa-cookies-delivery-date";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function tomorrow() {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + 1);
  return d;
}

function toISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clear } = useCart();
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [showCalendar, setShowCalendar] = useState(false);
  const minDate = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + 90);
    return d;
  }, []);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (saved) setAddress(saved);

    const customer = getCustomer();
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
    }

    const savedDate = window.localStorage.getItem(DATE_STORAGE_KEY);
    if (savedDate) {
      const parsed = new Date(`${savedDate}T00:00:00`);
      if (!isNaN(parsed.getTime()) && parsed >= minDate && parsed <= maxDate) {
        setSelectedDate(parsed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDate = (d: Date) => {
    setSelectedDate(d);
    window.localStorage.setItem(DATE_STORAGE_KEY, toISODate(d));
    setShowCalendar(false);
  };

  const placeOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            qty: i.qty,
            isGiftSet: i.isGiftSet ?? false,
          })),
          deliveryDate: toISODate(selectedDate),
          address,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not place order. Please try again.");
        return;
      }
      const params = new URLSearchParams({
        orderId: data.order.order_number,
        total: String(data.order.total),
        date: formatDisplayDate(selectedDate),
        address,
      });
      addOrderToHistory({
        orderNumber: data.order.order_number,
        total: String(data.order.total),
        deliveryDate: formatDisplayDate(selectedDate),
        placedAt: new Date().toISOString(),
      });
      saveCustomer({ name: name.trim(), phone: phone.trim() });
      clear();
      router.push(`/order/confirmation?${params.toString()}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="Checkout" />

      <div className="flex flex-col gap-4 px-5 py-5">
        <div className="flex flex-col gap-3 rounded-lg bg-white p-3.5 card-shadow">
          <h2 className="text-[13px] font-semibold text-brown">Contact Details</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg bg-white p-3.5 card-shadow">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCalendar((v) => !v)}
              aria-label="Choose delivery date"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]"
            >
              📅
            </button>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[12px] font-medium text-soft-brown">Delivery Date</span>
              <span className="text-[13px] font-semibold text-brown">{formatDisplayDate(selectedDate)}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCalendar((v) => !v)}
              className="text-[12px] font-semibold text-gold"
            >
              {showCalendar ? "Close" : "Change"}
            </button>
          </div>
          {showCalendar && (
            <Calendar
              selected={selectedDate}
              onSelect={selectDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-white p-3.5 card-shadow">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">📍</span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[12px] font-medium text-soft-brown">Delivery Address</span>
            <span className="text-[13px] font-semibold text-brown">{address}</span>
          </div>
          <Link href="/checkout/address?returnTo=/checkout" className="text-[12px] font-semibold text-gold">
            Change
          </Link>
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
        {error && <p className="mb-2.5 text-[12px] font-medium text-red">{error}</p>}
        <button
          onClick={placeOrder}
          disabled={items.length === 0 || placing || !name.trim() || !phone.trim()}
          className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {placing ? "Placing Order…" : `Place Order · ${formatSGD(total)}`}
        </button>
      </div>
    </div>
  );
}
