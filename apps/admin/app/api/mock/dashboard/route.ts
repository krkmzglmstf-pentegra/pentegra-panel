import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stats: {
      todaysOrders: 128,
      pendingApprovals: 14,
      activeCouriers: 22,
      avgDeliveryMinutes: 32
    },
    liveOrders: [
      {
        id: "1245",
        restaurant: "Burger House",
        platform: "Getir",
        status: "Onay Bekliyor",
        createdAt: new Date().toISOString(),
        totalPrice: 265.5,
        address: "Kadikoy, Istanbul"
      },
      {
        id: "1246",
        restaurant: "Sushi Lab",
        platform: "Migros",
        status: "Yeni",
        createdAt: new Date().toISOString(),
        totalPrice: 420,
        address: "Besiktas, Istanbul"
      },
      {
        id: "1247",
        restaurant: "Ankara Pizza",
        platform: "Yemeksepeti",
        status: "Hazirlaniyor",
        createdAt: new Date().toISOString(),
        totalPrice: 310,
        address: "Cankaya, Ankara"
      }
    ],
    courierStatus: {
      online: 16,
      break: 4,
      offline: 6
    },
    health: [
      { label: "Webhook Getir", status: "ok", detail: "Son 2 dk" },
      { label: "Webhook Migros", status: "warning", detail: "Retry 3" },
      { label: "Queue", status: "ok", detail: "Normal" }
    ]
  });
}
