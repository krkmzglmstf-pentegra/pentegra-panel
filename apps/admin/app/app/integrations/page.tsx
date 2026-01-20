"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Integration } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingBlock } from "@/components/shared/loading-block";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function IntegrationsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => apiGet<Integration[]>("/api/mock/integrations")
  });

  if (isLoading) return <LoadingBlock />;
  if (isError || !data) {
    return <EmptyState title="Entegrasyonlar yuklenemedi" description="Mock API erisimi saglanamadi." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entegrasyonlar"
        description="Platform baglantilarini ve token durumlarini yonetin."
      />

      <Card className="p-4">
        <Select defaultValue="r1">
          <SelectTrigger className="w-full md:w-[320px]">
            <SelectValue placeholder="Restoran sec" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="r1">Burger House</SelectItem>
            <SelectItem value="r2">Sushi Lab</SelectItem>
            <SelectItem value="r3">Ankara Pizza</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {data.map((item) => (
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
              <Input value={item.apiKeyMasked} readOnly />
            </div>
            <div className="space-y-2">
              <Label>API Secret</Label>
              <Input value={item.apiSecretMasked} readOnly />
            </div>
            <p className="text-xs text-muted-foreground">Son kontrol: {item.lastChecked}</p>
            <Button variant="secondary">Baglantiyi test et</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
