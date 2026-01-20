import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tenants = [
  { id: "t1", name: "Atlas Kurye" },
  { id: "t2", name: "Hizli Dagitim" },
  { id: "t3", name: "Prime Courier" }
];

export function TenantSwitcher() {
  return (
    <Select defaultValue={tenants[0].id}>
      <SelectTrigger className="w-[220px] bg-background">
        <SelectValue placeholder="Kurye firmasi sec" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
