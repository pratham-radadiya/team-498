'use client';

export function SkeletonCard() {
  return (
    <div className="card-flat p-4 space-y-3 animate-pulse bg-white border border-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-2.5 w-20 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-5 w-14 bg-slate-200 rounded-full" />
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="h-3 w-36 bg-slate-200 rounded" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export function SkeletonKanban() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-6 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 animate-pulse">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
      <div className="divide-y divide-slate-100 p-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 w-1/4">
              <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
              <div className="space-y-1 w-full">
                <div className="h-3 w-28 bg-slate-200 rounded" />
                <div className="h-2.5 w-16 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
