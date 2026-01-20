"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { RestaurantDashboardSnapshot } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";

export default function RestaurantDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurant-dashboard"],
    queryFn: () => apiGet<RestaurantDashboardSnapshot>("/api/mock/restaurant/dashboard")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Restoran dashboard verisi alinamadi"
        description="Mock API erisimi saglanamadi."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restoran Operasyon Ozeti"
        description="Siparisleriniz ve kurye durumu tek ekranda."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bugunku Siparis" value={data.stats.todaysOrders} />
        <StatCard label="Onay Bekleyen" value={data.stats.pendingOrders} />
        <StatCard label="Yolda" value={data.stats.inDelivery} />
        <StatCard label="Ortalama Hazirlik" value={`${data.stats.avgPrepMinutes} dk`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Canli Siparis Akisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.liveOrders.map((order) => (
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
