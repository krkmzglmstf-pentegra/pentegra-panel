import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stats: {
      todaysOrders: 46,
      pendingOrders: 6,
      inDelivery: 12,
      avgPrepMinutes: 18
    },
    liveOrders: [
      {
        id: "R-901",
        restaurant: "Burger House",
        platform: "Getir",
        status: "Onay Bekliyor",
        createdAt: new Date().toISOString(),
        totalPrice: 189.5,
        address: "Kadikoy, Istanbul"
      },
      {
        id: "R-902",
        restaurant: "Burger House",
        platform: "Migros",
        status: "Hazirlaniyor",
        createdAt: new Date().toISOString(),
        totalPrice: 245.0,
        address: "Kadikoy, Istanbul"
      }
    ],
    courierStatus: {
      online: 5,
      offline: 2,
      break: 1
    }
  });
}
