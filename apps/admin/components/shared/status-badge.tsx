import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "success" | "warning" | "error" | "secondary"> = {
    Teslim: "success",
    "Onay Bekliyor": "warning",
    "Yeni": "secondary",
    "Hazirlaniyor": "secondary",
    "Yolda": "secondary",
    "Iptal": "error"
  };
  const variant = map[status] ?? "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
