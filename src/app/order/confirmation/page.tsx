"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "—";
  const total = searchParams.get("total") ?? "0.00";
  const date = searchParams.get("date") ?? "—";
  const address = searchParams.get("address");

  return (
    <div className="flex min-h-screen flex-col items-center gap-5 px-8 pb-10 pt-16 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gold-light text-[48px] text-brown">
        ✓
      </span>

      <h1 className="font-heading text-[24px] font-bold text-brown">Order Placed!</h1>
      <p className="text-[13px] leading-relaxed text-soft-brown">
        Your order has been confirmed. We&apos;ll notify you once it&apos;s out for delivery.
      </p>

      <div className="flex w-full flex-col gap-2.5 rounded-lg bg-white p-4 card-shadow">
        <div className="flex justify-between text-[13px]">
          <span className="text-soft-brown">Order ID</span>
          <span className="font-semibold text-brown">#{orderId}</span>
        </div>
        <div className="h-px w-full bg-beige" />
        <div className="flex justify-between text-[13px]">
          <span className="text-soft-brown">Total Paid</span>
          <span className="text-[15px] font-bold text-red">SG {total}</span>
        </div>
        <div className="h-px w-full bg-beige" />
        <div className="flex justify-between text-[13px]">
          <span className="text-soft-brown">Delivery Date</span>
          <span className="font-semibold text-brown">{date}</span>
        </div>
        {address && (
          <>
            <div className="h-px w-full bg-beige" />
            <div className="flex flex-col gap-1 text-left text-[13px]">
              <span className="text-soft-brown">Delivery Address</span>
              <span className="font-semibold text-brown">{address}</span>
            </div>
          </>
        )}
      </div>

      <Link
        href={`/order/track/${orderId}`}
        className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95"
      >
        Track Order
      </Link>
      <Link href="/" className="text-[14px] font-semibold text-brown">
        Back to Home
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
