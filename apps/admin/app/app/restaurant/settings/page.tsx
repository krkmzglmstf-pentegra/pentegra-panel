"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RestaurantSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Restoran Ayarlari"
        description="Otomatik onay ve yazdirma ayarlari admin tarafindan belirlenir."
      />
      <Card className="p-6 space-y-4">
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

        <Button onClick={() => toast.success("Talep admin ekibine iletildi")}>Degisiklik Talebi Gonder</Button>
      </Card>
    </div>
  );
}
