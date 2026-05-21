import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

import { cn } from '../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-white/60 bg-card/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-white/10 dark:bg-card/80 dark:shadow-black/20',
        className,
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-border/70 bg-white/80 px-3.5 py-2.5 text-sm outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-4 dark:bg-slate-950/40',
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm dark:border-white/10 dark:bg-white/10',
        className,
      )}
      {...props}
    />
  );
}
