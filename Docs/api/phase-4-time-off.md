# Phase 4 API Contract — Time Off (Types, Allocations, Requests)

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 4.

Also documented here: two items deferred from earlier phases, completed alongside Phase 4 (`GET /api/employees/[id]`'s new `smartButtonCounts`, and the new `GET /api/attendance/current`).

All endpoints require a valid session (`withAuth()`) → `401` if missing/inactive. Role-gated endpoints return `403` for disallowed roles.

---

## Time Off Type endpoints

### `POST /api/timeoff/types` — create
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee)

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ required | |
| `unit` | `"Days" \| "Hours"` | optional | defaults `"Days"` |
| `requiresAllocation` | boolean | optional | defaults `true` |
| `approvalRole` | `"Manager" \| "Officer"` | optional | defaults `"Manager"` |
| `payrollWorkEntry` | string | optional | free-text payroll-integration hook, e.g. `"Leave Work Entry"` — not wired to real payroll logic until Phase 6 needs it |
| `color` | string | optional | |
| `status` | `"Active" \| "Inactive"` | optional | defaults `"Active"` |

**Response `201`:** the full type record.

### `POST /api/timeoff/types/list` — AG Grid datasource
**Role:** any authenticated role (Employee is read-only, not scope-restricted — everyone sees all types, since Types are policy, not personal data). Filterable: `name` (contains), `status` (equals).

### `GET /api/timeoff/types/options` — dropdown source
**Role:** any authenticated role. `[{id, label}]`, Active types only.

### `GET /api/timeoff/types/[id]` — any role. `PATCH`/`DELETE /api/timeoff/types/[id]` — non-Employee roles only.

---

## Allocation endpoints

### `POST /api/timeoff/allocations` — create
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee — allocations are HR-granted, never self-service)

| Field | Type | Required | Notes |
|---|---|---|---|
| `employeeId` | string | ✅ required | |
| `typeId` | string | ✅ required | |
| `allocated` | number > 0 | ✅ required | |
| `description` | string | optional | e.g. `"2026 Annual Balance"` |
| `validFrom` / `validTo` | `"YYYY-MM-DD"` | optional | |
| `status` | `"Pending" \| "Approved" \| "Refused"` | optional | defaults `"Pending"` — **must be explicitly set to `"Approved"` via a follow-up `PATCH` before it contributes to any balance** |

**Response `201`:** the record plus a computed `remaining` field (`allocated - taken`, never persisted).

### `POST /api/timeoff/allocations/list` — AG Grid. **EMPLOYEE forced to their own `employeeId`.** Filterable: `employeeId`, `typeId`, `status` (all equals).

### `GET /api/timeoff/allocations/[id]` — any role, but EMPLOYEE gets `403` unless it's their own.
### `PATCH /api/timeoff/allocations/[id]` — non-Employee roles. This is how an allocation gets approved: `{"status": "Approved"}`.
### `DELETE /api/timeoff/allocations/[id]` — non-Employee roles.

---

## Time Off Request endpoints

### `POST /api/timeoff/requests` — create
**Role:** any authenticated role. EMPLOYEE always creates for themselves; other roles may specify `employeeId` to create on someone's behalf.

| Field | Type | Required | Notes |
|---|---|---|---|
| `employeeId` | string | optional | ignored for EMPLOYEE role (always their own) |
| `typeId` | string | ✅ required | |
| `startDate` / `endDate` | `"YYYY-MM-DD"` | ✅ required | `endDate` must be ≥ `startDate` |
| `reason` | string | optional | |
| `duration` | — | **never accepted** | server-computed: inclusive day count between `startDate` and `endDate` |

**Response `201`:** the request, `status: "Pending"`, `allocationId` set if the type required one.

**Errors:**
- `400` — validation, or `endDate` before `startDate`
- **`409`** — if the type `requiresAllocation` and no single Approved allocation for that employee+type has enough remaining balance to cover the computed `duration`. The error message states the type name and the duration needed.

### `POST /api/timeoff/requests/list` — AG Grid. **EMPLOYEE forced to own `employeeId`.** Filterable: `employeeId`, `typeId`, `status`.

