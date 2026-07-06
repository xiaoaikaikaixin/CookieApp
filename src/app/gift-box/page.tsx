import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import GiftCard from "@/components/GiftCard";
import { giftSets } from "@/lib/products";

export default function GiftBoxPage() {
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
