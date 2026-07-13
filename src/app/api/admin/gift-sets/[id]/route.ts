import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

const STORAGE_PREFIX = "/storage/v1/object/public/product-images/";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();

  const name = String(form.get("name") ?? "").trim();
  const priceRaw = form.get("price");
  const description = String(form.get("description") ?? "").trim();
  const sortOrderRaw = form.get("sortOrder");
  const newImages = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const keepImagesRaw = form.get("keepImages");

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
  }
  const sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder)) {
    return NextResponse.json({ error: "Display order must be a whole number" }, { status: 400 });
  }
  if (newImages.some((img) => !img.type.startsWith("image/"))) {
    return NextResponse.json({ error: "All files must be images" }, { status: 400 });
  }

  let keepImages: string[] = [];
  try {
    const parsed = JSON.parse(String(keepImagesRaw ?? "[]"));
    if (Array.isArray(parsed)) keepImages = parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return NextResponse.json({ error: "Invalid keepImages" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("gift_sets")
    .select("images")
    .eq("id", id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json({ error: "Gift set not found" }, { status: 404 });
  }

  const existingImages: string[] = existing.images ?? [];
  const kept = keepImages.filter((url) => existingImages.includes(url));
  const removed = existingImages.filter((url) => !kept.includes(url));

  let uploadedUrls: string[];
  try {
    uploadedUrls = await Promise.all(newImages.map((img) => uploadGiftSetImage(supabase, id, img)));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const finalImages = [...kept, ...uploadedUrls];
  if (finalImages.length === 0) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }

  const { data: giftSet, error: updateError } = await supabase
    .from("gift_sets")
    .update({
      name,
      price,
      image: finalImages[0],
      images: finalImages,
      description: description || null,
      sort_order: sortOrder,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: `Could not update gift set: ${updateError.message}` }, { status: 500 });
  }

  const removedStoragePaths = removed
    .filter((url) => url.includes(STORAGE_PREFIX))
    .map((url) => url.split(STORAGE_PREFIX)[1]);
  if (removedStoragePaths.length > 0) {
    await supabase.storage.from("product-images").remove(removedStoragePaths).catch(() => {});
  }

  return NextResponse.json({ giftSet });
}
