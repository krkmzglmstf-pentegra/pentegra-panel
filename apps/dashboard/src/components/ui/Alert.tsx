import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: 'error' | 'info';
};

export function Alert({ className, tone = 'info', ...props }: AlertProps) {
  const base = 'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm';
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200',
    info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200'
  };
  return (
    <div className={cn(base, tones[tone], className)} role="alert" {...props}>
      {tone === 'error' && <AlertTriangle className="mt-0.5 h-4 w-4" />}
      <div>{props.children}</div>
    </div>
  );
}
