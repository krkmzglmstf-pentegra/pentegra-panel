import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "r1",
      name: "Burger House",
      platformRestaurantId: "getir-456",
      platform: "Getir",
      lat: 41.02,
      lon: 28.97,
      autoApprove: true,
      autoPrint: false
    },
    {
      id: "r2",
      name: "Sushi Lab",
      platformRestaurantId: "migros-884",
      platform: "Migros",
      lat: 41.05,
      lon: 28.99,
      autoApprove: true,
      autoPrint: true
    },
    {
      id: "r3",
      name: "Ankara Pizza",
      platformRestaurantId: "ys-299",
      platform: "Yemeksepeti",
      lat: 39.92,
      lon: 32.85,
      autoApprove: false,
      autoPrint: false
    }
  ]);
}
