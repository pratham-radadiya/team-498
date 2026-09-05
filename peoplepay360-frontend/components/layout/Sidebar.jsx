"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import NAV_ITEMS from "@/lib/constants/navigation";

function NavLink({ href, label, icon: Icon, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {label}
    </Link>
  );
}

function NavGroup({ item, pathname }) {
  const childActive = item.items.some((child) => pathname.startsWith(child.href));
  const [open, setOpen] = useState(childActive);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          childActive
            ? "text-indigo-700 dark:text-indigo-400"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-700">
          {item.items.map((child) => (
            <NavLink key={child.href} href={child.href} label={child.label} active={pathname.startsWith(child.href)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white sm:block dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <span className="text-sm font-bold tracking-tight text-indigo-600 dark:text-indigo-400">PeoplePay360</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((item) =>
          item.type === "group" ? (
            <NavGroup key={item.label} item={item} pathname={pathname} />
          ) : (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href)} />
          )
        )}
      </nav>
    </aside>
  );
}
