"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  created_at: string;
}

interface StockItem {
  id: string;
  name: string;
  stock_qty: number;
  sort_order?: number;
}

interface DeliverySettings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
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
  initialSettings,
  from,
  to,
  today,
  initialTab,
}: {
  initialOrders: Order[];
  initialProducts: StockItem[];
  initialGiftSets: StockItem[];
  initialSettings: DeliverySettings;
  from: string;
  to: string;
  today: string;
  initialTab: "orders" | "stock" | "settings";
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "stock" | "settings">(initialTab);
  const [orders, setOrders] = useState(initialOrders);
  const [fromDraft, setFromDraft] = useState(from);
  const [toDraft, setToDraft] = useState(to);
  const orderTotal = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const applyRange = (params: { from?: string; to?: string }) => {
    const next = new URLSearchParams();
    next.set("from", params.from ?? fromDraft);
    next.set("to", params.to ?? toDraft);
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
        <button
          onClick={() => setTab("settings")}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
            tab === "settings" ? "bg-gold text-white" : "bg-beige text-brown"
          }`}
        >
          Settings
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
                from === today && to === today ? "bg-brown text-white" : "bg-beige text-brown"
              }`}
            >
              Today
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 card-shadow">
            <span className="text-[12px] font-medium text-soft-brown">
              {orders.length} order{orders.length === 1 ? "" : "s"}
              {from === to ? ` on ${from}` : ` from ${from} to ${to}`}
            </span>
            <span className="text-[14px] font-bold text-brown">
              Total <span className="text-red">{formatSGD(orderTotal)}</span>
            </span>
          </div>

          {orders.length === 0 && (
            <p className="text-[13px] text-soft-brown">
              No orders {from === to ? `on ${from}` : `between ${from} and ${to}`}.
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
              {(order.customer_name || order.customer_phone) && (
                <p className="mt-1 text-[11px] font-medium text-brown">
                  👤 {order.customer_name ?? "Unknown"}
                  {order.customer_phone && ` · ${order.customer_phone}`}
                </p>
              )}
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
      ) : tab === "stock" ? (
        <div className="mt-5 flex flex-col gap-6">
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center rounded-md bg-gold px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            + Add Product
          </Link>
          <StockList title="Products" items={initialProducts} isGiftSet={false} kind="product" editable />
          <Link
            href="/admin/gift-sets/new"
            className="flex items-center justify-center rounded-md bg-gold px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            + Add Gift Set
          </Link>
          <StockList title="Gift Sets" items={initialGiftSets} isGiftSet={true} kind="giftSet" editable />
        </div>
      ) : (
        <SettingsPanel initialSettings={initialSettings} />
      )}
    </div>
  );
}

function StockList({
  title,
  items,
  isGiftSet,
  kind,
  editable,
}: {
  title: string;
  items: StockItem[];
  isGiftSet: boolean;
  kind: "product" | "giftSet";
  editable?: boolean;
}) {
  const [stock, setStock] = useState(items);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stock.findIndex((i) => i.id === active.id);
    const newIndex = stock.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(stock, oldIndex, newIndex).map((item, i) => ({
      ...item,
      sort_order: i + 1,
    }));
    const previous = stock;
    setStock(reordered);
    setReorderError(null);

    const reorderUrl =
      kind === "giftSet" ? "/api/admin/gift-sets/reorder" : "/api/admin/products/reorder";
    const res = await fetch(reorderUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((i) => i.id) }),
    });
    if (!res.ok) {
      setStock(previous);
      setReorderError("Could not save the new order — please try again.");
    }
  };

  const rows = stock.map((item) => (
    <StockRow
      key={item.id}
      item={item}
      kind={kind}
      editable={editable}
      draft={drafts[item.id] ?? ""}
      onDraftChange={(v) => setDrafts((d) => ({ ...d, [item.id]: v }))}
      onSave={() => save(item.id)}
      saving={savingId === item.id}
      saved={savedId === item.id}
    />
  ));

  return (
    <div>
      <h2 className="text-[15px] font-bold text-brown">{title}</h2>
      {reorderError && <p className="mt-1 text-[12px] font-medium text-red">{reorderError}</p>}
      {editable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stock.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="mt-2 flex flex-col gap-2">{rows}</div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="mt-2 flex flex-col gap-2">{rows}</div>
      )}
    </div>
  );
}

function StockRow({
  item,
  kind,
  editable,
  draft,
  onDraftChange,
  onSave,
  saving,
  saved,
}: {
  item: StockItem;
  kind: "product" | "giftSet";
  editable?: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !editable,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-lg bg-white p-3 card-shadow"
    >
      <div className="flex items-center gap-3">
        {editable && (
          <button
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="touch-none cursor-grab px-0.5 text-[16px] text-soft-brown active:cursor-grabbing"
          >
            ⋮⋮
          </button>
        )}
        {item.sort_order !== undefined && (
          <span className="w-7 flex-shrink-0 text-[11px] font-semibold text-soft-brown">
            #{item.sort_order}
          </span>
        )}
        <span className="flex-1 text-[13px] font-medium text-brown">{item.name}</span>
        {editable && (
          <Link
            href={`/admin/${kind === "giftSet" ? "gift-sets" : "products"}/${item.id}/edit`}
            className="flex-shrink-0 text-[11px] font-semibold text-gold"
          >
            Edit
          </Link>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="flex-1 text-[11px] text-soft-brown">current: {item.stock_qty}</span>
        <input
          type="number"
          min={0}
          placeholder={String(item.stock_qty)}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          className="w-16 flex-shrink-0 rounded-md border border-beige px-2 py-1 text-[13px] text-brown"
        />
        <button
          onClick={onSave}
          disabled={saving || !draft}
          className="flex-shrink-0 rounded-md bg-gold px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40"
        >
          {saving ? "…" : saved ? "✓" : "Update"}
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ initialSettings }: { initialSettings: DeliverySettings }) {
  const [deliveryFee, setDeliveryFee] = useState(String(initialSettings.deliveryFee));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(initialSettings.freeDeliveryThreshold)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setSaved(false);
    const fee = Number(deliveryFee);
    const threshold = Number(freeDeliveryThreshold);
    if (!Number.isFinite(fee) || fee < 0) {
      setError("Enter a valid delivery fee.");
      return;
    }
    if (!Number.isFinite(threshold) || threshold < 0) {
      setError("Enter a valid free delivery threshold.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryFee: fee, freeDeliveryThreshold: threshold }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 card-shadow">
        <h2 className="text-[15px] font-bold text-brown">Delivery Fee</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Delivery Fee (SG$)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Free Delivery Threshold (SG$)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={freeDeliveryThreshold}
            onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
          <span className="text-[11px] text-soft-brown">
            Orders at or above this amount get free delivery. Set to 0 to disable free delivery.
          </span>
        </label>
        {error && <p className="text-[12px] font-medium text-red">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="flex h-[46px] w-full items-center justify-center rounded-md bg-gold text-[14px] font-bold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