### `GET /api/timeoff/requests/[id]` — any role, EMPLOYEE restricted to own.
### `DELETE /api/timeoff/requests/[id]` — non-Employee roles.

### `POST /api/timeoff/requests/[id]/approve`
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin.
Only valid on a `Pending` request (**`409`** otherwise). Re-checks the matched allocation's remaining balance one more time before committing (**`409`** if it's no longer sufficient — e.g. consumed by a different request approved first). On success: request → `Approved`, `approverId` set to the caller, and the allocation's `taken` is incremented **atomically in the same transaction**.

### `POST /api/timeoff/requests/[id]/refuse`
**Role:** same as approve. Only valid on `Pending` (**`409`** otherwise). No balance change — refused requests never touch an allocation.

---

## Completed pending items

### `GET /api/employees/[id]` — now includes `smartButtonCounts`
Response gains one new field, computed via a single Prisma `_count` query — no separate request needed:
```json
{ "smartButtonCounts": { "contracts": 2, "attendance": 121, "timeOff": 0, "allocations": 0 } }
```

### `GET /api/attendance/current` — new
**Role:** any authenticated role with an employee link. Same `employeeId` query-param override rules as check-in/check-out (non-Employee roles may pass `?employeeId=...` to check on someone else's behalf).

**Response `200`:** `{ "isOpen": boolean, "attendance": Attendance | null }` — this is what the quick check-in/check-out widget polls to decide whether to show "Check In" or "Check Out" + elapsed time.

---

## Frontend pages this phase's APIs back

Per the mockup: everything below lives under one **`Time Off ▼`** nav dropdown — do not scatter these as separate top-level pages.

| Page / Screen | Uses |
|---|---|
| **Time Off → Time Off Types** (List + Form) | `POST /api/timeoff/types/list`, `POST /api/timeoff/types`, `PATCH /api/timeoff/types/[id]` |
| **Time Off → Allocations** (List, shows Allocated/Taken/Remaining at a glance) | `POST /api/timeoff/allocations/list` — the grid's `remaining` column comes straight from the API response, never computed client-side |
| **Allocation Form** | `POST /api/timeoff/allocations` (create), `PATCH /api/timeoff/allocations/[id]` (approve/edit); Employee field → `GET /api/employees/options`, Type field → `GET /api/timeoff/types/options` |
| **Time Off → Requests** (List, inline Approve/Refuse) | `POST /api/timeoff/requests/list`; row actions call `POST /api/timeoff/requests/[id]/approve` or `/refuse` |
| **Request Form** | `POST /api/timeoff/requests` (create); shows `allocationId` as "Allocation Used" once the API returns it — the frontend never picks the allocation itself, the server does |
| **Employee Form → "Time Off N" / "Allocations N" smart buttons** | Counts come free from `GET /api/employees/[id]`'s `smartButtonCounts`; clicking through still opens `POST /api/timeoff/requests/list` / `POST /api/timeoff/allocations/list` filtered to that employee (same forced-filter pattern as Phase 2's `/api/employees/[id]/contracts` — not yet built as a dedicated scoped route, the frontend can pass `filterModel.employeeId` and the server-side EMPLOYEE-role scoping already double-enforces it) |
| **Attendance quick-action widget** | `GET /api/attendance/current` on load/poll to decide Check In vs Check Out button state |

`hooks/useTimeOffTypesGrid.js`, `useAllocationsGrid.js`, `useTimeOffRequestsGrid.js` wrap their `/list` endpoints as AG Grid `IDatasource`s.

---

## Where to call which API — trigger-by-trigger

### Time Off Types (policy config — HR/Admin manage, everyone reads)
| Trigger | Call | When | Then |
|---|---|---|---|
| Time Off Types List mounts / grid interaction | `POST /api/timeoff/types/list` | via `useTimeOffTypesGrid.js` | all roles see this, including Employee (read-only) |
| Any Allocation/Request form's Type dropdown mounts | `GET /api/timeoff/types/options` | once on mount, cache for the session | populate dropdown — Active only |
| HR/Admin clicks a Type row | `GET /api/timeoff/types/[id]` | on navigation in | populate the form |
| HR/Admin clicks **Save** (new or edit) | `POST /api/timeoff/types` / `PATCH /api/timeoff/types/[id]` | on submit — hide/disable this whole form for Employee role, since the API 403s anyway | `201`/`200` → back to list |
| HR/Admin clicks **Delete** | `DELETE /api/timeoff/types/[id]` | after confirm | `204` → remove from list |

