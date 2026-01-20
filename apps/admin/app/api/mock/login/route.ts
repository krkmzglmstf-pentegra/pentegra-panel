import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    token: "mock-admin-token",
    user: {
      id: "u1",
      name: "Admin Demo",
      tenant: "Atlas Kurye"
    }
  });
}
