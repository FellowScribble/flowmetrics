import { useId } from 'react';
import { cn } from '../../lib/cn';

export default function Select({ className, error, label, id, children, ...props }) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const message = typeof error === 'string' ? error : null;

  const select = (
    <select
      id={selectId}
      aria-invalid={error ? true : undefined}
      aria-describedby={message ? `${selectId}-error` : undefined}
      className={cn(
        'w-full rounded-lg border bg-zinc-950 px-3 py-2 text-sm text-zinc-100',
        'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        'disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-500',
        error ? 'border-red-500' : 'border-zinc-700',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );

  if (!label && !message) return select;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-zinc-400">
          {label}
        </label>
      )}
      {select}
      {message && (
        <p id={`${selectId}-error`} className="text-xs text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
