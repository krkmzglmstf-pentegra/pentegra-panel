import { LayoutDashboard, ClipboardList, Store, Truck, Plug, Settings } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Siparisler", href: "/app/orders", icon: ClipboardList },
  { label: "Restoranlar", href: "/app/restaurants", icon: Store },
  { label: "Kuryeler", href: "/app/couriers", icon: Truck },
  { label: "Entegrasyonlar", href: "/app/integrations", icon: Plug },
  { label: "Ayarlar", href: "/app/settings", icon: Settings }
];
