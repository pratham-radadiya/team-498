import Skeleton from "@/components/ui/Skeleton";

/**
 * Drop-in replacement for <Spinner/> inside a table's card wrapper. Matches
 * the thead/tbody chrome every *Table.jsx already uses (bg-zinc-50 header,
 * divide-y rows, px-4 py-2.5 cells) so swapping in real rows doesn't shift
 * the layout.
 */
export default function SkeletonTable({ columns = 5, rows = 6 }) {
  return (
    <div className="overflow-x-auto" aria-hidden="true">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-2.5 text-left">
                <Skeleton className="h-3.5 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-2.5">
                  <Skeleton className="h-4 w-full max-w-40" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
