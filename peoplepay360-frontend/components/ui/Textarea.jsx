import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea({ className = "", invalid = false, rows = 3, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`block w-full rounded-md border-0 px-3 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-inset placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-500 ${
        invalid ? "ring-red-400 focus:ring-red-500 dark:ring-red-500" : "ring-zinc-300 dark:ring-zinc-700"
      } ${className}`}
      {...props}
    />
  );
});

export default Textarea;
