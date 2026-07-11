"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatSGD } from "@/lib/cart-context";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  is_gift_set: boolean;
}

interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_date: string | null;
  delivery_address: string | null;
  status: string;
  created_at: string;
}

interface StockItem {
  id: string;
  name: string;
  stock_qty: number;
}

const STATUSES = ["placed", "preparing", "ready", "completed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-beige text-brown",
  preparing: "bg-gold-light text-brown",
  ready: "bg-gold text-white",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red/10 text-red",
};

export default function AdminDashboard({
  initialOrders,
  initialProducts,
  initialGiftSets,
  from,
  to,
  showAll,
  today,
}: {
  initialOrders: Order[];
  initialProducts: StockItem[];
  initialGiftSets: StockItem[];
  from: string;
  to: string;
  showAll: boolean;
  today: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "stock">("orders");
  const [orders, setOrders] = useState(initialOrders);
  const [fromDraft, setFromDraft] = useState(from);
  const [toDraft, setToDraft] = useState(to);
  const orderTotal = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const applyRange = (params: { from?: string; to?: string; all?: boolean }) => {
    const next = new URLSearchParams();
    if (params.all) {
      next.set("all", "1");
    } else {
      next.set("from", params.from ?? fromDraft);
      next.set("to", params.to ?? toDraft);
    }
    router.push(`/admin?${next.toString()}`);
  };

  const updateStatus = async (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      // revert on failure
      setOrders(initialOrders);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-cream px-5 py-6">
      <h1 className="font-heading text-[24px] font-bold text-brown">Admin</h1>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("orders")}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
            tab === "orders" ? "bg-gold text-white" : "bg-beige text-brown"
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab("stock")}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
            tab === "stock" ? "bg-gold text-white" : "bg-beige text-brown"
          }`}
        >
          Stock
        </button>
      </div>

      {tab === "orders" ? (
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2 rounded-lg bg-white p-3 card-shadow">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-soft-brown">From</span>
              <input
                type="date"
                value={fromDraft}
                onChange={(e) => setFromDraft(e.target.value)}
                className="rounded-md border border-beige px-2 py-1.5 text-[12px] text-brown"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-soft-brown">To</span>
              <input
                type="date"
                value={toDraft}
                onChange={(e) => setToDraft(e.target.value)}
                className="rounded-md border border-beige px-2 py-1.5 text-[12px] text-brown"
              />
            </label>
            <button
              onClick={() => applyRange({ from: fromDraft, to: toDraft })}
              className="rounded-md bg-gold px-3 py-1.5 text-[12px] font-semibold text-white"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setFromDraft(today);
                setToDraft(today);
                applyRange({ from: today, to: today });
              }}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold ${
                !showAll && from === today && to === today
                  ? "bg-brown text-white"
                  : "bg-beige text-brown"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => applyRange({ all: true })}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold ${
                showAll ? "bg-brown text-white" : "bg-beige text-brown"
              }`}
            >
              All
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 card-shadow">
            <span className="text-[12px] font-medium text-soft-brown">
              {orders.length} order{orders.length === 1 ? "" : "s"}
              {showAll ? "" : from === to ? ` on ${from}` : ` from ${from} to ${to}`}
            </span>
            <span className="text-[14px] font-bold text-brown">
              Total <span className="text-red">{formatSGD(orderTotal)}</span>
            </span>
          </div>

          {orders.length === 0 && (
            <p className="text-[13px] text-soft-brown">
              No orders {showAll ? "yet" : from === to ? `on ${from}` : `between ${from} and ${to}`}.
            </p>
          )}
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg bg-white p-4 card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-brown">#{order.order_number}</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                    STATUS_COLORS[order.status] ?? "bg-beige text-brown"
                  }`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-[11px] text-soft-brown">
                Placed {new Date(order.created_at).toLocaleString("en-SG")}
                {order.delivery_date && ` · Delivery ${order.delivery_date}`}
              </p>
              {order.delivery_address && (
                <p className="mt-1 text-[11px] text-soft-brown">📍 {order.delivery_address}</p>
              )}
              <div className="mt-3 flex flex-col gap-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[13px] text-brown">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-semibold">{formatSGD(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-beige pt-2 text-[14px] font-bold text-brown">
                <span>Total</span>
                <span className="text-red">{formatSGD(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-6">
          <StockList title="Products" items={initialProducts} isGiftSet={false} />
          <StockList title="Gift Sets" items={initialGiftSets} isGiftSet={true} />
        </div>
      )}
    </div>
  );
}

function StockList({
  title,
  items,
  isGiftSet,
}: {
  title: string;
  items: StockItem[];
  isGiftSet: boolean;
}) {
  const [stock, setStock] = useState(items);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const save = async (id: string) => {
    const draft = drafts[id];
    const stockQty = Number(draft);
    if (!Number.isInteger(stockQty) || stockQty < 0) return;

    setSavingId(id);
    const res = await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isGiftSet, stockQty }),
    });
    setSavingId(null);
    if (res.ok) {
      setStock((prev) => prev.map((s) => (s.id === id ? { ...s, stock_qty: stockQty } : s)));
      setSavedId(id);
      setTimeout(() => setSavedId(null), 1500);
    }
  };

  return (
    <div>
      <h2 className="text-[15px] font-bold text-brown">{title}</h2>
      <div className="mt-2 flex flex-col gap-2">
        {stock.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white p-3 card-shadow">
            <span className="flex-1 text-[13px] font-medium text-brown">{item.name}</span>
            <span className="text-[11px] text-soft-brown">current: {item.stock_qty}</span>
            <input
              type="number"
              min={0}
              placeholder={String(item.stock_qty)}
              value={drafts[item.id] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
              className="w-16 rounded-md border border-beige px-2 py-1 text-[13px] text-brown"
            />
            <button
              onClick={() => save(item.id)}
              disabled={savingId === item.id || !drafts[item.id]}
              className="rounded-md bg-gold px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              {savingId === item.id ? "…" : savedId === item.id ? "✓" : "Update"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
