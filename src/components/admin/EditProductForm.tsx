"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import type { Product } from "@/lib/products";

const CATEGORIES = [
  { id: "cny", label: "CNY Cookies" },
  { id: "nuts", label: "Cashnut & Nuts" },
  { id: "deals", label: "Daily Deals" },
];

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  const [ingredients, setIngredients] = useState(product.ingredients);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onImageChange = (file: File | null) => {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const save = async () => {
    setError(null);
    setSaved(false);
    if (!name.trim()) return setError("Enter a product name.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");

    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("category", category);
      form.set("price", price);
      form.set("description", description.trim());
      form.set("ingredients", ingredients.trim());
      if (imageFile) form.set("image", imageFile);

      const res = await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update product.");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => router.push("/admin"), 700);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="Edit Product" />

      <div className="flex flex-col gap-4 px-5 py-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Product Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Product Image</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview ?? product.image}
            alt="Preview"
            className="h-36 w-36 rounded-lg object-cover card-shadow"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="text-[13px] text-brown file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-white"
          />
          <span className="text-[11px] text-soft-brown">Leave empty to keep the current image.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product["category"])}
            className="rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
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

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="resize-none rounded-md border border-beige px-3 py-2.5 text-[14px] text-brown"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brown">Ingredients (optional)</span>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={2}
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
