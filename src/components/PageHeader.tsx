"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function PageHeader({ title }: { title: string }) {
  const { count } = useCart();
  return (
    <header className="flex items-center justify-between border-b border-beige px-5 py-3.5">
      <h1 className="font-heading text-[20px] font-bold text-brown">{title}</h1>
      <Link
        href="/cart"
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-beige text-[18px]"
      >
        🛍
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}
