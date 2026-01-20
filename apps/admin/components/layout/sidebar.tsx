"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl border border-border/70 bg-card/80 p-4 shadow-soft lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold shadow-glow">
          KT
        </div>
        <div>
          <p className="text-sm font-semibold">Kurye Takip</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <div className="mt-6 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto rounded-2xl border border-border/60 bg-background p-4 text-xs text-muted-foreground">
        Otomatik atama, webhook ve entegrasyon durumu burada izlenir.
      </div>
    </aside>
  );
}
