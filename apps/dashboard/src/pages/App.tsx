import React, { useEffect, useMemo, useState } from 'react';

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

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState<string[]>([]);

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

  useEffect(() => {
    if (!token || !me) return;
    let endpoint = '';
    if (me.role === 'admin' || me.role === 'ops') {
      endpoint = `${API_BASE}/stream/admin?token=${encodeURIComponent(token)}`;
    } else if (me.role === 'restaurant' && me.restaurant_id) {
      endpoint = `${API_BASE}/stream/restaurants/${me.restaurant_id}?token=${encodeURIComponent(token)}`;
    }
    if (!endpoint) return;

    const eventSource = new EventSource(endpoint, { withCredentials: false });
    eventSource.onmessage = (evt) => {
      setEvents((prev) => [evt.data, ...prev].slice(0, 20));
    };
    return () => eventSource.close();
  }, [token, me]);

  const roleLabel = useMemo(() => (me ? `${me.role}` : 'guest'), [me]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = (await res.json()) as ApiResponse<{ token: string }>;
    if (data.ok && data.data?.token) {
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setMe(null);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          Pentegra Ops
        </div>
        <div className="topbar-right">
          <span className="pill">{roleLabel}</span>
          {token && (
            <button className="button ghost" onClick={logout}>
              Cikis
            </button>
          )}
        </div>
      </header>

      {!token && (
        <main className="login-grid">
          <section className="hero card">
            <div className="hero-tag">B2B Multi-Tenant</div>
            <h1>Order pool, auto-approve, auto-assign.</h1>
            <p>
              Single panel for restaurants, courier fleet, and live order stream. Fast, stable,
              production-grade.
            </p>
            <div className="hero-stats">
              <div>
                <strong>3</strong>
                <span>Platform</span>
              </div>
              <div>
                <strong>1-50</strong>
                <span>Restaurant</span>
              </div>
              <div>
                <strong>1-10+</strong>
                <span>Courier</span>
              </div>
            </div>
          </section>
          <section className="card login-card">
            <h2>Giris</h2>
            <p className="small">Admin veya restoran hesabinizla devam edin.</p>
            <form onSubmit={login} className="form">
              <label>
                E-posta
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@firma.com"
                />
              </label>
              <label>
                Sifre
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </label>
              <button className="button" type="submit">
                Giris Yap
              </button>
            </form>
            <div className="hint">Test hesaplari README icinde.</div>
          </section>
        </main>
      )}

      {token && me && (
        <main className="dashboard">
          <section className="card identity">
            <div className="identity-header">
              <div>
                <h3>Hizli Ozet</h3>
                <p className="small">Bugun gelen siparis akisi ve durumlar.</p>
              </div>
              <span className="pill">{me.tenant_id ?? 'tenant'}</span>
            </div>
            <div className="stats">
              <div className="stat">
                <span>Toplam</span>
                <strong>{orders.length}</strong>
              </div>
              <div className="stat">
                <span>Aktif</span>
                <strong>{orders.filter((o) => o.status !== 'COMPLETED').length}</strong>
              </div>
              <div className="stat">
                <span>Tamam</span>
                <strong>{orders.filter((o) => o.status === 'COMPLETED').length}</strong>
              </div>
            </div>
          </section>

          <section className="card orders">
            <h3>Siparisler</h3>
            <div className="list">
              {orders.length === 0 && <div className="small">Henuz siparis yok.</div>}
              {orders.map((order) => (
                <div key={order.id} className="order-row">
                  <div>
                    <div className="order-id">{order.platform_order_id}</div>
                    <div className="small">{order.platform}</div>
                  </div>
                  <span className="pill">{order.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>Canli Akis (SSE)</h3>
            <div className="list">
              {events.length === 0 && <div className="small">Henuz event yok.</div>}
              {events.map((evt, idx) => (
                <div key={idx} className="event-row">
                  {evt}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
