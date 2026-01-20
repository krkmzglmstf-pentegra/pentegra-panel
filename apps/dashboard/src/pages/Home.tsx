import React, { useEffect, useMemo, useState } from 'react';
import { LoginCard, type LoginRole, type LoginValues } from '../components/auth/LoginCard';
import { DashboardHome } from '../components/home/DashboardHome';
import { PublicHomeLayout } from '../layouts/PublicHomeLayout';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

type Me = {
  user_id: string;
  role: 'admin' | 'ops' | 'restaurant' | 'courier';
  tenant_id?: string;
  restaurant_id?: string;
};

type ApiResponse<T> = { ok: boolean; data?: T; error?: { code: string; message: string } };

type Order = {
  id: string;
  platform: string;
  platform_order_id: string;
  status: string;
  created_at: string;
};

type StoredSession = {
  token: string;
  remember: boolean;
};

function loadSession(): StoredSession | null {
  const raw = localStorage.getItem('session') ?? sessionStorage.getItem('session');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function persistSession(session: StoredSession) {
  if (session.remember) {
    localStorage.setItem('session', JSON.stringify(session));
    sessionStorage.removeItem('session');
  } else {
    sessionStorage.setItem('session', JSON.stringify(session));
    localStorage.removeItem('session');
  }
}

function clearSession() {
  localStorage.removeItem('session');
  sessionStorage.removeItem('session');
}

export function Home() {
  const stored = useMemo(() => loadSession(), []);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [rememberMe, setRememberMe] = useState<boolean>(stored?.remember ?? true);
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loginError, setLoginError] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    let cancelled = false;

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as ApiResponse<Me> | Me | null;
        if (cancelled) return;
        if (!response.ok) {
          clearSession();
          setToken(null);
          setMe(null);
          return;
        }
        if (payload && 'data' in payload && payload.data) {
          setMe(payload.data);
          return;
        }
        if (payload && 'user_id' in payload) {
          setMe(payload as Me);
          return;
        }
        clearSession();
        setToken(null);
        setMe(null);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setToken(null);
        setMe(null);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !me) return;
    const endpoint =
      me.role === 'admin' || me.role === 'ops'
        ? `${API_BASE}/admin/orders`
        : `${API_BASE}/restaurant/orders`;
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json() as Promise<ApiResponse<Order[]>>)
      .then((res) => setOrders(res.data ?? []))
      .catch(() => setOrders([]));
  }, [token, me]);

  async function onSubmit(values: LoginValues) {
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      let data: ApiResponse<{ token: string }> | null = null;
      try {
        data = (await res.json()) as ApiResponse<{ token: string }>;
      } catch {
        data = null;
      }
      const tokenValue = data?.data?.token ?? (data as { token?: string } | null)?.token;
      if (res.ok && tokenValue) {
        const session = { token: tokenValue, remember: rememberMe };
        persistSession(session);
        setToken(tokenValue);
        return;
      }
      setLoginError(data?.error?.message ?? 'E-posta veya sifre hatali.');
    } catch {
      setLoginError('Sunucuya baglanilamadi. Lutfen tekrar deneyin.');
    }
  }

  function logout() {
    clearSession();
    setToken(null);
    setMe(null);
  }

  if (!token) {
    return (
      <PublicHomeLayout>
        <LoginCard
          onSubmit={onSubmit}
          error={loginError}
          rememberMe={rememberMe}
          onRememberChange={setRememberMe}
          role={selectedRole}
          onRoleChange={setSelectedRole}
        />
      </PublicHomeLayout>
    );
  }

  if (token && !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-home">
        <div className="glass-card rounded-3xl px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-200">
          Oturum aciliyor...
        </div>
      </div>
    );
  }

  return <DashboardHome me={me} orders={orders} onLogout={logout} />;
}
