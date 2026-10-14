import { cn } from '../../lib/cn';

export default function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100',
        'placeholder:text-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        'disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600',
        error ? 'border-red-500' : 'border-zinc-700',
        className,
      )}
      {...props}
    />
  );
}
