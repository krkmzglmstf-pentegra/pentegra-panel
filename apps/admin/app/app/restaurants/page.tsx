"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Restaurant } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlatformBadge } from "@/components/shared/platform-badge";

export default function RestaurantsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiGet<Restaurant[]>("/api/mock/restaurants")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) {
    return <EmptyState title="Restoranlar yuklenemedi" description="Mock API erisimi saglanamadi." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restoranlar"
        description="Restoran bilgilerini, platform kimliklerini ve otomasyon ayarlarini yonetin."
        action={
          <Dialog>
            <DialogTrigger asChild>
              <Button>Restoran Ekle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Restoran</DialogTitle>
                <DialogDescription>Platform entegrasyon bilgilerini kaydedin.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Restoran Adi</Label>
                  <Input placeholder="Ornek Restoran" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Platform Restoran ID</Label>
                    <Input placeholder="rest-123" />
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <Input placeholder="Getir / Migros" />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Latitude</Label>
                    <Input placeholder="41.01" />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input placeholder="28.98" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-3">
                  <div>
                    <p className="text-sm font-medium">Otomatik Onay</p>
                    <p className="text-xs text-muted-foreground">Yeni siparisleri otomatik onayla.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-3">
                  <div>
                    <p className="text-sm font-medium">Otomatik Yazdirma</p>
                    <p className="text-xs text-muted-foreground">Siparis fişini otomatik yazdir.</p>
                  </div>
                  <Switch />
                </div>
                <Button className="w-full">Kaydet</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restoran</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Platform ID</TableHead>
              <TableHead>Otomatik Onay</TableHead>
              <TableHead>Otomatik Yazdirma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">{restaurant.name}</TableCell>
                <TableCell>
                  <PlatformBadge platform={restaurant.platform} />
                </TableCell>
                <TableCell>{restaurant.platformRestaurantId}</TableCell>
                <TableCell>{restaurant.autoApprove ? "Acik" : "Kapali"}</TableCell>
                <TableCell>{restaurant.autoPrint ? "Acik" : "Kapali"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
