# Phase 7 API Contract — Payroll Dashboard

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 7.

All endpoints require a valid session (`withAuth()`) → `401` if missing/inactive, then `requireRole(session, [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN])` → `403` for EMPLOYEE. This module is read-only (aggregation only) — there's no separate "write" role split, unlike Phase 5/6.

> **Two open items resolved before building, by explicit decision:**
> - **HR Manager gets read access** to this whole module (the plan's permission matrix originally flagged this as unspecified by the PDF).
> - **`employeeType`** in the filter body below is **not a real field** — there is no employee-type column anywhere in the schema. It's implemented as a proxy: the value is a `SalaryStructure` id (the same ids `GET /api/salary-structures/options` returns — `Regular Salary`/`Intern Salary`/`Contractor`), matched against the employee's current **Running** contract. It answers "what pay structure is this person on" as a stand-in for "what type of employee is this", which is the closest real analog this data has.

---

## The shared filter body

Every endpoint below takes the same `POST` body shape (all fields optional — omit any you don't need):

| Field | Type | Notes |
|---|---|---|
| `periodStart` | `"YYYY-MM-DD"` | Simple "on or after" check on the relevant date field per endpoint (see each endpoint) — **not** full interval-overlap logic like Contract/Payrun's own conflict checks |
| `periodEnd` | `"YYYY-MM-DD"` | "on or before" check, same field |
| `department` | string | Exact match against `Employee.department` |
| `employeeType` | string | A `SalaryStructure` id — see the proxy note above |
| `company` | string | Exact match against `Employee.company` |

If none of these are given, every endpoint reports across all data.

---

### `POST /api/dashboard/kpis` — salary payment KPIs
Filters on `Payrun.periodStart`.

**Response `200`:**
```json
{
  "totalNetSalary": 220419.4125,
  "payslipCount": 3,
  "byStatus": [
    { "status": "Draft", "count": 3, "netSalary": 220419.4125 }
  ]
}
```
`byStatus` mirrors `Payslip.status` (`Draft`/`Validated`/`Paid`) — this is the "paid/pending state" the mockup's spec note asks for.

---

### `POST /api/dashboard/salary-by-department` — realized payroll spend, grouped
Filters on `Payrun.periodStart`. Aggregates **actual computed Payslip `net`** — i.e. money that's genuinely been run through payroll, not a headcount/wage projection (see `department-overview` below for that).

**Response `200`:**
```json
[
  { "department": "Engineering", "totalNetSalary": 53898.64375, "payslipCount": 1 },
  { "department": "HR", "totalNetSalary": 47249.25625, "payslipCount": 1 },
  { "department": "Finance", "totalNetSalary": 119271.5125, "payslipCount": 1 }
]
```
Employees with no `department` set group under `"Unassigned"`.

---

### `POST /api/dashboard/salary-trend` — realized payroll spend, by month
Filters on `Payrun.periodStart`. Buckets by the Payrun's `periodStart` month (`"YYYY-MM"`), sorted ascending.

**Response `200`:**
```json
[
  { "month": "2026-08", "totalNetSalary": 220419.4125, "payslipCount": 3 }
]
```

---

### `POST /api/dashboard/attendance-overview`
Filters on `Attendance.checkIn`.

**Response `200`:**
```json
{
  "byStatus": [
    { "status": "Present", "count": 254, "overtimeHours": 434.5833333333337 }
  ],
  "missingCheckouts": 0
}
```
`missingCheckouts` = count of Attendance rows in scope with `checkOut: null` — the mockup's "data-quality gaps" bullet.

---

### `POST /api/dashboard/timeoff-overview`
`requestsByStatus` filters on `TimeOffRequest.startDate`; `remainingByType` (Allocations) is **not** date-filtered — a balance is a current-state number, not something that happened "during" a period.

**Response `200`:**
```json
{
  "requestsByStatus": [
    { "status": "Refused", "count": 1, "days": 1 },
    { "status": "Pending", "count": 2, "days": 6 },
    { "status": "Approved", "count": 6, "days": 11 }
  ],
  "remainingByType": [
    { "type": "Paid Time Off", "allocated": 200, "taken": 11, "remaining": 189 },
    { "type": "Comp Off", "allocated": 16, "taken": 0, "remaining": 16 }
  ]
}
```

---

### `POST /api/dashboard/department-overview` — current org structure, grouped
Not date-filtered (`periodStart`/`periodEnd` are accepted but have no effect here — headcount/current-wage isn't a "during a period" fact). Aggregates **current state**: headcount and each employee's current Running contract's wage — deliberately distinct from `salary-by-department`'s realized-payslip totals.

**Response `200`:**
```json
[
  { "department": "Unassigned", "headcount": 4, "avgWage": 0 },
  { "department": "Finance", "headcount": 5, "avgWage": 90594.2 },
  { "department": "Administration", "headcount": 1, "avgWage": 0 }
]
```
`avgWage: 0` for a department where nobody currently has a Running contract (e.g. the `System Admin` employee, who has no Contract at all — Admin is a login/access account first, not a payroll subject).

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Payroll Dashboard** (KPI cards + charts, per the mockup's own content bar) | All 6 endpoints above, called with the same filter state (Period/Department/Employee Type/Company selectors at the top of the page) |
| Salary KPI cards | `POST /api/dashboard/kpis` |
| Salary-by-department chart (bar) | `POST /api/dashboard/salary-by-department` |
| Salary trend chart (line) | `POST /api/dashboard/salary-trend` |
| Attendance overview card/chart | `POST /api/dashboard/attendance-overview` |
| Time Off overview card/chart | `POST /api/dashboard/timeoff-overview` |
| Department headcount chart/table | `POST /api/dashboard/department-overview` |

No hook name was listed for this module in `Docs/hr-payroll-backend.md`'s hook list (it has no AG Grid list — every endpoint here returns a small aggregated array/object, not a paginated grid) — a plain `useDashboard.js` hook that calls all 6 endpoints with shared filter state is the natural shape, not the `useXGrid.js` `IDatasource` pattern every other module uses.

---

## Where to call which API — trigger-by-trigger

| Trigger | Call | When | Then |
|---|---|---|---|
| Dashboard page mounts | All 6 endpoints, in parallel (`Promise.all`), with the default filter state (usually: no filters, or "this month") | on mount | populate every KPI card/chart independently — one endpoint failing (e.g. a transient error) shouldn't block the others from rendering, so fetch them independently rather than as one combined call |
| User changes **Period** / **Department** / **Employee Type** / **Company** filter | All 6 endpoints again, with the updated filter body | on each filter change (debounce if these are free-text; fire immediately for dropdowns/date pickers) | re-render every card/chart from the fresh response — every number on the page should visibly change together, since they all read the same filter state |
| User clicks into a chart segment (e.g. a department's bar) | none required, but a reasonable drill-down is setting `department` to that segment's value and re-firing all 6 calls | on click, optional UX enhancement | narrows every card to that one department — this is just the existing filter-change flow triggered by a click instead of a form control |
| `employeeType` filter dropdown mounts | `GET /api/salary-structures/options` | once on mount, cache for the session | populate the dropdown — **note this is a role-gated endpoint** (`HR Payroll User/Manager/Admin` per Phase 5 — HR Manager gets `403` here per that phase's own matrix), so on a dashboard page HR Manager can otherwise fully view, the Employee Type filter control itself may need to be hidden or disabled for HR Manager specifically, since they can view the dashboard but can't load this particular dropdown's options |

### General rule
Every dashboard call needs the session cookie, same as every other module (`credentials: 'include'`/`withCredentials: true`). A `403` here specifically means EMPLOYEE role reached this page — since nothing in the sidebar should route them here at all (per the permission matrix, Employee gets no dashboard access), treat it as a UI/nav-guard bug if it ever happens, not a normal error state to design a message around.
