import { notFound } from "next/navigation";
import { getGiftSetById } from "@/lib/products-server";
import EditGiftSetForm from "@/components/admin/EditGiftSetForm";

export const dynamic = "force-dynamic";

export default async function EditGiftSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const giftSet = await getGiftSetById(id);

  if (!giftSet) return notFound();

  return <EditGiftSetForm giftSet={giftSet} />;
}
