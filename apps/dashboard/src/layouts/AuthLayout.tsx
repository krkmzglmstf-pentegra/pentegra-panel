import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

export type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
};

export function AuthLayout({ children, title, subtitle, bullets }: AuthLayoutProps) {
  return (
    <div className="bg-auth min-h-screen">
      <div className="relative min-h-screen px-6 py-10 lg:px-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="gradient-orb absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full" />
          <div className="gradient-orb absolute bottom-[-200px] right-[-120px] h-[520px] w-[520px] rounded-full" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col items-stretch gap-10 lg:flex-row lg:items-center">
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-pink-500 px-4 py-3 text-white shadow-glow">
                KP
              </div>
              <div>
                <p className="font-heading text-xl font-semibold">Kurye Panel</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">Premium SaaS deneyimi</p>
              </div>
            </div>
            <h1 className="mt-8 font-heading text-3xl font-semibold leading-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-600 dark:text-slate-300">{subtitle}</p>
            <div className="mt-8 space-y-3">
              {bullets.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-brand-500 to-pink-500" />
                  {item}
                </div>
              ))}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn('flex w-full max-w-xl flex-col')}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
