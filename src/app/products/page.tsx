"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

const CHIPS = [
  { id: "all", label: "All" },
  { id: "cny", label: "CNY Cookies" },
  { id: "nuts", label: "Cashnut & Nuts" },
  { id: "deals", label: "Daily Deals" },
] as const;

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const [active, setActive] = useState<string>(initialCategory);

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.category === active)),
    [active]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Products" />

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

      <div className="grid grid-cols-2 gap-3 px-5 pb-7 pt-5">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
