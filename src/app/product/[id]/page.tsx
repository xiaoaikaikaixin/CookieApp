"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { notFound, useParams } from "next/navigation";
import { getProduct } from "@/lib/products";
import { useCart, formatSGD } from "@/lib/cart-context";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const product = getProduct(params.id);
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return notFound();

  const total = product.price * qty;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative h-[320px] w-full">
        <Image src={product.image} alt={product.name} fill sizes="480px" className="object-cover" />
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brown"
        >
          ←
        </button>
        <button
          aria-label="Favorite"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-red"
        >
          ♥
        </button>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        <h1 className="font-heading text-[22px] font-bold text-brown">{product.name}</h1>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-soft-brown">
            <span className="text-star">★</span> {product.rating} · {product.reviews} reviews
          </span>
          <span className="text-[20px] font-bold text-red">{formatSGD(product.price)}</span>
        </div>

        <div className="h-px w-full bg-beige" />

        <div className="flex flex-col gap-2">
          <h2 className="text-[14px] font-bold text-brown">Description</h2>
          <p className="text-[13px] leading-relaxed text-soft-brown">{product.description}</p>
          <h2 className="mt-1 text-[14px] font-bold text-brown">Ingredients</h2>
          <p className="text-[13px] leading-relaxed text-soft-brown">{product.ingredients}</p>
        </div>

        <div className="h-px w-full bg-beige" />

        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-brown">Quantity</span>
          <div className="flex items-center gap-3.5 rounded-full bg-beige px-2.5 py-1.5">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="text-[15px] font-semibold text-brown"
            >
              −
            </button>
            <span className="text-[13px] font-semibold text-brown">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="text-[15px] font-semibold text-brown"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto flex items-center gap-3.5 border-t border-beige bg-white px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(60,36,21,0.03)]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-soft-brown">Total</span>
          <span className="text-[18px] font-bold text-red">{formatSGD(total)}</span>
        </div>
        <button
          onClick={() => {
            addItem(
              { id: product.id, name: product.name, price: product.price, image: product.image },
              qty
            );
            router.push("/cart");
          }}
          className="h-[50px] flex-1 rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
