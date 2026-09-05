export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
