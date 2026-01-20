import * as React from 'react';
import {
  ArrowUpRight,
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Moon,
  Search,
  Settings,
  Store,
  Truck,
  Users,
  Wrench
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type Me = {
  user_id: string;
  role: 'admin' | 'ops' | 'restaurant' | 'courier';
  tenant_id?: string;
  restaurant_id?: string;
};

type Order = {
  id: string;
  platform: string;
  platform_order_id: string;
  status: string;
  created_at: string;
};

type DashboardHomeProps = {
  me: Me;
  orders: Order[];
  onLogout: () => void;
};

const roleLabels: Record<Me['role'], string> = {
  admin: 'Admin',
  ops: 'Ops',
  restaurant: 'Restaurant',
  courier: 'Courier'
};

export function DashboardHome({ me, orders, onLogout }: DashboardHomeProps) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const totalOrders = orders.length;
  const todayOrders = orders.filter((order) => {
    const created = new Date(order.created_at);
    return !Number.isNaN(created.getTime()) && created >= startOfDay;
  }).length;
  const pendingOrders = orders.filter((order) =>
    ['RECEIVED', 'NEW_PENDING', 'APPROVED', 'PREPARED'].includes(order.status)
  ).length;
  const assignedOrders = orders.filter((order) =>
    ['ASSIGNED', 'DELIVERY'].includes(order.status)
  ).length;
  const last24hOrders = orders.filter((order) => {
    const created = new Date(order.created_at);
    return !Number.isNaN(created.getTime()) && created >= last24h;
  }).length;

  const quickActions =
    me.role === 'admin' || me.role === 'ops'
      ? [
          { label: 'Restoran ekle', icon: <Store className="h-4 w-4" /> },
          { label: 'Entegrasyon ayarlari', icon: <Settings className="h-4 w-4" /> },
          { label: 'Siparisler', icon: <ClipboardList className="h-4 w-4" /> }
        ]
      : me.role === 'restaurant'
        ? [
            { label: 'Siparislerim', icon: <ClipboardList className="h-4 w-4" /> },
            { label: 'Canli akis', icon: <ArrowUpRight className="h-4 w-4" /> }
          ]
        : [{ label: 'Sistem hazir', icon: <Truck className="h-4 w-4" /> }];

  const recentOrders = orders.slice(0, 6);

  if (me.role === 'admin' || me.role === 'ops') {
    const adminNav = [
      { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Kurye Firmalari', icon: <Truck className="h-4 w-4" /> },
      { label: 'Restoranlar', icon: <Store className="h-4 w-4" /> },
      { label: 'Siparisler', icon: <ClipboardList className="h-4 w-4" /> },
      { label: 'Kuryeler', icon: <Users className="h-4 w-4" /> },
      { label: 'Raporlar', icon: <FileText className="h-4 w-4" /> },
      { label: 'Sistem Ayarlari', icon: <Wrench className="h-4 w-4" /> },
      { label: 'Kullanicilar', icon: <Users className="h-4 w-4" /> },
      { label: 'Analytics', icon: <ArrowUpRight className="h-4 w-4" /> },
      { label: 'API Entegrasyon', icon: <Settings className="h-4 w-4" /> },
      { label: 'Loglar', icon: <FileText className="h-4 w-4" /> }
    ];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-pink-500 text-sm font-bold text-white shadow-glow">
                KP
              </div>
              <div className="relative hidden items-center md:flex">
                <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-white pl-9 text-sm text-slate-700 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  placeholder="Ara..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:inline-flex">
                <Bell className="h-4 w-4" />
              </button>
              <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:inline-flex">
                <Moon className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {roleLabels[me.role]}
              </div>
              <Button variant="secondary" size="sm" onClick={onLogout}>
                Cikis
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden rounded-3xl border border-slate-200/60 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 lg:block">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Menu
            </p>
            <div className="mt-4 space-y-1">
              {adminNav.map((item, idx) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    idx === 0
                      ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  type="button"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-6">
            <Card className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Overview</p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Hos geldiniz, {me.user_id.slice(0, 6)}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Sistem genel görünümünü ve kritik metrikleri buradan izleyebilirsiniz.
              </p>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Toplam siparis', value: totalOrders },
                { label: 'Bugun gelen', value: todayOrders },
                { label: 'Bekleyen', value: pendingOrders },
                { label: 'Son 24 saat', value: last24hOrders }
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Son siparisler</h2>
                  <span className="text-xs text-slate-400">Son 24 saat</span>
                </div>
                <div className="mt-4 space-y-3">
                  {recentOrders.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      Henuz siparis yok. Webhooklardan veri gelince burada goruntulenecek.
                    </div>
                  )}
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {order.platform}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          #{order.platform_order_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                          {order.status}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                  <h2 className="text-lg font-semibold">Hizli islemler</h2>
                  <div className="mt-4 grid gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-slate-800 dark:text-brand-300">
                            {action.icon}
                          </span>
                          {action.label}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                  <h2 className="text-lg font-semibold">Sistem durumu</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      { label: 'Webhook', status: 'Aktif', ok: true },
                      { label: 'Database', status: 'Gozlem', ok: false },
                      { label: 'Queue', status: 'Aktif', ok: true }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                      >
                        <span>{item.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.ok
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                          }`}
                        >
                          {item.ok ? 'Sorunsuz' : item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Dashboard Overview</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Hos geldin, {me.user_id.slice(0, 6)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                {roleLabels[me.role]}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 font-medium text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                ID: {me.user_id.slice(0, 8)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Cikis
            </Button>
          </div>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Bugun gelen', value: todayOrders },
            { label: 'Bekleyen/onay', value: pendingOrders },
            { label: 'Atanmis/teslim', value: assignedOrders },
            { label: 'Son 24 saat', value: last24hOrders }
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-400">Toplam {totalOrders} siparis</p>
            </Card>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Son siparisler</h2>
              <span className="text-xs text-slate-400">Son 24 saat</span>
            </div>
            <div className="mt-4 space-y-3">
              {recentOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Henuz siparis yok. Webhooklardan veri gelince burada goruntulenecek.
                </div>
              )}
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{order.platform}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">#{order.platform_order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-200">
                      {order.status}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-white/40 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <h2 className="text-lg font-semibold">Hizli islemler</h2>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-slate-800 dark:text-brand-300">
                      {action.icon}
                    </span>
                    {action.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
