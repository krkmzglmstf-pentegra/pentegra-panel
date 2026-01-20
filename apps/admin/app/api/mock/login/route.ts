import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { role?: string } | null;
  const role = body?.role === "restaurant" ? "restaurant" : "admin";
  const user =
    role === "restaurant"
      ? { id: "r1", name: "Burger House", tenant: "Atlas Kurye", restaurant: "Burger House" }
      : { id: "u1", name: "Admin Demo", tenant: "Atlas Kurye" };
  return NextResponse.json({
    token: role === "restaurant" ? "mock-restaurant-token" : "mock-admin-token",
    user
  });
}
