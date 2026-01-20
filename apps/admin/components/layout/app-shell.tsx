import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-6">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <TopBar />
          {children}
        </main>
      </div>
    </div>
  );
}
