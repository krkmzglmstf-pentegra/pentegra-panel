"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Courier } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CouriersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["couriers"],
    queryFn: () => apiGet<Courier[] | { items: Courier[] }>("/api/admin/couriers")
  });

  const couriers = Array.isArray(data) ? data : data?.items ?? [];

  if (isLoading) return <LoadingBlock />;
  if (isError || couriers.length === 0) {
    return <EmptyState title="Kuryeler yuklenemedi" description="Kurye verisine ulasilamadi." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuryeler"
        description="Kurye durumlarini ve otomatik atama ayarlarini izleyin."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kurye</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Aktif Is</TableHead>
                <TableHead>Oto Atama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couriers.map((courier) => (
                <TableRow key={courier.id}>
                  <TableCell className="font-medium">{courier.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        courier.status === "online"
                          ? "success"
                          : courier.status === "break"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {courier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{courier.activeOrders}</TableCell>
                  <TableCell>
                    <Switch defaultChecked={courier.autoAssign} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Atama Kurallari</h3>
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <p className="text-sm font-medium">Mesafe Agirligi</p>
            <p className="text-xs text-muted-foreground">0.7 (yakinlik oncelikli)</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <p className="text-sm font-medium">Max Aktif Is</p>
            <p className="text-xs text-muted-foreground">3 siparis</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <p className="text-sm font-medium">Break Limiti</p>
            <p className="text-xs text-muted-foreground">15 dk</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
