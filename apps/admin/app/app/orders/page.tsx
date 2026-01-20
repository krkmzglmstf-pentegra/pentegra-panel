"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Order } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { toast } from "sonner";

export default function OrdersPage() {
  const [selected, setSelected] = React.useState<Order | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiGet<{ ok: boolean; data: any[] }>("/api/admin/orders")
  });
  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiGet<{ ok: boolean; data: any[] }>("/api/admin/restaurants")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) {
    return <EmptyState title="Siparisler yuklenemedi" description="API erisimi saglanamadi." />;
  }

  const restaurantMap = new Map<string, string>();
  for (const r of restaurants?.data ?? []) {
    restaurantMap.set(r.id, r.name);
  }

  const orders: Order[] = (data.data ?? []).map((o) => ({
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siparisler"
        description="Platformlardan gelen siparisleri filtreleyin ve aksiyon alin."
        action={<Button onClick={() => toast.success("Yeni siparis olusturuldu")}>Yeni Siparis</Button>}
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Siparis ID veya restoran ara" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Restoran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum restoranlar</SelectItem>
              {(restaurants?.data ?? []).map((r: any) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum durumlar</SelectItem>
              <SelectItem value="pending">Onay Bekliyor</SelectItem>
              <SelectItem value="delivered">Teslim</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum platformlar</SelectItem>
              <SelectItem value="getir">Getir</SelectItem>
              <SelectItem value="ys">Yemeksepeti</SelectItem>
              <SelectItem value="migros">Migros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Restoran</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{order.restaurant}</TableCell>
                <TableCell>
                  <PlatformBadge platform={order.platform} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>{order.totalPrice.toFixed(2)} TL</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(order)}>
                    Detay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Siparis Detayi</SheetTitle>
            <SheetDescription>Detayli siparis bilgileri ve aksiyonlar.</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl border border-border/70 bg-background p-4">
                <p className="font-semibold">{selected.restaurant}</p>
                <p className="text-xs text-muted-foreground">{selected.address}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
                <span>Platform</span>
                <PlatformBadge platform={selected.platform} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
                <span>Durum</span>
                <StatusBadge status={selected.status} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => toast.success("Siparis onaylandi")}>Onayla</Button>
                <Button variant="outline" onClick={() => toast.error("Siparis reddedildi")}>
                  Reddet
                </Button>
                <Button variant="secondary" onClick={() => toast.success("Kurye atamasi baslatildi")}>
                  Atama
                </Button>
                <Button variant="ghost" onClick={() => toast.success("Yazdirma kuyruga eklendi")}>
                  Yazdir
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
