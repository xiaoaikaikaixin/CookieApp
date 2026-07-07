import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import GiftCard from "@/components/GiftCard";
import { categories, giftSets, products } from "@/lib/products";

const bestSellers = products.slice(0, 4);
const featuredGifts = giftSets.slice(0, 2);

const reviews = [
  {
    name: "Mei Ling",
    text: "The pineapple tarts are absolutely divine! Perfect for CNY gifting. Will order again!",
  },
  {
    name: "Sarah Tan",
    text: "Beautiful packaging and the cookies taste homemade. My family loved the gift box!",
  },
  {
    name: "Amira Hassan",
    text: "Best almond cookies I've ever had. The delivery was fast and the box was gorgeous.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col items-center gap-2.5 px-5 py-3">
        <h1 className="text-center font-heading text-[18px] font-bold tracking-[0.15em] text-brown">
          LISA HANDMADE COOKIES
        </h1>
        <div className="flex w-full items-center gap-2.5">
          <Link
            href="/products"
            className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-3.5 card-shadow"
          >
            <span className="text-soft-brown">🔍</span>
            <span className="text-[13px] text-soft-brown">Search cookies & gifts...</span>
          </Link>
          <Link
            href="/cart"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-beige"
          >
            🛍
          </Link>
        </div>
      </header>

      <div className="relative h-[420px] w-full overflow-hidden">
        <Image
          src="/images/hero-cookies.png"
          alt="Premium handmade cookies"
          fill
          sizes="480px"
          className="object-cover"
          priority
        />
        <span className="absolute right-[30px] top-10 h-2 w-2 rounded-full bg-gold" />
        <span className="absolute right-[10px] top-[60px] h-1 w-1 rounded-full bg-gold" />
        <span className="absolute left-[30px] top-10 h-1.5 w-1.5 rounded-full bg-red" />
        <div className="hero-gradient absolute inset-0 flex flex-col justify-end gap-3 p-6">
          <h2 className="font-heading text-[28px] font-bold leading-tight text-white">
            Premium Handmade Cookies
          </h2>
          <p className="text-[13px] text-gold-light">
            Handcrafted with love for every celebration
          </p>
          <Link
            href="/products"
            className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-red px-7 py-3 text-[14px] font-semibold text-white"
          >
            Shop Now <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <section className="flex flex-col gap-4 px-5 pt-6">
        <h3 className="font-heading text-[20px] font-bold text-brown">Popular Categories</h3>
        <div className="flex justify-between gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "gift" ? "/gift-box" : `/products?category=${cat.id}`}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-beige">
                <Image src={cat.image} alt={cat.label} fill sizes="64px" className="object-cover" />
              </span>
              <span className="text-center text-[11px] font-medium text-brown">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-5 pt-7">
        <h3 className="font-heading text-[20px] font-bold text-brown">Best Sellers</h3>
        <div className="grid grid-cols-2 gap-3">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-5 pt-7">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[20px] font-bold text-brown">Gift Box Collection</h3>
          <Link href="/gift-box" className="flex items-center gap-1 text-[12px] font-semibold text-gold">
            View All <span>›</span>
          </Link>
        </div>
        <div className="flex gap-3">
          {featuredGifts.map((g) => (
            <div key={g.id} className="flex-1">
              <GiftCard gift={g} />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-5 py-7">
        <h3 className="font-heading text-[20px] font-bold text-brown">Customer Reviews</h3>
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-lg bg-white p-3.5 card-shadow">
              <p className="text-[13px] font-semibold text-brown">{r.name}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-soft-brown">&quot;{r.text}&quot;</p>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
