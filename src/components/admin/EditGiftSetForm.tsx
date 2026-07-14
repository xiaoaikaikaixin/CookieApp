"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import type { GiftSet } from "@/lib/products";

export default function EditGiftSetForm({ giftSet }: { giftSet: GiftSet }) {
  const router = useRouter();
  const [name, setName] = useState(giftSet.name);
  const [price, setPrice] = useState(String(giftSet.price));
  const [sortOrder, setSortOrder] = useState(String(giftSet.sortOrder ?? 0));
  const [description, setDescription] = useState(giftSet.desc);
  const [featuredHome, setFeaturedHome] = useState(giftSet.featuredHome ?? false);
  const [existingImages, setExistingImages] = useState(giftSet.images ?? [giftSet.image]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onImagesChange = (files: FileList | null) => {
    const list = files ? Array.from(files) : [];
    setNewImageFiles((prev) => [...prev, ...list]);
    setNewImagePreviews((prev) => [...prev, ...list.map((f) => URL.createObjectURL(f))]);
  };

  const removeExisting = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNew = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setError(null);
    setSaved(false);
    if (!name.trim()) return setError("Enter a gift set name.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");
    if (!Number.isInteger(Number(sortOrder))) return setError("Display order must be a whole number.");
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      return setError("Keep at least one image.");
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("price", price);
      form.set("sortOrder", sortOrder);
      form.set("description", description.trim());
      form.set("featuredHome", featuredHome ? "true" : "false");
      form.set("keepImages", JSON.stringify(existingImages));
      newImageFiles.forEach((file) => form.append("images", file));

      const res = await fetch(`/api/admin/gift-sets/${giftSet.id}`, { method: "PATCH", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update gift set.");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => router.push("/admin?tab=stock"), 700);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="Edit Gift Set" />

      <div className="flex flex-col gap-4 px-5 py-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Gift Set Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Images</span>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((src, i) => (
              <div key={src} className="relative h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Existing" className="h-24 w-24 rounded-lg object-cover card-shadow" />
                <button
                  type="button"
                  onClick={() => removeExisting(src)}
                  aria-label="Remove image"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red text-[11px] text-white"
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
            {newImagePreviews.map((src, i) => (
              <div key={src} className="relative h-24 w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="New" className="h-24 w-24 rounded-lg object-cover card-shadow" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  aria-label="Remove image"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red text-[11px] text-white"
                >
                  ✕
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  New
                </span>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              onImagesChange(e.target.files);
              e.target.value = "";
            }}
            className="text-[13px] text-brown file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white"
          />
          <span className="text-[11px] text-soft-brown">
            Tap ✕ to remove a photo. Add more with the picker above — the first photo is the main thumbnail.
          </span>
        </label>

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={featuredHome}
            onChange={(e) => setFeaturedHome(e.target.checked)}
            className="h-4 w-4 rounded border-beige accent-gold"
          />
          <span className="text-[13px] font-semibold text-brown">Gift Box Collection in Homepage</span>
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-brown">Price (SG)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-brown">Display Order</span>
            <input
              type="number"
              step="1"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
            />
          </label>
        </div>
        <p className="-mt-2 text-[11px] text-soft-brown">
          Lower numbers show first on the Gift Box page. Ties sort alphabetically.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
        </label>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-beige bg-white px-5 pb-7 pt-4 shadow-[0_-2px_8px_rgba(60,36,21,0.03)]">
        {error && <p className="mb-2.5 text-[12px] font-medium text-red">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="flex h-[50px] w-full items-center justify-center rounded-md bg-gold text-[15px] font-bold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
