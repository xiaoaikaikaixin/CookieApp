import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const VALID_CATEGORIES = ["cny", "nuts", "deals"];

export async function POST(req: Request) {
  const form = await req.formData();

  const name = String(form.get("name") ?? "").trim();
  const priceRaw = form.get("price");
  const category = String(form.get("category") ?? "");
  const description = String(form.get("description") ?? "").trim();
  const ingredients = String(form.get("ingredients") ?? "").trim();
  const stockRaw = form.get("stockQty");
  const sortOrderRaw = form.get("sortOrder");
  const image = form.get("image");

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  const stockQty = Number(stockRaw);
  if (!Number.isInteger(stockQty) || stockQty < 0) {
    return NextResponse.json({ error: "Initial stock must be a non-negative whole number" }, { status: 400 });
  }
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "Product image is required" }, { status: 400 });
  }
  if (!image.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  let sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder)) {
    const { data: maxRow } = await supabase
      .from("products")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (maxRow?.sort_order ?? 0) + 10;
  }

  const baseSlug = slugify(name) || "product";
  let id = baseSlug;
  let suffix = 2;
  for (let i = 0; i < 20; i++) {
    const { data: existing } = await supabase.from("products").select("id").eq("id", id).maybeSingle();
    if (!existing) break;
    id = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const ext = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await image.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: image.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      id,
      name,
      price,
      category,
      image: publicUrlData.publicUrl,
      description: description || null,
      ingredients: ingredients || null,
      rating: 5.0,
      reviews: 0,
      stock_qty: stockQty,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: `Could not save product: ${insertError.message}` }, { status: 500 });
  }

  return NextResponse.json({ product });
}
