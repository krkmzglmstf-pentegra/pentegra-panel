"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RestaurantSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Restoran Ayarlari"
        description="Restoran tarafinda sadece goruntuleme ve talep olusturma yapilabilir."
      />
      <Card className="p-6 space-y-4">
        <div className="rounded-xl border border-border/70 bg-background p-4">
          <p className="text-sm font-medium">Entegrasyon Bilgileri</p>
          <p className="text-xs text-muted-foreground">
            Bu alanlar admin tarafindan yonetilir. Degisiklik icin talep gonderebilirsiniz.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input value="GET***789" readOnly />
            </div>
            <div className="space-y-2">
              <Label>API Secret</Label>
              <Input value="SEC***456" readOnly />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
          <div>
            <p className="text-sm font-medium">Otomatik Onay</p>
            <p className="text-xs text-muted-foreground">Admin tarafindan belirlenir.</p>
          </div>
          <Switch disabled />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
          <div>
            <p className="text-sm font-medium">Otomatik Yazdirma</p>
            <p className="text-xs text-muted-foreground">Admin tarafindan belirlenir.</p>
          </div>
          <Switch disabled />
        </div>

        <Button onClick={() => toast.success("Degisiklik talebi admin ekibine iletildi")}>
          Degisiklik Talebi Gonder
        </Button>
      </Card>
    </div>
  );
}
