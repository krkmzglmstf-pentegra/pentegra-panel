"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Integration, Restaurant } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type IntegrationPayload = Partial<Integration> & {
  api_key_masked?: string;
  api_secret_masked?: string;
  token_status?: Integration["tokenStatus"];
  last_checked?: string;
};

function normalizeIntegration(item: IntegrationPayload): Integration {
  return {
    platform: item.platform ?? "Getir",
    apiKeyMasked: item.apiKeyMasked ?? item.api_key_masked ?? "••••••••",
    apiSecretMasked: item.apiSecretMasked ?? item.api_secret_masked ?? "••••••••",
    tokenStatus: item.tokenStatus ?? item.token_status ?? "baglanti yok",
    lastChecked: item.lastChecked ?? item.last_checked ?? "—"
  };
}

export default function IntegrationsPage() {
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiGet<Restaurant[] | { items: Restaurant[] }>("/api/admin/restaurants")
  });

  const restaurantList = Array.isArray(restaurants) ? restaurants : restaurants?.items ?? [];
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<string | undefined>(
    restaurantList[0]?.id
  );

  React.useEffect(() => {
    if (!selectedRestaurant && restaurantList.length > 0) {
      setSelectedRestaurant(restaurantList[0].id);
    }
  }, [restaurantList, selectedRestaurant]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["integrations", selectedRestaurant],
    queryFn: () =>
      apiGet<IntegrationPayload[] | { items: IntegrationPayload[] }>(
        `/api/admin/integrations?restaurantId=${selectedRestaurant ?? ""}`
      ),
    enabled: !!selectedRestaurant
  });

  const integrations = Array.isArray(data) ? data : data?.items ?? [];

  if (restaurantsLoading || isLoading) return <LoadingBlock />;
  if (!selectedRestaurant) {
    return <EmptyState title="Restoran bulunamadi" description="Once restoran ekleyin." />;
  }
  if (isError || integrations.length === 0) {
    return <EmptyState title="Entegrasyonlar yuklenemedi" description="Entegrasyon verisine ulasilamadi." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entegrasyonlar"
        description="Platform baglantilarini ve token durumlarini yonetin."
      />

      <Card className="p-4">
        <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
          <SelectTrigger className="w-full md:w-[320px]">
            <SelectValue placeholder="Restoran sec" />
          </SelectTrigger>
          <SelectContent>
            {restaurantList.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {integrations.map((raw) => {
          const item = normalizeIntegration(raw);
          return (
            <Card key={item.platform} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{item.platform}</h3>
              <Badge
                variant={
                  item.tokenStatus === "aktif"
                    ? "success"
                    : item.tokenStatus === "suresi doldu"
                      ? "warning"
                      : "error"
                }
              >
                {item.tokenStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input placeholder="Yeni API Key girin" />
              <p className="text-xs text-muted-foreground">Mevcut: {item.apiKeyMasked}</p>
            </div>
            <div className="space-y-2">
              <Label>API Secret</Label>
              <Input placeholder="Yeni API Secret girin" type="password" />
              <p className="text-xs text-muted-foreground">Mevcut: {item.apiSecretMasked}</p>
            </div>
            <p className="text-xs text-muted-foreground">Son kontrol: {item.lastChecked}</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => toast.success("Baglanti testi basladi")}>
                Baglantiyi test et
              </Button>
              <Button onClick={() => toast.success("Entegrasyon guncellendi")}>Kaydet</Button>
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
