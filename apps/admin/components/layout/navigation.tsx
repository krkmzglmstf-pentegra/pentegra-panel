import { LayoutDashboard, ClipboardList, Store, Truck } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Siparisler", href: "/app/orders", icon: ClipboardList },
  { label: "Restoranlar", href: "/app/restaurants", icon: Store },
  { label: "Kuryeler", href: "/app/couriers", icon: Truck }
];
