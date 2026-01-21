"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type PlatformKey = "getir" | "trendyol" | "yemeksepeti" | "migros";

const platforms: Array<{ key: PlatformKey; label: string }> = [
  { key: "getir", label: "Getir Yemek" },
  { key: "trendyol", label: "Trendyol GO" },
  { key: "yemeksepeti", label: "Yemeksepeti" },
  { key: "migros", label: "Migros Yemek" }
];

type IntegrationForm = {
  apiKey: string;
  apiSecret: string;
  platformRestaurantId: string;
  autoApprove: boolean;
  autoPrint: boolean;
  tokenStatus?: string;
  lastChecked?: string;
};

type IntegrationPayload = Partial<IntegrationForm> & {
  api_key?: string;
  api_secret?: string;
  api_key_masked?: string;
  api_secret_masked?: string;
  platform_restaurant_id?: string;
  auto_approve?: boolean;
  auto_print?: boolean;
  token_status?: string;
  last_checked?: string;
};

function normalizePayload(payload?: IntegrationPayload): IntegrationForm {
  return {
    apiKey: payload?.apiKey ?? payload?.api_key ?? "",
    apiSecret: payload?.apiSecret ?? payload?.api_secret ?? "",
    platformRestaurantId: payload?.platformRestaurantId ?? payload?.platform_restaurant_id ?? "",
    autoApprove: payload?.autoApprove ?? payload?.auto_approve ?? false,
    autoPrint: payload?.autoPrint ?? payload?.auto_print ?? false,
    tokenStatus: payload?.tokenStatus ?? payload?.token_status,
    lastChecked: payload?.lastChecked ?? payload?.last_checked
  };
}

export default function RestaurantIntegrationsPage() {
  const [activeTab, setActiveTab] = React.useState<PlatformKey>("getir");
  const [forms, setForms] = React.useState<Record<PlatformKey, IntegrationForm>>(() => ({
    getir: normalizePayload(),
    trendyol: normalizePayload(),
    yemeksepeti: normalizePayload(),
    migros: normalizePayload()
  }));

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant-integrations", activeTab],
    queryFn: () =>
      apiGet<IntegrationPayload | { data?: IntegrationPayload }>(
        `/api/restaurant/integrations?platform=${activeTab}`
      ),
    staleTime: 60_000
  });

  React.useEffect(() => {
    if (!data) return;
    const payload = (data as any)?.data ?? data;
    setForms((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], ...normalizePayload(payload) }
    }));
  }, [data, activeTab]);

  const current = forms[activeTab];

  const updateField = (field: keyof IntegrationForm, value: string | boolean) => {
    setForms((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value
      }
    }));
  };

  const saveIntegration = async () => {
    try {
      const res = await fetch("/api/restaurant/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: activeTab,
          apiKey: current.apiKey,
          apiSecret: current.apiSecret,
          platformRestaurantId: current.platformRestaurantId,
          autoApprove: current.autoApprove,
          autoPrint: current.autoPrint
        })
      });
      if (!res.ok) {
        toast.error("Kaydetme basarisiz");
        return;
      }
      toast.success("Entegrasyon bilgileri guncellendi");
    } catch {
      toast.error("Sunucu hatasi");
    }
  };

  const testConnection = async () => {
    try {
      const res = await fetch(`/api/restaurant/integrations/test?platform=${activeTab}`, {
        method: "POST"
      });
      if (!res.ok) {
        toast.error("Baglanti testi basarisiz");
        return;
      }
      toast.success("Baglanti testi baslatildi");
    } catch {
      toast.error("Baglanti hatasi");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entegrasyonlar"
        description="Platform bazli API bilgilerini girin ve baglanti durumunu takip edin."
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PlatformKey)}>
        <TabsList className="w-full flex-wrap">
          {platforms.map((platform) => (
            <TabsTrigger key={platform.key} value={platform.key} className="flex-1">
              {platform.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map((platform) => (
          <TabsContent key={platform.key} value={platform.key}>
            <Card className="p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="secondary">{platform.label}</Badge>
                {current.tokenStatus && (
                  <span className="text-xs text-muted-foreground">
                    Token: {current.tokenStatus}
                  </span>
                )}
                {current.lastChecked && (
                  <span className="text-xs text-muted-foreground">
                    Son kontrol: {current.lastChecked}
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    value={current.apiKey}
                    onChange={(event) => updateField("apiKey", event.target.value)}
                    placeholder="API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input
                    type="password"
                    value={current.apiSecret}
                    onChange={(event) => updateField("apiSecret", event.target.value)}
                    placeholder="API Secret"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Platform Restoran ID</Label>
                  <Input
                    value={current.platformRestaurantId}
                    onChange={(event) => updateField("platformRestaurantId", event.target.value)}
                    placeholder="Platform restoran kodu"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-4">
                  <div>
                    <p className="text-sm font-medium">Otomatik Onay</p>
                    <p className="text-xs text-muted-foreground">Siparisleri otomatik onayla.</p>
                  </div>
                  <Switch
                    checked={current.autoApprove}
                    onCheckedChange={(value) => updateField("autoApprove", value)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-4">
                  <div>
                    <p className="text-sm font-medium">Otomatik Yazdirma</p>
                    <p className="text-xs text-muted-foreground">Fisleri otomatik yazdir.</p>
                  </div>
                  <Switch
                    checked={current.autoPrint}
                    onCheckedChange={(value) => updateField("autoPrint", value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={testConnection} disabled={isLoading}>
                  Baglantiyi test et
                </Button>
                <Button onClick={saveIntegration} disabled={isLoading}>
                  Kaydet
                </Button>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
