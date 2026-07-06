"use client";

import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useCart, formatSGD } from "@/lib/cart-context";

export default function CartPage() {
  const { items, setQty, removeItem, subtotal, deliveryFee, total } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="My Cart" />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-4xl">🛍</span>
          <p className="text-[14px] text-soft-brown">Your cart is empty.</p>
          <Link href="/products" className="rounded-md bg-gold px-5 py-2.5 text-[13px] font-semibold text-white">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3.5 px-5 pt-5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white p-3 card-shadow">
                <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-md">
                  <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-2">
                  <p className="text-[13px] font-semibold text-brown">{item.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-red">{formatSGD(item.price)}</span>
                    <div className="flex items-center gap-2.5 rounded-full bg-beige px-2 py-1">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="text-[14px] font-semibold text-brown"
                      >
                        −
                      </button>
                      <span className="text-[12px] font-semibold text-brown">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="text-[14px] font-semibold text-brown"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="self-start text-[12px] text-soft-brown"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 px-5 pt-6">
            <div className="flex justify-between text-[13px] text-soft-brown">
              <span>Subtotal</span>
              <span className="font-semibold text-brown">{formatSGD(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-soft-brown">
              <span>Delivery Fee</span>
              <span className="font-semibold text-brown">{formatSGD(deliveryFee)}</span>
            </div>
            <div className="h-px w-full bg-beige" />
            <div className="flex justify-between text-[15px] font-bold text-brown">
              <span>Total</span>
              <span className="text-[16px] text-red">{formatSGD(total)}</span>
            </div>
          </div>

          <div className="px-5 pb-7 pt-6">
            <Link
              href="/checkout"
              className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
