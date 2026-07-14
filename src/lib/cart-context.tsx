"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  isGiftSet?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  count: number;
}

const DEFAULT_DELIVERY_FEE = 5;
const DEFAULT_FREE_DELIVERY_THRESHOLD = 100;
const STORAGE_KEY = "lisa-cookies-cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryFee: DEFAULT_DELIVERY_FEE,
    freeDeliveryThreshold: DEFAULT_FREE_DELIVERY_THRESHOLD,
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.deliveryFee === "number" && typeof data.freeDeliveryThreshold === "number") {
          setDeliverySettings(data);
        }
      })
      .catch(() => {
        // keep defaults if the fetch fails
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );
  const deliveryFee =
    items.length === 0
      ? 0
      : subtotal >= deliverySettings.freeDeliveryThreshold
        ? 0
        : deliverySettings.deliveryFee;
  const total = subtotal + deliveryFee;
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    subtotal,
    deliveryFee,
    total,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { formatSGD } from "./format";
