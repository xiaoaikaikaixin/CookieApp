import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const VALID_CATEGORIES = ["cny", "nuts", "deals"];
const STORAGE_PREFIX = "/storage/v1/object/public/product-images/";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();

  const name = String(form.get("name") ?? "").trim();
  const priceRaw = form.get("price");
  const category = String(form.get("category") ?? "");
  const description = String(form.get("description") ?? "").trim();
  const ingredients = String(form.get("ingredients") ?? "").trim();
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
  const sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder)) {
    return NextResponse.json({ error: "Display order must be a whole number" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("image")
    .eq("id", id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let imageUrl = existing.image as string;
  let oldStoragePath: string | null = null;

  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
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
    imageUrl = publicUrlData.publicUrl;

    if (existing.image?.includes(STORAGE_PREFIX)) {
      oldStoragePath = existing.image.split(STORAGE_PREFIX)[1];
    }
  }

  const { data: product, error: updateError } = await supabase
    .from("products")
    .update({
      name,
      price,
      category,
      image: imageUrl,
      description: description || null,
      ingredients: ingredients || null,
      sort_order: sortOrder,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: `Could not update product: ${updateError.message}` }, { status: 500 });
  }

  if (oldStoragePath) {
    // Best-effort cleanup of the replaced image — don't fail the request over it.
    await supabase.storage.from("product-images").remove([oldStoragePath]).catch(() => {});
  }

  return NextResponse.json({ product });
}
