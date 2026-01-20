import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

type PublicHomeLayoutProps = {
  children: React.ReactNode;
};

export function PublicHomeLayout({ children }: PublicHomeLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-home">
      <div className="pointer-events-none absolute -left-40 top-12 h-72 w-72 rounded-full bg-brand-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-pink-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full gradient-orb" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-pink-500 text-sm font-bold text-white shadow-glow">
            KP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Kurye Panel</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Operasyon kontrol merkezi</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 text-xs text-slate-500 dark:text-slate-400 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            99.9% uptime
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ISO-ready security
          </span>
        </div>
      </header>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-16">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
            Premium Ops Suite
          </div>
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              Siparis operasyonlarini tek panelde hizlandir.
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
              Restoran ve kurye is akisini canli takip edin. Otomatik onay, atama ve bildirimlerle
              dakikalar kazanin.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: 'Canli siparis akisi',
                desc: 'Saniyelik guncellemelerle operasyonu izleyin.',
                icon: <Sparkles className="h-5 w-5" />
              },
              {
                title: 'Otomatik atama',
                desc: 'Mesafeye gore en uygun kuryeyi secin.',
                icon: <Zap className="h-5 w-5" />
              },
              {
                title: 'Guvenli entegrasyon',
                desc: 'Getir, Migros ve YS entegrasyonlari tek yerde.',
                icon: <ShieldCheck className="h-5 w-5" />
              }
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-slate-800 dark:text-brand-300">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-white/50 bg-white/60 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              2 dk ortalama onay
            </span>
            <span className="rounded-full border border-white/50 bg-white/60 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              Otomatik dispatch
            </span>
            <span className="rounded-full border border-white/50 bg-white/60 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
              KVKK uyumlu
            </span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
          className="w-full"
        >
          {children}
        </motion.section>
      </div>
    </div>
  );
}
