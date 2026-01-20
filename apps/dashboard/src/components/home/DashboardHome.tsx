import * as React from 'react';
import { ArrowUpRight, ClipboardList, Settings, Store, Truck } from 'lucide-react';
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
