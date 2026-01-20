import { Badge } from "@/components/ui/badge";

export function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    Getir: "default",
    Yemeksepeti: "secondary",
    Migros: "outline"
  };
  const variant = map[platform] ?? "secondary";
  return <Badge variant={variant}>{platform}</Badge>;
}
