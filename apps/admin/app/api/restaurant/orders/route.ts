import { NextResponse } from "next/server";

export const runtime = "edge";

const GETIR_ORIGIN = "https://getir.pentegra.com.tr";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get("restaurantId");
  const target = new URL("/api/getir/orders", GETIR_ORIGIN);
  if (restaurantId) {
    target.searchParams.set("restaurantId", restaurantId);
  }

  const res = await fetch(target.toString(), { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ ok: false, data: [] }, { status: res.status });
  }
  const payload = (await res.json()) as { ok?: boolean; data?: unknown[] };
  return NextResponse.json({ data: { data: payload.data ?? [] } });
}
