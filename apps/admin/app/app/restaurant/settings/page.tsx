"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function RestaurantSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Restoran Ayarlari"
        description="Otomatik onay ve bildirim tercihlerini yonetin."
      />
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
          <div>
            <p className="text-sm font-medium">Otomatik Onay</p>
            <p className="text-xs text-muted-foreground">Yeni siparisleri otomatik onayla.</p>
          </div>
          <Switch defaultChecked onCheckedChange={() => toast.success("Otomatik onay guncellendi")} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
          <div>
            <p className="text-sm font-medium">Siparis Bildirimleri</p>
            <p className="text-xs text-muted-foreground">Yeni siparis gelince uyar.</p>
          </div>
          <Switch onCheckedChange={() => toast.success("Bildirim tercihi guncellendi")} />
        </div>
      </Card>
    </div>
  );
}
