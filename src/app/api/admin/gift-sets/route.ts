import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadGiftSetImage(supabase: SupabaseClient, id: string, image: File) {
  const ext = image.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await image.arrayBuffer());

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: image.type, upsert: false });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(req: Request) {
  const form = await req.formData();

  const name = String(form.get("name") ?? "").trim();
  const priceRaw = form.get("price");
  const description = String(form.get("description") ?? "").trim();
  const stockRaw = form.get("stockQty");
  const sortOrderRaw = form.get("sortOrder");
  const featuredHome = form.get("featuredHome") === "true";
  const images = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
  }
  const stockQty = Number(stockRaw);
  if (!Number.isInteger(stockQty) || stockQty < 0) {
    return NextResponse.json({ error: "Initial stock must be a non-negative whole number" }, { status: 400 });
  }
  if (images.length === 0) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }
  if (images.some((img) => !img.type.startsWith("image/"))) {
    return NextResponse.json({ error: "All files must be images" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  let sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder)) {
    const { data: maxRow } = await supabase
      .from("gift_sets")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (maxRow?.sort_order ?? 0) + 10;
  }

  const baseSlug = slugify(name) || "gift-set";
  let id = baseSlug;
  let suffix = 2;
  for (let i = 0; i < 20; i++) {
    const { data: existing } = await supabase.from("gift_sets").select("id").eq("id", id).maybeSingle();
    if (!existing) break;
    id = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  let imageUrls: string[];
  try {
    imageUrls = await Promise.all(images.map((img) => uploadGiftSetImage(supabase, id, img)));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const { data: giftSet, error: insertError } = await supabase
    .from("gift_sets")
    .insert({
      id,
      name,
      price,
      image: imageUrls[0],
      images: imageUrls,
      description: description || null,
      stock_qty: stockQty,
      sort_order: sortOrder,
      featured_home: featuredHome,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: `Could not save gift set: ${insertError.message}` }, { status: 500 });
  }

  return NextResponse.json({ giftSet });
}