### Allocations (HR-granted balances)
| Trigger | Call | When | Then |
|---|---|---|---|
| Allocations List mounts / grid interaction | `POST /api/timeoff/allocations/list` | via `useAllocationsGrid.js` — EMPLOYEE role is forced to their own rows automatically | render the Allocated/Taken/Remaining columns straight from the response, `remaining` is never computed client-side |
| Allocation Form mounts | `GET /api/employees/options` + `GET /api/timeoff/types/options` | on mount, for the two pickers | populate dropdowns |
| HR/Admin clicks **Save** (new allocation) | `POST /api/timeoff/allocations` | on submit — status defaults to `Pending` | `201` → the allocation does **not** count toward balance yet; the UI should make clear a separate Approve step is needed |
| HR/Admin clicks **Approve** on a Pending allocation | `PATCH /api/timeoff/allocations/[id]` with `{"status": "Approved"}` | on click, from either the list row action or the Form | `200` → now counts toward balance for Request creation |
| HR/Admin clicks **Delete** | `DELETE /api/timeoff/allocations/[id]` | after confirm | `204` → remove from list |
| Employee views their own allocations (read-only) | `POST /api/timeoff/allocations/list` | same call as above — no separate "my allocations" endpoint, the server scopes it automatically for EMPLOYEE role | render read-only, no edit/delete controls for this role |

### Time Off Requests
| Trigger | Call | When | Then |
|---|---|---|---|
| Requests List mounts / grid interaction | `POST /api/timeoff/requests/list` | via `useTimeOffRequestsGrid.js` — EMPLOYEE forced to own rows | inline **Approve**/**Refuse** row actions only render for HR Manager+ roles |
| Request Form mounts (Employee creating their own) | `GET /api/timeoff/types/options` | on mount | no Employee picker needed — EMPLOYEE role's own `employeeId` is always used, hide that field entirely for this role |
| Request Form mounts (HR/Admin creating on someone's behalf) | `GET /api/employees/options` + `GET /api/timeoff/types/options` | on mount | show the Employee picker for these roles only |
| User clicks **Submit Request** | `POST /api/timeoff/requests` | on submit | `201` → show "Allocation Used" from the response's `allocationId`, never picked client-side. **`409`** (insufficient balance) → surface the server's message directly (it already names the type and duration needed) as a form-level error |
| HR Manager+ clicks **Approve** (row action or detail view) | `POST /api/timeoff/requests/[id]/approve` | on click | `200` → row flips to Approved. **`409`** can mean either "not Pending anymore" (someone else already acted) or "balance no longer sufficient" (a race with another request) — re-fetch the row/list on `409` rather than assuming which one happened |
| HR Manager+ clicks **Refuse** | `POST /api/timeoff/requests/[id]/refuse` | on click | `200` → row flips to Refused, no balance change |
| HR Manager+ clicks **Delete** | `DELETE /api/timeoff/requests/[id]` | after confirm | `204` → remove from list |

### Employee Form smart buttons + Attendance widget (this phase's completed pending items)
| Trigger | Call | When | Then |
|---|---|---|---|
| Employee Form loads | `GET /api/employees/[id]` | on navigation in (same call as Phase 1 — no new request needed) | `smartButtonCounts.timeOff` / `.allocations` now populate those two buttons' badges for free |
| User clicks **"Time Off N"** / **"Allocations N"** smart button | `POST /api/timeoff/requests/list` / `POST /api/timeoff/allocations/list` with `filterModel.employeeId` forced client-side | on click | not a dedicated scoped route yet (same pattern as Phase 2/3's smart buttons) — server-side EMPLOYEE scoping double-enforces regardless |
| Attendance quick-action widget mounts, or on a polling interval | `GET /api/attendance/current` | on mount / interval | this is the endpoint Phase 3's widget was waiting on — use it instead of inferring "is a session open" from `POST /api/attendance/list` |
