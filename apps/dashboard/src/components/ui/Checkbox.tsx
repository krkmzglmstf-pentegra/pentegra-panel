import * as React from 'react';
import { cn } from '../../lib/cn';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  const inputId = id ?? React.useId();
  return (
    <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-300 dark:border-slate-600 dark:bg-slate-900',
          className
        )}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
