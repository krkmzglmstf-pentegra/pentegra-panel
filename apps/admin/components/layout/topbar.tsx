"use client";

import { Bell, Building2, Utensils } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ProfileMenu } from "./profile-menu";
import { getAuthUser } from "@/lib/auth";

export function TopBar() {
  const user = getAuthUser();
  const companyName = user?.tenantId ? `Firma ${user.tenantId.slice(0, 6)}` : "Kurye Firmasi";
  const restaurantName = user?.restaurantId ? `Restoran ${user.restaurantId.slice(0, 6)}` : undefined;
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-2">
          <Building2 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Firma</p>
            <p className="text-sm font-semibold">{companyName}</p>
          </div>
        </div>
        {restaurantName && (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-2">
            <Utensils className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Restoran</p>
              <p className="text-sm font-semibold">{restaurantName}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
