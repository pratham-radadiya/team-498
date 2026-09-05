import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500 dark:text-zinc-400">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
