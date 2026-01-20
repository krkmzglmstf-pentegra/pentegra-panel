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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { toast } from "sonner";

export default function RestaurantOrdersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurant-orders"],
    queryFn: () => apiGet<Order[]>("/api/mock/restaurant/orders")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) {
    return <EmptyState title="Siparisler yuklenemedi" description="Mock API erisimi saglanamadi." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Siparislerim"
        description="Gelen siparisleri hizlica aksiyonlayin."
        action={<Button onClick={() => toast.success("Siparisler guncellendi")}>Yenile</Button>}
      />

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Siparis ID veya adres ara" />
          <Input placeholder="Durum (Onay Bekliyor, Hazirlaniyor)" />
          <Input placeholder="Platform (Getir, Migros)" />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <PlatformBadge platform={order.platform} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>{order.totalPrice.toFixed(2)} ₺</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => toast.success("Siparis onaylandi")}>
                    Onayla
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.error("Siparis reddedildi")}>
                    Reddet
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
