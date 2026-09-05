# Phase 3 API Contract — Attendance

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 3.

All endpoints require a valid session (`withAuth()`) → `401` if missing/inactive. Role-gated endpoints return `403` for disallowed roles.

---

### `POST /api/attendance/check-in`
**Role:** any authenticated role with an employee link. EMPLOYEE always acts on their own record.

**Request body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `employeeId` | string | optional | **only honored for non-EMPLOYEE roles** (HR staff checking in on behalf of someone) — EMPLOYEE role's own `employeeId` is always used instead, regardless of what's sent |

**Response `201`:** the new open Attendance record (`checkOut`, `workedHours`, `overtime` all `null`).
**Errors:** **`409`** "Already checked in — check out first" if an open session already exists for that employee.

---

### `POST /api/attendance/check-out`
Same auth/role shape as check-in.

**Response `200`:** the now-closed record with **server-computed** `workedHours` and `overtime`.
**Errors:** **`409`** "No active check-in session found" if there's nothing open to close.

**How `overtime` is computed:** `workedHours` = `checkOut − checkIn` in hours. The employee's assigned `WorkingSchedule` is looked up, and the day-of-week of `checkIn` is matched against that schedule's day entries (from Phase 2) to get the day's expected hours. `overtime = max(0, workedHours − expectedHours)`. If the employee has no assigned schedule, or no entry for that weekday, `expectedHours` falls back to `workedHours` itself — i.e. `overtime: 0` (not "all hours are overtime").

---

### `POST /api/attendance/list` — AG Grid datasource
**Role:** any authenticated role. **EMPLOYEE is forced to their own `employeeId` only.** Filterable columns: `employeeId`, `status` (both equals).

---

### `GET /api/attendance/[id]`
**Role:** any authenticated role, but **EMPLOYEE gets `403` unless the record is their own.**

---

### `PATCH /api/attendance/[id]` — manual correction
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin only (not Employee).

**Request body** (all optional, partial update):
| Field | Type | Notes |
|---|---|---|
| `checkIn` | ISO datetime string | |
| `checkOut` | ISO datetime string, or `null` | `null` re-opens the session (clears workedHours/overtime is NOT automatic — send a new checkOut later to recompute) |
| `status` | `"Present" \| "Absent"` | |
| `notes` | string | |

If either `checkIn` or `checkOut` changes and the record has both set, **`workedHours`/`overtime` are recomputed automatically** — a correction never leaves stale derived numbers. `correctedBy` is always set to the acting Admin/HR user's own `employeeId` (Employee is the login account — there's no separate `userId`; see Phase 1).

### `DELETE /api/attendance/[id]`
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin only.

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Attendance quick-action widget** (top-nav icon → popup) | `GET /api/attendance/current` to decide whether to render Check In or Check Out; `POST /api/attendance/check-in` / `POST /api/attendance/check-out` on click. (`/current` shipped in Phase 4 — see that doc — closing the gap flagged here originally.) |
| **Attendance — List view** (global, or scoped from an Employee) | `POST /api/attendance/list`; when opened from an Employee Form, force `filterModel.employeeId` client-side (server also double-enforces for EMPLOYEE role) |
| **Attendance Form** (detail + manual correction) | `GET /api/attendance/[id]` to load, `PATCH /api/attendance/[id]` to correct — only render the correction controls for HR Manager+ roles, matching the API's own restriction |
| **Employee Form → "Attendance N" smart button** | Not wired yet (same deferral as Phase 1's smart-button counts) — will reuse `POST /api/attendance/list` with a forced `employeeId`, same pattern as Phase 2's `/api/employees/[id]/contracts` |

`hooks/useAttendanceGrid.js` wraps `POST /api/attendance/list` as an AG Grid `IDatasource`.

---

## Where to call which API — trigger-by-trigger

| Trigger | Call | When | Then |
|---|---|---|---|
| Quick-action widget mounts (top-nav icon) | `GET /api/attendance/current` (added in Phase 4 — see that doc) | on mount, and re-poll on an interval if you want the elapsed-time display to stay live | `isOpen: true` → render "Check Out" + elapsed time from `attendance.checkIn`; `isOpen: false` → render "Check In" |
| User clicks **Check In** | `POST /api/attendance/check-in` | on click | `201` → flip widget to "Check Out" state, store the new record's `checkIn` for the elapsed-time display. **`409`** ("Already checked in") should be rare if the widget's own state is correct — treat it as a signal to re-fetch `/current` rather than just showing the raw error |
| User clicks **Check Out** | `POST /api/attendance/check-out` | on click | `200` → flip widget to "Check In" state; the response's `workedHours`/`overtime` can flash a brief "Worked 8.2h today" toast. **`409`** ("No active check-in session") → same treatment as above, re-sync from `/current` |
| Attendance List page mounts / grid interaction (global) | `POST /api/attendance/list` | via `useAttendanceGrid.js` `IDatasource` | render rows |
| Attendance List opened from an Employee Form (not yet a dedicated scoped route) | `POST /api/attendance/list` with `filterModel.employeeId` forced client-side | on navigation in | server-side EMPLOYEE-role scoping double-enforces this anyway, but non-Employee viewers need the client to set the filter explicitly since nothing forces it for them |
| User clicks a row to open the detail Form | `GET /api/attendance/[id]` | on navigation in | populate check-in/out, worked hours, overtime, status, notes |
| HR Manager+ clicks **Save** on a manual correction | `PATCH /api/attendance/[id]` | on submit, only the changed fields — only render this control at all for HR Manager/Payroll/Admin roles | `200` with recomputed `workedHours`/`overtime` if both check-in and check-out end up set — refresh the displayed values from the response, don't keep whatever the form had typed |
| User clicks **Delete** | `DELETE /api/attendance/[id]` | after confirm, HR Manager+ only | `204` → remove from list |
| Employee Form → **"Attendance N"** smart button | `POST /api/attendance/list` with `employeeId` forced (same pattern as Phase 2's Contracts smart button, no dedicated scoped route yet) | on click | opens Attendance list pre-filtered to that employee |
