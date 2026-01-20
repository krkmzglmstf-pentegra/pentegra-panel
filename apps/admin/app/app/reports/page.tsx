"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporlar"
        description="Gunluk operasyon, teslimat ve performans raporlari."
      />
      <Card className="p-6">
        <EmptyState
          title="Raporlar yakinda"
          description="Raporlama panelleri bir sonraki adimda aktif edilecek."
        />
      </Card>
    </div>
  );
}
