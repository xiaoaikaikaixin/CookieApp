import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products-server";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return notFound();

  return <ProductDetailClient product={product} />;
}
