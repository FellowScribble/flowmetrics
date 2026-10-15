import { cn } from '../../lib/cn';

const tones = {
  neutral: 'bg-zinc-800 text-zinc-300',
  brand: 'bg-brand-950 text-brand-300',
  success: 'bg-emerald-950 text-emerald-300',
  warning: 'bg-amber-950 text-amber-300',
  danger: 'bg-red-950 text-red-300',
};

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}
