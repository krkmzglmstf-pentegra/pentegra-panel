"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { DashboardSnapshot } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<DashboardSnapshot>("/api/mock/dashboard")
  });

  if (isLoading) {
    return <LoadingBlock />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Dashboard verisi alinamadi"
        description="Mock API erisimi saglanamadi. Lutfen daha sonra tekrar deneyin."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operasyon Ozeti"
        description="Gunluk siparis, kurye ve entegrasyon sagligi tek ekranda."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bugunku Siparis" value={data.stats.todaysOrders} hint="Son 24 saat" />
        <StatCard label="Onay Bekleyen" value={data.stats.pendingApprovals} hint="Otomatik onay" />
        <StatCard label="Aktif Kurye" value={data.stats.activeCouriers} hint="Online durum" />
        <StatCard label="Ortalama Teslim" value={`${data.stats.avgDeliveryMinutes} dk`} hint="Bugun" />
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
            <Badge variant="success">Online {data.courierStatus.online}</Badge>
            <Badge variant="warning">Break {data.courierStatus.break}</Badge>
            <Badge variant="secondary">Offline {data.courierStatus.offline}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" />
            <div className="absolute left-6 top-6 rounded-2xl bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-soft">
              Canli harita entegrasyonu burada goruntulenecek.
            </div>
            <div className="absolute bottom-6 right-6 rounded-2xl bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-soft">
              12 aktif kurye, 8 aktif siparis
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son Siparis Akisi</CardTitle>
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
