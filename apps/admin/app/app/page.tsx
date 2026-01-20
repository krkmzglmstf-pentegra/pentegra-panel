"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default function AppIndex() {
  const router = useRouter();
  useEffect(() => {
    const user = getAuthUser();
    router.replace(user?.role === "restaurant" ? "/app/restaurant/dashboard" : "/app/dashboard");
  }, [router]);
  return null;
}
