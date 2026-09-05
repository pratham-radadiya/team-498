import Skeleton from "@/components/ui/Skeleton";

/** Mirrors EmployeeKanban's column-of-cards markup. */
export default function SkeletonKanban({ columns = 3, cards = 3 }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2" aria-hidden="true">
      {Array.from({ length: columns }).map((_, c) => (
        <div key={c} className="flex w-72 shrink-0 flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: cards }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="mt-1.5 h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
