"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

const CHIPS = [
  { id: "all", label: "All" },
  { id: "cny", label: "CNY Cookies" },
  { id: "nuts", label: "Cashnut & Nuts" },
  { id: "deals", label: "Daily Deals" },
] as const;

export default function ProductsGrid({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory: string;
}) {
  const [active, setActive] = useState(initialCategory);

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.category === active)),
    [active, products]
  );

  return (
    <>
      <div className="flex flex-wrap gap-2.5 px-5 pt-4">
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActive(chip.id)}
            className={`rounded-full px-4 py-2 text-[12px] font-semibold transition ${
              active === chip.id ? "bg-gold text-white" : "bg-beige text-brown"
            }`}
          >
            {chip.label}
          </button>
        ))}
        <Link
          href="/gift-box"
          className="rounded-full bg-beige px-4 py-2 text-[12px] font-semibold text-brown"
        >
          Gift Box
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 pt-8 text-center text-[13px] text-soft-brown">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 pb-7 pt-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
