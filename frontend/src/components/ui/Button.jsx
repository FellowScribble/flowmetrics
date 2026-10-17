import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-500 focus-visible:ring-brand-500 disabled:bg-brand-950 disabled:text-brand-400/50 shadow-sm shadow-brand-950/60 hover:shadow-md hover:shadow-brand-600/40',
  secondary:
    'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 focus-visible:ring-zinc-500 disabled:text-zinc-500 shadow-sm shadow-black/40 hover:shadow-md hover:shadow-black/50',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 disabled:bg-red-950 disabled:text-red-400/50 shadow-sm shadow-red-950/60 hover:shadow-md hover:shadow-red-600/40',
  ghost:
    'text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-zinc-600',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all motion-safe:active:scale-[0.98]',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
