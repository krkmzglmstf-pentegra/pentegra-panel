"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Order } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { StatusBadge } from "@/components/shared/status-badge";

export default function RestaurantLivePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurant-live"],
    queryFn: () => apiGet<{ ok: boolean; data: any[] }>("/api/restaurant/orders")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) {
    return <EmptyState title="Canli takip verisi yok" description="Mock API erisimi saglanamadi." />;
  }

  const orders: Order[] = (data.data ?? []).map((o) => ({
    id: o.id,
    restaurant: o.restaurant_id ?? "Restoran",
    platform: o.platform === "getir" ? "Getir" : o.platform === "migros" ? "Migros" : "Yemeksepeti",
    status:
      o.status === "RECEIVED"
        ? "Yeni"
        : o.status === "NEW_PENDING"
          ? "Onay Bekliyor"
          : o.status === "APPROVED" || o.status === "PREPARED"
            ? "Hazirlaniyor"
            : o.status === "DELIVERY" || o.status === "ASSIGNED"
              ? "Yolda"
              : o.status === "COMPLETED"
                ? "Teslim"
                : "Iptal",
    createdAt: o.created_at,
    totalPrice: 0,
    address: o.delivery_provider ?? "-"
  }));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Canli Takip"
        description="Kuryelerin konumlarini ve aktif siparisleri izleyin."
      />

      <Card>
        <CardHeader>
          <CardTitle>Canli Harita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[380px] overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />
            <div className="absolute left-6 top-6 rounded-2xl bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-soft">
              Canli harita entegrasyonu burada goruntulenecek.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktif Siparisler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">{order.restaurant}</p>
                <p className="text-xs text-muted-foreground">{order.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <PlatformBadge platform={order.platform} />
                <StatusBadge status={order.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
