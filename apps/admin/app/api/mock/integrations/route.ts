import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      platform: "Getir",
      apiKeyMasked: "GET***789",
      apiSecretMasked: "SEC***456",
      tokenStatus: "aktif",
      lastChecked: "Bugun 10:45"
    },
    {
      platform: "Migros",
      apiKeyMasked: "MIG***321",
      apiSecretMasked: "SEC***912",
      tokenStatus: "suresi doldu",
      lastChecked: "Bugun 09:12"
    },
    {
      platform: "Yemeksepeti",
      apiKeyMasked: "YS***654",
      apiSecretMasked: "SEC***111",
      tokenStatus: "baglanti yok",
      lastChecked: "Dun 21:30"
    }
  ]);
}
