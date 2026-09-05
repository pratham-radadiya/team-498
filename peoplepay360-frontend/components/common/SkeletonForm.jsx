import Skeleton from "@/components/ui/Skeleton";

/**
 * Full-page skeleton for *FormPage.jsx / detail pages — mirrors PageHeader's
 * markup and the "rounded-lg border bg-white p-6" card + FormField grid
 * every form page already uses, so the page header and card don't pop into
 * existence once loading finishes (no layout jump).
 */
export default function SkeletonForm({ fields = 6 }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
