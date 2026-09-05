# Phase 2 API Contract — Working Schedule + Contract

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 2.

All endpoints require a valid session (`withAuth()`) → `401` if missing/inactive. Role-gated endpoints return `403` for disallowed roles.

---

## Working Schedule endpoints

### `POST /api/working-schedules` — create
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee)

**Request body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ required | |
| `calendarType` | string | optional | free-text label, e.g. "Standard", "Night Shift" |
| `company` | string | optional | |
| `status` | `"Active" \| "Inactive"` | optional | defaults `"Active"` |
| `days` | array, ≥1 entry | ✅ required | see below |
| `totalWeeklyHours` | — | **never accepted** | always server-computed from `days` |

Each `days[]` entry:
| Field | Type | Required | Notes |
|---|---|---|---|
| `day` | `"MON"\|"TUE"\|"WED"\|"THU"\|"FRI"\|"SAT"\|"SUN"` | ✅ required | |
| `startTime` | string `"HH:mm"` | ✅ required | 24h format |
| `endTime` | string `"HH:mm"` | ✅ required | must be after `startTime` + `breakMinutes`, same day (no overnight shifts) |
| `breakMinutes` | integer ≥ 0 | optional | defaults `0` |

**Response `201`:** the schedule with **server-computed** `days[].hours` and `totalWeeklyHours`.
**Errors:** `400` — either Zod validation, or a day where `endTime` isn't after `startTime + break`.

---

### `POST /api/working-schedules/list` — AG Grid datasource
**Role:** any authenticated role. **EMPLOYEE is forced to their own assigned schedule only** (resolved via their Employee record's `workingScheduleId` — not a client-supplied filter).

**Request/response:** same grid contract as Phase 1 (`startRow`/`endRow`/`sortModel`/`filterModel` → `{rows, rowCount}`). Filterable columns: `name` (contains), `status` (equals).

---

### `GET /api/working-schedules/options` — dropdown source
**Role:** any authenticated role.

**Response `200`:** `[{ "id": "string", "label": "string" }]` — **Active schedules only**, sorted by name. Used anywhere a form needs to pick a schedule (Employee Form, Contract Form).

---

### `GET /api/working-schedules/[id]` — fetch one
**Role:** any authenticated role, but **EMPLOYEE gets `403` unless `id` is their own assigned schedule.**
**Response `200`:** schedule + its `days[]`. `404` if not found.

### `PATCH /api/working-schedules/[id]` — update
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin. Body: any subset of the create fields (partial update). Sending `days` **replaces the entire day set** (deletes old rows, inserts new ones) and recomputes hours/total.

### `DELETE /api/working-schedules/[id]`
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin. `204` on success, `404` if missing.

---

## Contract endpoints

### `POST /api/contracts` — create
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee)

**Request body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `employeeId` | string | ✅ required | |
| `department` | string | optional | |
| `jobPosition` | string | optional | |
| `startDate` | string `"YYYY-MM-DD"` | ✅ required | |
| `endDate` | string `"YYYY-MM-DD"` | optional | omit/null = still ongoing |
| `wage` | number > 0 | ✅ required | |
| `workingScheduleId` | string | optional | id from `/api/working-schedules/options` |
| `salaryStructureId` | string | optional | placeholder until Phase 5 — not validated against a real table yet |
| `status` | `"Running" \| "Expired"` | optional | defaults `"Running"` |
| `notes` | string | optional | |

**Response `201`:** full Contract record (dates come back as full ISO datetimes, e.g. `"2026-01-01T00:00:00.000Z"`).

**Errors:**
- `400` validation
- **`409`** — "This employee already has a Running contract that overlaps this period" — only thrown when the new/updated contract's `status` is (or becomes) `"Running"`; setting `status: "Expired"` never triggers this check

---

### `POST /api/contracts/list` — AG Grid datasource
**Role:** any authenticated role. **EMPLOYEE is forced to their own `employeeId` only.** Filterable columns: `status`, `employeeId` (both equals).

### `GET /api/contracts/[id]` — fetch one
**Role:** any authenticated role, but **EMPLOYEE gets `403` unless the contract belongs to them.**

### `PATCH /api/contracts/[id]` — update
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin. Same overlap check re-runs on update (excluding the contract being edited) — e.g. flipping an old contract to `"Expired"` and setting its `endDate` is the standard way to make room for a new Running contract.

### `DELETE /api/contracts/[id]`
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin.

---

