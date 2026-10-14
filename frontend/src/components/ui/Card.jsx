import { cn } from '../../lib/cn';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-card border border-zinc-800 bg-zinc-900 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
