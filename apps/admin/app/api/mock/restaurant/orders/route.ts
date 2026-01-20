import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "R-101",
      restaurant: "Burger House",
      platform: "Getir",
      status: "Onay Bekliyor",
      createdAt: new Date().toISOString(),
      totalPrice: 155.4,
      address: "Kadikoy, Istanbul"
    },
    {
      id: "R-102",
      restaurant: "Burger House",
      platform: "Migros",
      status: "Hazirlaniyor",
      createdAt: new Date().toISOString(),
      totalPrice: 210.0,
      address: "Kadikoy, Istanbul"
    },
    {
      id: "R-103",
      restaurant: "Burger House",
      platform: "Yemeksepeti",
      status: "Teslim",
      createdAt: new Date().toISOString(),
      totalPrice: 178.2,
      address: "Kadikoy, Istanbul"
    }
  ]);
}
