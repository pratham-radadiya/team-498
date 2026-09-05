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

If either `checkIn` or `checkOut` changes and the record has both set, **`workedHours`/`overtime` are recomputed automatically** — a correction never leaves stale derived numbers. `correctedBy` is always set to the acting Admin/HR user's own `userId`.

### `DELETE /api/attendance/[id]`
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin only.

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Attendance quick-action widget** (top-nav icon → popup) | `POST /api/attendance/check-in` when no open session, `POST /api/attendance/check-out` when one exists. The mockup's "auto-detect open session, show elapsed time" behavior needs a way to know if a session is currently open — **not yet exposed as its own endpoint**; the frontend can infer it from the most recent row in `POST /api/attendance/list` filtered to the current user, or this can get a dedicated `GET /api/attendance/current` endpoint if that proves awkward (flagging as a possible small addition, not built yet since it wasn't in Phase 3's route list) |
| **Attendance — List view** (global, or scoped from an Employee) | `POST /api/attendance/list`; when opened from an Employee Form, force `filterModel.employeeId` client-side (server also double-enforces for EMPLOYEE role) |
| **Attendance Form** (detail + manual correction) | `GET /api/attendance/[id]` to load, `PATCH /api/attendance/[id]` to correct — only render the correction controls for HR Manager+ roles, matching the API's own restriction |
| **Employee Form → "Attendance N" smart button** | Not wired yet (same deferral as Phase 1's smart-button counts) — will reuse `POST /api/attendance/list` with a forced `employeeId`, same pattern as Phase 2's `/api/employees/[id]/contracts` |

`hooks/useAttendanceGrid.js` wraps `POST /api/attendance/list` as an AG Grid `IDatasource`.
