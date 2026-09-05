/**
 * Base shimmer block — the one primitive every skeleton in the app is built
 * from (SkeletonTable, SkeletonForm, SkeletonKanban, AppShellSkeleton).
 * Uses Tailwind's built-in `animate-pulse` (no custom keyframes/deps) and
 * responds to `prefers-color-scheme` automatically via the `dark:` variant.
 */
export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700 ${className}`} aria-hidden="true" />;
}
