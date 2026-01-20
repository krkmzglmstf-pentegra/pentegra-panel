"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Order } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";

export default function RestaurantDashboardPage() {
  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ["restaurant-orders"],
    queryFn: () => apiGet<{ ok: boolean; data: any[] }>("/api/restaurant/orders")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !ordersData) {
    return (
      <EmptyState
        title="Restoran dashboard verisi alinamadi"
        description="Mock API erisimi saglanamadi."
      />
    );
  }

  const orders: Order[] = (ordersData.data ?? []).map((o) => ({
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

  const todaysOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Onay Bekliyor").length;
  const inDelivery = orders.filter((o) => o.status === "Yolda").length;
  const avgPrepMinutes = 0;
  const liveOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restoran Operasyon Ozeti"
        description="Siparisleriniz ve kurye durumu tek ekranda."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bugunku Siparis" value={todaysOrders} />
        <StatCard label="Onay Bekleyen" value={pendingOrders} />
        <StatCard label="Yolda" value={inDelivery} />
        <StatCard label="Ortalama Hazirlik" value={`${avgPrepMinutes} dk`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Canli Siparis Akisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {liveOrders.map((order) => (
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
