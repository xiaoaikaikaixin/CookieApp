"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, formatSGD } from "@/lib/cart-context";
import type { GiftSet } from "@/lib/products";

export default function GiftCard({ gift }: { gift: GiftSet }) {
  const { addItem } = useCart();

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border border-gold bg-white card-shadow">
      <Link href={`/gift-box/${gift.id}`} className="relative block h-[150px] w-full">
        <Image
          src={gift.image}
          alt={gift.name}
          fill
          sizes="350px"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-col gap-1 p-3 pb-3.5">
        <span className="h-[3px] w-10 rounded-full bg-gold" />
        <Link href={`/gift-box/${gift.id}`}>
          <p className="text-[14px] font-semibold text-brown">{gift.name}</p>
        </Link>
        <p className="text-[11px] leading-relaxed text-soft-brown">{gift.desc}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[16px] font-bold text-red">{formatSGD(gift.price)}</span>
          <button
            onClick={() =>
              addItem({ id: gift.id, name: gift.name, price: gift.price, image: gift.image })
            }
            className="h-8 rounded-sm bg-gold px-3 text-[11px] font-semibold text-white transition hover:brightness-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
