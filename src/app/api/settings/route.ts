import { NextResponse } from "next/server";
import { getDeliverySettings } from "@/lib/settings-server";

export async function GET() {
  const settings = await getDeliverySettings();
  return NextResponse.json(settings);
}
