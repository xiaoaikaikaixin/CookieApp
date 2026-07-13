"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, formatSGD } from "@/lib/cart-context";
import type { GiftSet } from "@/lib/products";

export default function GiftSetDetailClient({ gift }: { gift: GiftSet }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const images = gift.images?.length ? gift.images : [gift.image];
  const [activeImage, setActiveImage] = useState(images[0]);

  const total = gift.price * qty;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative h-[320px] w-full">
        <Image src={activeImage} alt={gift.name} fill sizes="480px" className="object-cover" />
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brown"
        >
          ←
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 pt-3">
          {images.map((src) => (
            <button
              key={src}
              onClick={() => setActiveImage(src)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg ${
                activeImage === src ? "ring-2 ring-gold" : "opacity-70"
              }`}
            >
              <Image src={src} alt={gift.name} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 px-5 py-5">
        <h1 className="font-heading text-[22px] font-bold text-brown">{gift.name}</h1>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-soft-brown">{gift.desc}</span>
          <span className="text-[20px] font-bold text-red">{formatSGD(gift.price)}</span>
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
              { id: gift.id, name: gift.name, price: gift.price, image: gift.image, isGiftSet: true },
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
