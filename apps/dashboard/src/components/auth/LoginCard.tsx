import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';

const schema = z.object({
  email: z.string().email('Gecerli bir e-posta girin.'),
  password: z.string().min(6, 'Sifre en az 6 karakter olmalidir.')
});

export type LoginValues = z.infer<typeof schema>;
export type LoginRole = 'admin' | 'restaurant';

export type LoginCardProps = {
  onSubmit: (values: LoginValues) => Promise<void>;
  error?: string;
  rememberMe: boolean;
  onRememberChange: (value: boolean) => void;
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
};

export function LoginCard({
  onSubmit,
  error,
  rememberMe,
  onRememberChange,
  role,
  onRoleChange
}: LoginCardProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [capsLockOn, setCapsLockOn] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <Card className="glass-card relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -right-16 top-8 h-32 w-32 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -left-12 bottom-6 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>
      <div className="relative space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Guvenli giris</p>
        <h2 className="font-heading text-2xl font-semibold text-slate-900 dark:text-white">
          Hesabiniza devam edin
        </h2>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRoleChange('admin')}
          className={`group relative rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
            role === 'admin'
              ? 'border-transparent bg-gradient-to-br from-indigo-500/15 via-violet-500/20 to-pink-500/20 text-slate-900 shadow-glow dark:text-white'
              : 'border-white/60 bg-white/60 text-slate-600 hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200'
          }`}
        >
          <span className="block text-base font-semibold">Admin</span>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Tumu yonet</span>
          <span
            className={`absolute right-3 top-3 h-2 w-2 rounded-full ${
              role === 'admin' ? 'bg-indigo-500' : 'bg-slate-300'
            }`}
          />
        </button>
        <button
          type="button"
          onClick={() => onRoleChange('restaurant')}
          className={`group relative rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
            role === 'restaurant'
              ? 'border-transparent bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-emerald-400/20 text-slate-900 shadow-glow dark:text-white'
              : 'border-white/60 bg-white/60 text-slate-600 hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200'
          }`}
        >
          <span className="block text-base font-semibold">Restoran</span>
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Siparislerini takip et</span>
          <span
            className={`absolute right-3 top-3 h-2 w-2 rounded-full ${
              role === 'restaurant' ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          />
        </button>
      </div>

      {error && <Alert className="mt-6" tone="error">{error}</Alert>}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="E-posta"
          type="email"
          placeholder="ornek@firma.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
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
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm">
          <Checkbox label="Beni hatirla" checked={rememberMe} onChange={(e) => onRememberChange(e.target.checked)} />
          <button type="button" className="text-brand-500 hover:text-brand-600" aria-disabled>
            Sifremi unuttum
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Giris yapiliyor...' : 'Giris yap'}
        </Button>
      </form>

      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        Destek icin yoneticinizle iletisime gecin.
      </p>
    </Card>
  );
}
