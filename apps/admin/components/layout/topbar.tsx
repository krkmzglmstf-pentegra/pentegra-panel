"use client";

import { Bell } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { TenantSwitcher } from "./tenant-switcher";
import { ThemeToggle } from "./theme-toggle";
import { ProfileMenu } from "./profile-menu";

export function TopBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <TenantSwitcher />
        <CommandPalette />
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
