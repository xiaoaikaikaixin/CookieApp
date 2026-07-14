import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import GiftCard from "@/components/GiftCard";
import { categories } from "@/lib/products";
import { getAllProducts, getAllGiftSets } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, giftSets] = await Promise.all([getAllProducts(), getAllGiftSets()]);
  const featuredProducts = products.filter((p) => p.featuredHome);
  const bestSellers = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);
  const featuredGiftSets = giftSets.filter((g) => g.featuredHome);
  const featuredGifts = featuredGiftSets.length > 0 ? featuredGiftSets : giftSets.slice(0, 2);

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

      <div className="px-5 pt-2">
        <div
          className="relative overflow-hidden rounded-3xl p-5 shadow-[0_4px_16px_rgba(60,36,21,0.1)]"
          style={{ background: "linear-gradient(135deg, #F5EDE3 0%, #E8D5A3 100%)" }}
        >
          <span className="absolute -right-14 -top-16 h-[220px] w-[220px] rounded-full bg-gold/20" />
          <span className="absolute -left-10 bottom-0 h-[140px] w-[140px] rounded-full bg-red/[0.08]" />
          <span className="absolute right-6 top-7 h-2.5 w-2.5 rounded-full bg-gold" />
          <span className="absolute right-[104px] top-7 h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="absolute bottom-[46px] right-10 h-2 w-2 rounded-full bg-red" />

          <div className="relative flex max-w-[200px] flex-col gap-2.5">
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red" />
              <span className="text-[10px] font-semibold tracking-[1px] text-brown">
                NEW SEASON COLLECTION
              </span>
            </span>
            <h2 className="font-heading text-[24px] font-bold leading-[1.15] text-brown">
              Festive Cookies, Handcrafted
            </h2>
            <p className="text-[12px] leading-relaxed text-soft-brown">
              Small-batch treats, baked fresh daily by Lisa.
            </p>
            <div className="mt-1.5 flex items-center gap-2.5">
              <Link
                href="/products"
                className="flex items-center gap-1.5 rounded-full bg-red px-[18px] py-[10px] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(196,30,58,0.25)]"
              >
                Shop Now <span aria-hidden>→</span>
              </Link>
              <Link href="/products" className="px-1 py-[10px] text-[12px] font-semibold text-brown">
                Our Story
              </Link>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="text-star">★</span>
              <span className="font-bold text-brown">4.9</span>
              <span className="text-soft-brown">· 2.4k reviews</span>
            </span>
            <span className="h-3 w-px bg-gold/40" />
            <span className="flex items-center gap-1 text-[11px] font-semibold text-brown">
              <span className="text-red">♥</span> Baked Fresh Daily
            </span>
            <span className="h-3 w-px bg-gold/40" />
            <span className="flex items-center gap-1 text-[11px] font-semibold text-brown">
              <span className="text-gold">🚚</span> Free Ship $50+
            </span>
          </div>
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
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[20px] font-bold text-brown">Best Sellers</h3>
          <Link href="/products" className="flex items-center gap-1 text-[12px] font-semibold text-gold">
            View All <span>›</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-5 pb-7 pt-7">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[20px] font-bold text-brown">Gift Box Collection</h3>
          <Link href="/gift-box" className="flex items-center gap-1 text-[12px] font-semibold text-gold">
            View All <span>›</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredGifts.map((g) => (
            <GiftCard key={g.id} gift={g} />
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
