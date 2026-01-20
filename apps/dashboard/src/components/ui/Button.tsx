import * as React from 'react';
import { cn } from '../../lib/cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  isLoading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60';
    const variants = {
      primary:
        'bg-gradient-to-r from-brand-500 via-violet-500 to-pink-500 text-white shadow-glow hover:-translate-y-0.5 hover:shadow-lg',
      secondary:
        'bg-white/70 text-slate-900 backdrop-blur border border-white/40 hover:bg-white',
      ghost: 'bg-transparent text-slate-600 hover:text-slate-900'
    };
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base'
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        <span className={cn(isLoading && 'opacity-90')}>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
