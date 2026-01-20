import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "c1",
      name: "Ayse Demir",
      status: "online",
      activeOrders: 2,
      autoAssign: true
    },
    {
      id: "c2",
      name: "Mehmet Kaya",
      status: "break",
      activeOrders: 1,
      autoAssign: true
    },
    {
      id: "c3",
      name: "Deniz Acar",
      status: "offline",
      activeOrders: 0,
      autoAssign: false
    }
  ]);
}
