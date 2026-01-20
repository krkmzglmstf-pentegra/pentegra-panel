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

const API_BASE =
  import.meta.env.VITE_API_BASE ?? 'https://pentegra-api.krkmzglmstf.workers.dev/api';

type LoginRole = 'admin' | 'restaurant';

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

export function App() {
  const stored = loadSession();
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [rememberMe, setRememberMe] = useState<boolean>(stored?.remember ?? true);
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [loginError, setLoginError] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');

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
      const session = { token: data.data.token, remember: rememberMe };
      persistSession(session);
      setToken(data.data.token);
      setLoginState('success');
    } else {
      setLoginState('error');
      setLoginError(data.error?.message ?? 'Giris basarisiz');
    }
  }

  function logout() {
    clearSession();
    setToken(null);
    setMe(null);
    setLoginState('idle');
  }

  function fillDemo(role: LoginRole) {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@demo.local');
      setPassword('Admin123!');
    } else {
      setEmail('restoran@demo.local');
      setPassword('Restoran123!');
    }
  }

  return (
    <div className="app-shell" data-theme="light">
      {!token && (
        <div className="login-container">
          <div className="background-elements">
            <div className="gradient-orb orb-1" />
            <div className="gradient-orb orb-2" />
            <div className="particle p1" />
            <div className="particle p2" />
            <div className="particle p3" />
            <div className="particle p4" />
          </div>

          <div />
          <div className="login-card">
            <div className="logo-block">
              <div className="logo-badge">KT</div>
              <div>
                <h1 className="logo-title">KuryeTakip</h1>
                <p className="logo-subtitle">Glassmorphism Luxury Dashboard</p>
              </div>
            </div>

            <div className="role-selection">
              <button
                type="button"
                className={`role-card ${selectedRole === 'admin' ? 'selected admin' : ''}`}
                onClick={() => setSelectedRole('admin')}
              >
                <div className="role-title">Admin</div>
                <div className="role-desc">Tumu gor</div>
              </button>
              <button
                type="button"
                className={`role-card ${selectedRole === 'restaurant' ? 'selected restaurant' : ''}`}
                onClick={() => setSelectedRole('restaurant')}
              >
                <div className="role-title">Restoran</div>
                <div className="role-desc">Kendi siparislerin</div>
              </button>
            </div>

            <form onSubmit={login}>
              <div className="input-group">
                <span className="input-icon">?</span>
                <input
                  className={`input-field ${loginState === 'error' ? 'input-error' : ''}`}
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="input-label">E-posta</span>
                {loginState === 'error' && loginError && (
                  <span className="field-error">{loginError}</span>
                )}
              </div>

              <div className="input-group">
                <span className="input-icon">??</span>
                <input
                  className={`input-field ${loginState === 'error' ? 'input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="input-label">Sifre</span>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Gizle' : 'Goster'}
                </button>
              </div>

              <div className="login-options">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Beni hatirla
                </label>
                <a className="link" href="#">
                  Sifremi unuttum
                </a>
              </div>

              <button
                className={`login-button ${loginState === 'loading' ? 'loading' : ''} ${
                  loginState === 'success' ? 'success' : ''
                }`}
                type="submit"
                disabled={loginState === 'loading'}
              >
                {loginState === 'loading'
                  ? 'Giris Yapiliyor...'
                  : loginState === 'success'
                    ? 'Basarili'
                    : 'Giris Yap'}
              </button>
            </form>

            <div className="demo-buttons">
              <button type="button" className="demo-button admin" onClick={() => fillDemo('admin')}>
                Demo Admin
              </button>
              <button
                type="button"
                className="demo-button restaurant"
                onClick={() => fillDemo('restaurant')}
              >
                Demo Restoran
              </button>
            </div>

            <div className="footer-links">
              <span className="muted">Hesabin yok?</span>
              <a className="link bold" href="#">
                Kayit ol
              </a>
            </div>
          </div>
          <div />
        </div>
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
