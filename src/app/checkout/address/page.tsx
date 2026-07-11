"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { ADDRESS_STORAGE_KEY, DEFAULT_ADDRESS } from "@/lib/address";

export default function AddressPage() {
  const router = useRouter();
  const [address, setAddress] = useState(DEFAULT_ADDRESS);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (saved) setAddress(saved);
  }, []);

  const save = () => {
    window.localStorage.setItem(ADDRESS_STORAGE_KEY, address.trim());
    router.push("/checkout");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="Delivery Address" />

      <div className="flex flex-col gap-2 px-5 py-5">
        <span className="text-[13px] font-semibold text-brown">Delivery Address</span>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={4}
          placeholder="Enter your full delivery address"
          className="w-full resize-none rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          autoFocus
        />
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-beige bg-white px-5 pb-7 pt-4 shadow-[0_-2px_8px_rgba(60,36,21,0.03)]">
        <button
          onClick={save}
          disabled={!address.trim()}
          className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