### `POST /api/employees/[id]/contracts` — one employee's contracts (scoped)
**Role:** any authenticated role. Same grid contract as `/api/contracts/list`, but **`employeeId` is always forced to this route's `[id]`**, overriding any `filterModel`. **EMPLOYEE role additionally gets `403` if `[id]` isn't their own** (checked before the query runs, not just filtered after).

This is what the Employee Form's **Contracts** smart button hits.

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Working Schedule — List view** | `POST /api/working-schedules/list` |
| **Working Schedule — Form** (weekly pattern table + "Add Day" + computed Total Weekly Hours footer) | `POST /api/working-schedules` (create) / `PATCH /api/working-schedules/[id]` (edit) — the footer total is whatever the API echoes back, never computed client-side |
| **Employee Form → Working Schedule field** (dropdown) | `GET /api/working-schedules/options` |
| **Contract Form → Working Schedule field** (dropdown) | `GET /api/working-schedules/options` |
| **Employee Form → Manager field** (dropdown, from Phase 1) | `GET /api/employees/options` |
| **Contracts — List view**, highlighting the active Running contract | `POST /api/contracts/list`, filter `status = Running` |
| **Contract Form** | `POST /api/contracts` (create) / `PATCH /api/contracts/[id]` (edit); Employee field uses `GET /api/employees/options`, Working Schedule field uses `GET /api/working-schedules/options` |
| **Employee Form → "Contracts N" smart button** | `POST /api/employees/[id]/contracts` (scoped grid) |

`hooks/useWorkingSchedulesGrid.js` and `hooks/useContractsGrid.js` wrap their respective `/list` endpoints as AG Grid `IDatasource`s, per the grid contract in `Docs/hr-payroll-backend.md`. Any dropdown/picker component (Manager, Working Schedule) should be a small shared component that takes an `optionsUrl` prop and calls it once on mount — the same component serves the Employee Form's Manager field and the Contract Form's Working Schedule field.

---

## Where to call which API — trigger-by-trigger

### Working Schedules
| Trigger | Call | When | Then |
|---|---|---|---|
| Working Schedule List page mounts, or grid sort/filter/scroll fires | `POST /api/working-schedules/list` | via AG Grid's `IDatasource` (`useWorkingSchedulesGrid.js`) — never call manually | render rows |
| Any form with a Working Schedule dropdown mounts (Employee Form, Contract Form) | `GET /api/working-schedules/options` | once on mount, cache for the session (schedules rarely change) | populate dropdown — Active only |
| User clicks a schedule row | `GET /api/working-schedules/[id]` | on navigation into the Form | populate name/calendarType/company/status + the `days[]` table |
| User clicks **Add Day** / edits a day row, then **Save** | `POST /api/working-schedules` (new) or `PATCH /api/working-schedules/[id]` (edit) | on submit, with the full `days[]` array — sending `days` **replaces the whole set**, so always submit the complete table, not just the changed row | `hours` per day and `totalWeeklyHours` come back server-computed — overwrite whatever the form displayed locally, never trust a client-side calculation for the footer total |
| User clicks **Delete** on a schedule | `DELETE /api/working-schedules/[id]` | after confirm | `204` → remove from list. Note: this has no built-in guard against deleting a schedule still assigned to Employees/Contracts — confirm dialog copy should warn about that until/unless the backend adds a check |

### Contracts
| Trigger | Call | When | Then |
|---|---|---|---|
| Contracts List page mounts / grid interaction | `POST /api/contracts/list` | via `useContractsGrid.js` `IDatasource` | render rows; a "Running" status badge/highlight is a pure client-side render of the `status` field, no extra call |
| Contract Form mounts (new or edit) | `GET /api/contracts/[id]` (edit only) | on navigation in | populate fields. Employee field uses `GET /api/employees/options`, Working Schedule field uses `GET /api/working-schedules/options` — both already cached if the page loaded them earlier |
| User clicks **Save** (new contract) | `POST /api/contracts` | on submit | `201` → navigate to the new record. **`409`** ("already has a Running contract that overlaps this period") → surface as a form-level error, not a field error — the fix is usually to expire the old contract first, not to change this form's own inputs |
| User clicks **Save** (edit) | `PATCH /api/contracts/[id]` | on submit | same `409` handling as above applies again, since the overlap check re-runs (excluding this contract itself) |
| User clicks **Delete** | `DELETE /api/contracts/[id]` | after confirm | `204` → remove from list |
| User opens an Employee Form and clicks the **"Contracts N"** smart button | `POST /api/employees/[id]/contracts` | on click | opens a Contracts list scoped to that employee — `employeeId` is forced server-side, so don't also try to set `filterModel.employeeId` client-side (harmless if you do, but redundant) |
