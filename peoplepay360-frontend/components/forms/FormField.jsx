export default function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500 dark:text-red-400"> *</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
    </div>
  );
}
