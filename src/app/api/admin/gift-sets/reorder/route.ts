import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const ids = body?.ids;

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "ids must be a non-empty array of strings" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const results = await Promise.all(
    ids.map((id: string, index: number) =>
      supabase.from("gift_sets").update({ sort_order: index + 1 }).eq("id", id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: `Could not save order: ${failed.error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
