import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-zinc-700 bg-zinc-900/60 px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-zinc-500" />
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {description && <p className="max-w-sm text-xs text-zinc-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
