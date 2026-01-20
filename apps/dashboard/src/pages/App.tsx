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
  const [showPassword, setShowPassword] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [loginError, setLoginError] = useState<string>('');

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
  const greetingName = useMemo(() => (me ? me.user_id.slice(0, 6) : 'Kullanici'), [me]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginState('loading');
    setLoginError('');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = (await res.json()) as ApiResponse<{ token: string }>;
    if (data.ok && data.data?.token) {
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setLoginState('success');
    } else {
      setLoginState('error');
      setLoginError(data.error?.message ?? 'Giris basarisiz');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setMe(null);
    setLoginState('idle');
  }

  return (
    <div className="app-shell" data-theme="light">
      {!token && (
        <div className="login-screen">
          <div className="login-card">
            <div className="login-hero">
              <div className="login-logo">KuryeTakip</div>
            </div>

            <form onSubmit={login} className="login-form">
              <label className="field">
                E-posta
                <input
                  className={`input ${loginState === 'error' ? 'input-error' : ''}`}
                  type="email"
                  placeholder="ornek@firma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {loginState === 'error' && loginError && (
                  <span className="field-error">{loginError}</span>
                )}
              </label>

              <label className="field">
                Sifre
                <div className="password-wrapper">
                  <input
                    className={`input ${loginState === 'error' ? 'input-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Gizle' : 'Goster'}
                  </button>
                </div>
              </label>

              <button
                className={`login-btn ${loginState === 'success' ? 'success' : ''}`}
                type="submit"
                disabled={loginState === 'loading'}
              >
                {loginState === 'loading'
                  ? 'Giris Yapiliyor...'
                  : loginState === 'success'
                    ? 'Basarili'
                    : 'Giris Yap'}
              </button>

              <div className="separator">veya</div>

              <button type="button" className="social-btn">
                Google ile devam et
              </button>
              <button type="button" className="social-btn">
                Apple ile devam et
              </button>

              <div className="links">
                <a className="link" href="#">
                  Sifremi unuttum
                </a>
                <span className="muted">Hesabin yok?</span>
                <a className="link bold" href="#">
                  Kayit ol
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {token && me && (
        <div className="dashboard-layout">
          <header className="header-bar">
            <div className="header-left">
              <h1 className="greeting">
                Merhaba, {greetingName}!
                <span className={`status-badge ${events.length ? 'online' : 'offline'}`}>
                  {events.length ? 'online' : 'offline'}
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
                <div className="icon-circle">??</div>
                <div className="value">{orders.length}</div>
                <div className="label">Toplam Siparis</div>
              </div>
              <div className="stat-card">
                <div className="icon-circle blue">?</div>
                <div className="value">{orders.filter((o) => o.status === 'COMPLETED').length}</div>
                <div className="label">Teslim Edilen</div>
              </div>
            </div>

            <div className="map-container">
              <div id="map">Harita alani</div>
              <button className="my-location">?</button>
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
              <div className="icon">??</div>
              <span className="label">Ana</span>
            </a>
            <a className="nav-item" href="#">
              <div className="icon">??</div>
              <span className="label">Siparis</span>
            </a>
            <a className="nav-item" href="#">
              <div className="icon">??</div>
              <span className="label">Kurye</span>
            </a>
            <a className="nav-item" href="#">
              <div className="icon">??</div>
              <span className="label">Ayar</span>
            </a>
          </nav>

          <button className="fab">+</button>
        </div>
      )}
    </div>
  );
}
