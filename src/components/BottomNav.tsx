"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const TABS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/products", label: "Products", icon: "▦" },
  { href: "/gift-box", label: "Gift Box", icon: "🎁" },
  { href: "/cart", label: "Cart", icon: "🛍" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky bottom-0 z-40 flex w-full border-t border-beige bg-white/95 px-0 pb-5 pt-3 shadow-[0_-2px_8px_rgba(60,36,21,0.03)] backdrop-blur">
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1"
          >
            <span className="relative text-[18px] leading-none">
              {tab.icon}
              {tab.href === "/cart" && count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
            <span
              className={`text-[10px] font-medium ${
                active ? "font-semibold text-gold" : "text-soft-brown"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
