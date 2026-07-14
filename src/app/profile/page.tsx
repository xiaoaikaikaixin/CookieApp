"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getCustomer, type Customer } from "@/lib/customer";
import { getOrderHistory } from "@/lib/orderHistory";

const menuItems = [
  { icon: "📦", label: "My Orders", href: "/profile/orders" },
  { icon: "📍", label: "Shipping Addresses", href: "/checkout/address?returnTo=/profile" },
  { icon: "💳", label: "Payment Methods", href: null },
  { icon: "♥", label: "Favorites", href: null },
  { icon: "🔔", label: "Notifications", href: null },
  { icon: "❓", label: "Help & Support", href: null },
];

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    setCustomer(getCustomer());
    setOrderCount(getOrderHistory().length);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Profile" />

      <div className="flex items-center gap-3.5 px-5 pt-2">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-beige text-[28px] text-gold">
          👤
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-[18px] font-bold text-brown">
            {customer?.name || "Guest"}
          </p>
          <p className="text-[12px] text-soft-brown">
            {customer?.phone || "Add your details at checkout"}
          </p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex justify-center rounded-lg bg-white p-4 card-shadow">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-heading text-[20px] font-bold text-gold">{orderCount}</span>
            <span className="text-[11px] font-medium text-soft-brown">Orders</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-5 pt-6">
        {menuItems.map((item, i) => (
          <div key={item.label}>
            {item.href ? (
              <Link href={item.href} className="flex w-full items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">
                  {item.icon}
                </span>
                <span className="flex-1 text-left text-[14px] font-semibold text-brown">{item.label}</span>
                <span className="text-soft-brown">›</span>
              </Link>
            ) : (
              <button className="flex w-full items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">
                  {item.icon}
                </span>
                <span className="flex-1 text-left text-[14px] font-semibold text-brown">{item.label}</span>
                <span className="text-soft-brown">›</span>
              </button>
            )}
            {i < menuItems.length - 1 && <div className="h-px w-full bg-beige" />}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
