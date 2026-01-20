import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';

const API_BASE =
  import.meta.env.VITE_API_BASE ?? 'https://pentegra-api.krkmzglmstf.workers.dev/api';

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

type LoginRole = 'admin' | 'restaurant';

type StoredSession = {
  token: string;
  remember: boolean;
};

const schema = z.object({
  email: z.string().email('Gecerli bir e-posta girin.'),
  password: z.string().min(6, 'Sifre en az 6 karakter olmalidir.')
});

type LoginValues = z.infer<typeof schema>;

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

export function App() {
  const stored = loadSession();
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [rememberMe, setRememberMe] = useState<boolean>(stored?.remember ?? true);
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');
  const [capsLockOn, setCapsLockOn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json() as Promise<ApiResponse<Me>>)
      .then((res) => {
        if (res.ok && res.data) {
          setMe(res.data);
        } else {
          setMe(null);
        }
      })
      .catch(() => setMe(null));
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

  const roleLabel = useMemo(() => (me ? `${me.role}` : 'guest'), [me]);
  const greetingName = useMemo(() => (me ? me.user_id.slice(0, 6) : 'Kullanici'), [me]);

  async function onSubmit(values: LoginValues) {
    setLoginError('');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const data = (await res.json()) as ApiResponse<{ token: string }>;
    if (data.ok && data.data?.token) {
      const session = { token: data.data.token, remember: rememberMe };
      persistSession(session);
      setToken(data.data.token);
    } else {
      setLoginError(data.error?.message ?? 'E-posta veya sifre hatali.');
    }
  }

  function logout() {
    clearSession();
    setToken(null);
    setMe(null);
  }

  function fillDemo(role: LoginRole) {
    setSelectedRole(role);
    if (role === 'admin') {
      setValue('email', 'admin@demo.local');
      setValue('password', 'Admin123!');
    } else {
      setValue('email', 'restoran@demo.local');
      setValue('password', 'Restoran123!');
    }
  }

  return (
    <div className="app-shell">
      {!token && (
        <AuthLayout
          title="Guvenli ve hizli operasyon girisi"
          subtitle="Canli siparis akisini izle, otomatik atama ile dakikalar icinde servis baslat."
          bullets={['Canli siparis akisi', 'Otomatik atama', 'Getir/Migros/YS entegrasyonu']}
        >
          <Card className="glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">Giris tipi</p>
                <h2 className="font-heading text-2xl font-semibold">{selectedRole === 'admin' ? 'Admin' : 'Restoran'}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white shadow-glow'
                      : 'bg-white/70 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('restaurant')}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    selectedRole === 'restaurant'
                      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-white shadow-glow'
                      : 'bg-white/70 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Restoran
                </button>
              </div>
            </div>

            {loginError && <Alert className="mt-6" tone="error">{loginError}</Alert>}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@firma.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Sifre"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                icon={<Lock className="h-4 w-4" />}
                action={
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sifreyi gizle' : 'Sifreyi goster'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                hint={capsLockOn ? 'Caps Lock acik.' : undefined}
                onKeyUp={(event) => setCapsLockOn(event.getModifierState('CapsLock'))}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-sm">
                <Checkbox label="Beni hatirla" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <button type="button" className="text-brand-500 hover:text-brand-600" aria-disabled>
                  Sifremi unuttum
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Giris yapiliyor...' : 'Giris yap'}
              </Button>

              <div className="grid gap-3 md:grid-cols-2">
                <Button type="button" variant="secondary" onClick={() => fillDemo('admin')}>
                  Demo Admin
                </Button>
                <Button type="button" variant="secondary" onClick={() => fillDemo('restaurant')}>
                  Demo Restoran
                </Button>
              </div>
            </form>

            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              Destek icin yoneticinizle iletisime gecin.
            </p>
          </Card>
        </AuthLayout>
      )}

      {token && me && (
        <div className="dashboard-layout">
          <header className="header-bar">
            <div className="header-left">
              <h1 className="greeting">
                Merhaba, {greetingName}!
                <span className={`status-badge ${orders.length ? 'online' : 'offline'}`}>
                  {orders.length ? 'online' : 'offline'}
                </span>
              </h1>
            </div>
            <div className="header-right">
              <button className="notification">
                Bildirim
                <span className="badge-count">3</span>
              </button>
              <button className="ghost-btn" onClick={logout}>
                Cikis
              </button>
              <span className="pill">{roleLabel}</span>
            </div>
          </header>

          <aside className="sidebar">
            <div className="sidebar-brand">KuryeTakip</div>
            <nav className="nav-links">
              <a className="nav-item active" href="#">
                Dashboard
              </a>
              <a className="nav-item" href="#">
                Siparisler
              </a>
              <a className="nav-item" href="#">
                Kuryeler
              </a>
              <a className="nav-item" href="#">
                Ayarlar
              </a>
            </nav>
          </aside>

          <main className="main-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="icon-circle">TR</div>
                <div className="value">{orders.length}</div>
                <div className="label">Toplam Siparis</div>
              </div>
              <div className="stat-card">
                <div className="icon-circle blue">OK</div>
                <div className="value">{orders.filter((o) => o.status === 'COMPLETED').length}</div>
                <div className="label">Teslim Edilen</div>
              </div>
            </div>

            <div className="map-container">
              <div id="map">Harita alani</div>
              <button className="my-location">LOC</button>
            </div>

            <h2 className="section-title">Aktif Siparisler</h2>
            <div className="orders-list">
              {orders.length === 0 && <div className="empty">Aktif siparis yok.</div>}
              {orders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h3 className="restaurant-name">{order.platform}</h3>
                    <div className="order-meta">
                      <span className="time">#{order.platform_order_id}</span>
                      <span className="distance">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span className="status-badge pending">{order.status}</span>
                  </div>
                  <button className="accept-order">Kabul</button>
                </div>
              ))}
            </div>
          </main>

          <nav className="bottom-nav">
            <a className="nav-item active" href="#">
              <div className="icon">AN</div>
              <span className="label">Ana</span>
            </a>
            <a className="nav-item" href="#">
              <div className="icon">SP</div>
              <span className="label">Siparis</span>
            </a>
            <a className="nav-item" href="#">
              <div className="icon">KR</div>
              <span className="label">Kurye</span>
            </a>
            <a className="nav-item" href="#">
              <div className="icon">AY</div>
              <span className="label">Ayar</span>
            </a>
          </nav>

          <button className="fab">+</button>
        </div>
      )}
    </div>
  );
}
