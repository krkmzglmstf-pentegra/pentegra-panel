import { LayoutDashboard, ClipboardList, Store, Truck, Activity, Settings } from "lucide-react";

export const adminNavItems = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Siparisler", href: "/app/orders", icon: ClipboardList },
  { label: "Restoranlar", href: "/app/restaurants", icon: Store },
  { label: "Kuryeler", href: "/app/couriers", icon: Truck }
];

export const restaurantNavItems = [
  { label: "Dashboard", href: "/app/restaurant/dashboard", icon: LayoutDashboard },
  { label: "Siparislerim", href: "/app/restaurant/orders", icon: ClipboardList },
  { label: "Canli Takip", href: "/app/restaurant/live", icon: Activity },
  { label: "Ayarlar", href: "/app/restaurant/settings", icon: Settings }
];

export function getNavItems(role: "admin" | "restaurant") {
  return role === "restaurant" ? restaurantNavItems : adminNavItems;
}
