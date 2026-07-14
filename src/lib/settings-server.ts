import "server-only";
import { getSupabaseServerClient } from "./supabase-server";

export interface DeliverySettings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  deliveryFee: 5,
  freeDeliveryThreshold: 100,
};

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("settings")
    .select("delivery_fee, free_delivery_threshold")
    .eq("id", 1)
    .single();

  if (error || !data) return DEFAULT_SETTINGS;

  return {
    deliveryFee: Number(data.delivery_fee),
    freeDeliveryThreshold: Number(data.free_delivery_threshold),
  };
}
