"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken, getAuthUser } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const user = getAuthUser();
    if (user?.role === "restaurant" && pathname.startsWith("/app/") && !pathname.startsWith("/app/restaurant")) {
      router.replace("/app/restaurant/dashboard");
      return;
    }
    if (user?.role === "admin" && pathname.startsWith("/app/restaurant")) {
      router.replace("/app/dashboard");
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Yukleniyor...</div>
      </div>
    );
  }

  return <>{children}</>;
}
