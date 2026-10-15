import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-500 focus-visible:ring-brand-500 disabled:bg-brand-950 disabled:text-brand-400/50',
  secondary:
    'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 focus-visible:ring-zinc-500 disabled:text-zinc-500',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 disabled:bg-red-950 disabled:text-red-400/50',
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
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
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
