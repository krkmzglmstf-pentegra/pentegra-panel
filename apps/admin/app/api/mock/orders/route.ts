import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1234",
      restaurant: "Burger House",
      platform: "Getir",
      status: "Onay Bekliyor",
      createdAt: new Date().toISOString(),
      totalPrice: 185.2,
      address: "Kadikoy, Istanbul"
    },
    {
      id: "1235",
      restaurant: "Sushi Lab",
      platform: "Migros",
      status: "Yeni",
      createdAt: new Date().toISOString(),
      totalPrice: 420.0,
      address: "Besiktas, Istanbul"
    },
    {
      id: "1236",
      restaurant: "Ankara Pizza",
      platform: "Yemeksepeti",
      status: "Teslim",
      createdAt: new Date().toISOString(),
      totalPrice: 260.5,
      address: "Cankaya, Ankara"
    }
  ]);
}
