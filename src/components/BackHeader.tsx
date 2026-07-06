"use client";

import { useRouter } from "next/navigation";

export default function BackHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between gap-2.5 border-b border-beige px-5 py-3.5">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-beige text-[16px] text-brown"
      >
        ←
      </button>
      <h1 className="flex-1 text-center font-heading text-[20px] font-bold text-brown">
        {title}
      </h1>
      <span className="h-10 w-10" />
    </header>
  );
}
