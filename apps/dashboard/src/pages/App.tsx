import React, { useEffect, useMemo, useState } from 'react';

type Me = {
  user_id: string;
  role: 'admin' | 'ops' | 'restaurant' | 'courier';
  tenant_id?: string;
  restaurant_id?: string;
};

type ApiResponse<T> = { ok: boolean; data?: T; error?: { code: string; message: string } };

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [me, setMe] = useState<Me | null>(null);
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
    <div className="container">
      <div className="header">
        <div className="brand">PENTEGRA PANEL</div>
        <div className="tag">{roleLabel}</div>
      </div>

      {!token && (
        <div className="card" style={{ maxWidth: 420 }}>
          <h2>Giris</h2>
          <form onSubmit={login}>
            <label>
              E-posta
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Sifre
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <div style={{ marginTop: 16 }}>
              <button className="button" type="submit">
                Giris Yap
              </button>
            </div>
          </form>
        </div>
      )}

      {token && me && (
        <div className="grid">
          <div className="card">
            <h3>Kimlik</h3>
            <div className="list">
              <div>ID: {me.user_id}</div>
              <div>Tenant: {me.tenant_id ?? '-'}</div>
              <div>Restaurant: {me.restaurant_id ?? '-'}</div>
            </div>
            <button className="button secondary" style={{ marginTop: 16 }} onClick={logout}>
              Cikis
            </button>
          </div>
          <div className="card">
            <h3>Canli Akis (SSE)</h3>
            <div className="list">
              {events.length === 0 && <div className="small">Hen?z event yok.</div>}
              {events.map((evt, idx) => (
                <div key={idx}>{evt}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
