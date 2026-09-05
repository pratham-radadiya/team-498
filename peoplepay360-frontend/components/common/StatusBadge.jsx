const TONES = {
  Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  Inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Running: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  Expired: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  Absent: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  Refused: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export default function StatusBadge({ status }) {
  const tone = TONES[status] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}
