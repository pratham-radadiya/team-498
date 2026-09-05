import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange, rowCount }) {
  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
      <span>{rowCount} total records</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-md p-1.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page + 1 >= totalPages}
          className="rounded-md p-1.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
