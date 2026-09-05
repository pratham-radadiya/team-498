const PALETTE = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorOf(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i)) % PALETTE.length;
  return PALETTE[hash];
}

export default function Avatar({ name, size = "md" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass} ${colorOf(
        name
      )}`}
    >
      {initialsOf(name)}
    </span>
  );
}
