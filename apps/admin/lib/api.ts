import { getAuthToken, clearAuth } from "@/lib/auth";

export async function apiGet<T>(path: string): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(path, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    throw new Error("API error");
  }
  return (await res.json()) as T;
}
