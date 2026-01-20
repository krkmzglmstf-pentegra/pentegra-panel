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
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from "recharts";

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

  const courierChart = [
    { name: "Online", value: data.courierStatus.online },
    { name: "Break", value: data.courierStatus.break },
    { name: "Offline", value: data.courierStatus.offline }
  ];

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

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kurye Durumlari</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courierChart}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <RechartsTooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operasyon Sagligi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.health.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-sm"
                >
                  <span>{item.label}</span>
                  <StatusBadge
                    status={item.status === "ok" ? "Teslim" : item.status === "warning" ? "Onay Bekliyor" : "Iptal"}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Harita / Konum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/40 text-sm text-muted-foreground">
            Harita entegrasyonu sonraki adimda eklenecek.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
