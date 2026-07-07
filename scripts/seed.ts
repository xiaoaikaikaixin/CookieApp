import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { products, giftSets } from "../src/lib/products";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local first."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const PRODUCT_STOCK = 50;
const GIFT_SET_STOCK = 20;

async function seed() {
  const productRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    description: p.description,
    ingredients: p.ingredients,
    rating: p.rating,
    reviews: p.reviews,
    stock_qty: PRODUCT_STOCK,
  }));

  const giftSetRows = giftSets.map((g) => ({
    id: g.id,
    name: g.name,
    price: g.price,
    image: g.image,
    description: g.desc,
    stock_qty: GIFT_SET_STOCK,
  }));

  const { error: productsError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "id" });
  if (productsError) throw productsError;
  console.log(`Seeded ${productRows.length} products.`);

  const { error: giftSetsError } = await supabase
    .from("gift_sets")
    .upsert(giftSetRows, { onConflict: "id" });
  if (giftSetsError) throw giftSetsError;
  console.log(`Seeded ${giftSetRows.length} gift sets.`);
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
