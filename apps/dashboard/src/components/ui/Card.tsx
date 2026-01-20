import * as React from 'react';
import { cn } from '../../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'glass' | 'plain';
};

export function Card({ className, variant = 'glass', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl p-8',
        variant === 'glass' ? 'glass-card' : 'bg-white shadow-card dark:bg-slate-900',
        className
      )}
      {...props}
    />
  );
}
