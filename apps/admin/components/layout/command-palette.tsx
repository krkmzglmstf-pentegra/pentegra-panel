"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getNavItems } from "./navigation";
import { getAuthUser } from "@/lib/auth";
import { Plus, Search } from "lucide-react";

const actions = [
  { label: "Restoran ekle", href: "/app/restaurants" },
  { label: "Siparis ara", href: "/app/orders" },
  { label: "Kurye ekle", href: "/app/couriers" }
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const user = getAuthUser();
  const navItems = getNavItems(user?.role ?? "admin");

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        Komut ara...
        <span className="ml-2 rounded-md border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Sayfa ya da aksiyon ara..." />
            <CommandList>
              <CommandEmpty>Sonuc bulunamadi.</CommandEmpty>
              <CommandGroup heading="Sayfalar">
                {navItems.map((item) => (
                  <CommandItem
                    key={item.href}
                    onSelect={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Hizli islemler">
                {actions.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
