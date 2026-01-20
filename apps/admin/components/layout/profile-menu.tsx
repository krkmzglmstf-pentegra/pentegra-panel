"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearAuth, getAuthUser } from "@/lib/auth";

export function ProfileMenu() {
  const router = useRouter();
  const user = getAuthUser();
  const initials = user?.name?.slice(0, 2)?.toUpperCase() ?? "AD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-sm shadow-soft">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-semibold text-muted-foreground md:inline">
            {user?.name ?? "Admin"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Settings className="h-4 w-4" />
          Ayarlar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            clearAuth();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Cikis yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
