import { cn } from '../../lib/cn';

export default function Select({ className, error, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100',
        'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        'disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600',
        error ? 'border-red-500' : 'border-zinc-700',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
