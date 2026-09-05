import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
