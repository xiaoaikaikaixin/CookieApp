import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import GiftCard from "@/components/GiftCard";
import { getAllGiftSets } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export default async function GiftBoxPage() {
  const giftSets = await getAllGiftSets();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Gift Box Collection" />

      <div className="flex flex-col gap-4 px-5 pb-7 pt-5">
        {giftSets.map((g) => (
          <GiftCard key={g.id} gift={g} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
