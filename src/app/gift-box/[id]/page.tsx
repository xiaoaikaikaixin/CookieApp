import { notFound } from "next/navigation";
import { getGiftSetById } from "@/lib/products-server";
import GiftSetDetailClient from "@/components/GiftSetDetailClient";

export const dynamic = "force-dynamic";

export default async function GiftSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gift = await getGiftSetById(id);

  if (!gift) return notFound();

  return <GiftSetDetailClient gift={gift} />;
}
