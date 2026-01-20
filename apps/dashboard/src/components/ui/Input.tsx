import * as React from 'react';
import { cn } from '../../lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, action, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        <span className="sr-only">{label}</span>
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl border border-slate-200 bg-white/70 px-10 py-2.5 text-base text-slate-900 shadow-sm backdrop-blur focus:border-brand-400 focus:ring-2 focus:ring-brand-200/70 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-200/70',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {action && <span className="absolute right-3 top-1/2 -translate-y-1/2">{action}</span>}
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </label>
    );
  }
);
Input.displayName = 'Input';
