"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Genel sistem ayarlari ve bildirim tercihleri."
      />
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
          <div>
            <p className="text-sm font-medium">Webhook bildirimleri</p>
            <p className="text-xs text-muted-foreground">Webhook hatalarini bildirim olarak al.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background p-4">
          <div>
            <p className="text-sm font-medium">Gunluk rapor</p>
            <p className="text-xs text-muted-foreground">Gun sonunda ozet rapor gonder.</p>
          </div>
          <Switch />
        </div>
      </Card>
    </div>
  );
}
