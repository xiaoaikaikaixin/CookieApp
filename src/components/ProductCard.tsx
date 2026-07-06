"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, formatSGD } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-white card-shadow">
      <Link href={`/product/${product.id}`} className="relative block h-[120px] w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="200px"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-col gap-1 p-2.5 pb-3">
        <Link href={`/product/${product.id}`}>
          <p className="truncate text-[13px] font-semibold text-brown">{product.name}</p>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-red">{formatSGD(product.price)}</span>
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-soft-brown">
            {product.rating} <span className="text-star">★</span>
          </span>
        </div>
        <button
          onClick={() =>
            addItem({ id: product.id, name: product.name, price: product.price, image: product.image })
          }
          className="mt-1 h-8 rounded-sm bg-gold text-[11px] font-semibold text-white transition hover:brightness-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
