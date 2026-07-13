import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products-server";
import EditProductForm from "@/components/admin/EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return notFound();

  return <EditProductForm product={product} />;
}
