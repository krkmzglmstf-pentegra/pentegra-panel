import { NextResponse } from "next/server";

export const runtime = "edge";

const GETIR_ORIGIN = "https://getir.pentegra.com.tr";

export async function GET() {
  const res = await fetch(`${GETIR_ORIGIN}/api/getir/orders`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ ok: false, data: [] }, { status: res.status });
  }
  const payload = (await res.json()) as { ok?: boolean; data?: unknown[] };
  return NextResponse.json({ data: { data: payload.data ?? [] } });
}
