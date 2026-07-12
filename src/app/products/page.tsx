import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ProductsGrid from "@/components/ProductsGrid";
import { getAllProducts } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const products = await getAllProducts();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Products" />
      <ProductsGrid products={products} initialCategory={params.category ?? "all"} />
      <BottomNav />
    </div>
  );
}
