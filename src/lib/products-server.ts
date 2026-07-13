import "server-only";
import { getSupabaseServerClient } from "./supabase-server";
import type { Product } from "./products";

interface ProductRow {
  id: string;
  name: string;
  price: number | string;
  category: string | null;
  image: string;
  description: string | null;
  ingredients: string | null;
  rating: number | string | null;
  reviews: number | null;
  stock_qty: number;
  sort_order: number;
}

function mapRow(row: ProductRow): Product & { stockQty: number; sortOrder: number } {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: (row.category ?? "deals") as Product["category"],
    image: row.image,
    description: row.description ?? "",
    ingredients: row.ingredients ?? "",
    rating: Number(row.rating ?? 5),
    reviews: row.reviews ?? 0,
    stockQty: row.stock_qty,
    sortOrder: row.sort_order ?? 0,
  };
}

export async function getAllProducts() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getProductById(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapRow(data);
}
