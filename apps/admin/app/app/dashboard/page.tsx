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
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => apiGet<{ ok: boolean; data: any[] }>("/api/admin/orders")
  });
  const { data: restaurantsData } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: () => apiGet<{ ok: boolean; data: any[] }>("/api/admin/restaurants")
  });

  if (isLoading) {
    return <LoadingBlock />;
  }

  if (isError || !ordersData) {
    return (
      <EmptyState
        title="Dashboard verisi alinamadi"
        description="Mock API erisimi saglanamadi. Lutfen daha sonra tekrar deneyin."
      />
    );
  }

  const restaurantMap = new Map<string, string>();
  for (const r of restaurantsData?.data ?? []) {
    restaurantMap.set(r.id, r.name);
  }

  const orders: Order[] = (ordersData.data ?? []).map((o) => ({
    id: o.id,
    restaurant: restaurantMap.get(o.restaurant_id) ?? o.restaurant_id ?? "Bilinmeyen Restoran",
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
  const pendingApprovals = orders.filter((o) => o.status === "Onay Bekliyor").length;
  const activeCouriers = 0;
  const avgDeliveryMinutes = 0;
  const liveOrders = orders.slice(0, 6);
  const courierStatus = { online: 0, break: 0, offline: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operasyon Ozeti"
        description="Gunluk siparis, kurye ve entegrasyon sagligi tek ekranda."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bugunku Siparis" value={todaysOrders} hint="Son 24 saat" />
        <StatCard label="Onay Bekleyen" value={pendingApprovals} hint="Otomatik onay" />
        <StatCard label="Aktif Kurye" value={activeCouriers} hint="Online durum" />
        <StatCard label="Ortalama Teslim" value={`${avgDeliveryMinutes} dk`} hint="Bugun" />
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Canli Takip Haritasi</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kurye konumlari, aktif siparisler ve rota bilgileri.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Online {courierStatus.online}</Badge>
            <Badge variant="warning">Break {courierStatus.break}</Badge>
            <Badge variant="secondary">Offline {courierStatus.offline}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" />
            <div className="absolute left-6 top-6 rounded-2xl bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-soft">
              Canli harita entegrasyonu burada goruntulenecek.
            </div>
            <div className="absolute bottom-6 right-6 rounded-2xl bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-soft">
              0 aktif kurye, {liveOrders.length} aktif siparis
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son Siparis Akisi</CardTitle>
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
