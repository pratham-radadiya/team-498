import { Users, ShieldCheck, FileText, CalendarClock, Clock, CalendarOff, Wallet } from "lucide-react";
import { ROLES } from "@/lib/constants/roles";

const ALL_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.HR_MANAGER,
  ROLES.HR_PAYROLL_USER,
  ROLES.HR_PAYROLL_MANAGER,
  ROLES.ADMIN,
];

const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN];

/**
 * Nav items wired to real screens only (Phase 1: Employees, Admin > Users;
 * Phase 2: Contracts, Working Schedules; Phase 3: Attendance; Phase 4: Time
 * Off). Later phases add entries here without touching Sidebar.jsx itself.
 *
 * Time Off's three screens live under one dropdown group, per
 * Docs/api/phase-4-time-off.md: "do not scatter these as separate top-level
 * pages."
 */
const NAV_ITEMS = [
  {
    type: "link",
    href: "/employees",
    label: "Employees",
    icon: Users,
    roles: ALL_ROLES,
  },
  {
    type: "link",
    href: "/contracts",
    label: "Contracts",
    icon: FileText,
    roles: ALL_ROLES,
  },
  {
    type: "link",
    href: "/working-schedules",
    label: "Working Schedules",
    icon: CalendarClock,
    roles: ALL_ROLES,
  },
  {
    type: "link",
    href: "/attendance",
    label: "Attendance",
    icon: Clock,
    roles: ALL_ROLES,
  },
  {
    type: "group",
    label: "Time Off",
    icon: CalendarOff,
    roles: ALL_ROLES,
    items: [
      { href: "/time-off/requests", label: "Requests" },
      { href: "/time-off/allocations", label: "Allocations" },
      { href: "/time-off/types", label: "Time Off Types" },
    ],
  },
  {
    // Neither Employee nor HR Manager get any access here — per
    // Docs/api/phase-5-salary.md's role matrix, this is the one module
    // where HR Manager's usual "full HR" access doesn't carry over.
    type: "group",
    label: "Payroll",
    icon: Wallet,
    roles: PAYROLL_ROLES,
    items: [
      { href: "/payroll/structures", label: "Structures" },
      { href: "/payroll/rules", label: "Rules" },
    ],
  },
  {
    type: "link",
    href: "/admin/users",
    label: "User Management",
    icon: ShieldCheck,
    roles: [ROLES.ADMIN],
  },
];

export default NAV_ITEMS;
