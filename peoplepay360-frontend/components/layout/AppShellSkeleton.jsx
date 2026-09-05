import Skeleton from "@/components/ui/Skeleton";

/**
 * Shown by RouteGuard while the session is being checked. Mirrors
 * AppShell/Sidebar/Topbar's exact markup so the real shell mounts in the
 * same place with no layout jump once auth resolves.
 */
export default function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950" aria-hidden="true">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:block">
        <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-2 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-end gap-2 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
