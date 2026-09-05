import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="h-8 w-8 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      {action}
    </div>
  );
}
