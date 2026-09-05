import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
  ghost: "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-sm",
  md: "px-3.5 py-2 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
