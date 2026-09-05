# Phase 1 API Contract — Employee Master + User Management

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 1.

All endpoints below require a valid NextAuth session (`withAuth()`); a request with no/invalid/inactive-user session returns `401 { "error": "..." }` before touching any data. Role-gated endpoints additionally return `403 { "error": "..." }` for disallowed roles.

---

## Auth endpoints (built into NextAuth's catch-all route — not custom code)

These come for free from `NextAuth(authOptions)` in `app/api/auth/[...nextauth]/route.js`; nothing under `server/` implements them.

### `GET /api/auth/csrf` — get a CSRF token
Required as a form field on the two POSTs below.

### `POST /api/auth/callback/credentials` — log in
Body (`application/x-www-form-urlencoded`): `csrfToken`, `email`, `password`, `json=true`. Sets the `next-auth.session-token` cookie on success.

### `POST /api/auth/signout` — log out
Body: `csrfToken`, `json=true`. **Verified:** clears the session cookie (`Set-Cookie: next-auth.session-token=; Max-Age=0`); a session check immediately after returns `{}`.

### `GET /api/auth/session` — read the current session
Returns `{}` if not logged in, or `{ "user": { userId, email, role, employeeId }, "expires" }` if logged in.

---

## Employee endpoints

### `POST /api/employees` — create an employee
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee)

**Request body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ required | min length 1 |
| `email` | string | ✅ required | must be a valid email, unique |
| `department` | string | optional | |
| `jobPosition` | string | optional | |
| `workLocation` | string | optional | |
| `company` | string | optional | |
| `workingScheduleId` | string | optional | placeholder id until Phase 2's `WorkingSchedule` model exists; not yet validated against a real table |
| `managerId` | string | optional | id of another Employee |
| `status` | `"Active" \| "Inactive"` | optional | defaults to `"Active"` |

**Response `201`:** full Employee record —
```json
{
  "id": "string", "name": "string", "email": "string", "status": "Active|Inactive",
  "department": "string|null", "jobPosition": "string|null", "workLocation": "string|null",
  "company": "string|null", "workingScheduleId": "string|null", "managerId": "string|null",
  "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
}
```
**Errors:** `400` validation (missing `name`/`email` or invalid email), `403` wrong role.

---

### `POST /api/employees/list` — AG Grid datasource (paginated/sorted/filtered list)
**Role:** any authenticated role. **EMPLOYEE role is silently forced to their own record only**, regardless of what filters are sent.

**Request body** (AG Grid Infinite Row Model contract):
| Field | Type | Required |
|---|---|---|
| `startRow` | integer ≥ 0 | ✅ required |
| `endRow` | integer ≥ 0 | ✅ required |
| `sortModel` | `[{ colId: string, sort: "asc"\|"desc" }]` | optional, default `[]` |
| `filterModel` | `{ [column]: { filterType, type, filter } }` | optional, default `{}`. Supported filterable columns today: `name` (contains), `department` (equals), `status` (equals) |

**Response `200`:**
```json
{ "rows": [ /* Employee[] */ ], "rowCount": 0 }
```

---

### `GET /api/employees/options` — lightweight list for dropdown/FK pickers
**Role:** any authenticated role.

**Response `200`:** `[{ "id": "string", "label": "string" }]` (label = employee name), sorted by name.

---

### `GET /api/employees/[id]` — fetch one employee
**Role:** any authenticated role, but **EMPLOYEE role gets `403` unless `id` equals their own `employeeId`.**

**Response `200`:** same shape as create's response. **`404`** if not found.

---

### `PATCH /api/employees/[id]` — update an employee
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee).

**Request body:** any subset of the create-body fields above (all optional — partial update). **Errors:** `404` if the employee doesn't exist.

---

### `DELETE /api/employees/[id]` — delete an employee
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee).

**Response:** `204` no body. **Errors:** `404` if not found.

---

## User endpoints (Admin-only — User Management)

### `POST /api/users` — create a user account
**Role:** Admin only.

**Request body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | ✅ required | valid email |
| `password` | string | ✅ required | min length 8 — hashed with bcrypt before storage, never stored/returned plain |
| `role` | `"EMPLOYEE" \| "HR_MANAGER" \| "HR_PAYROLL_USER" \| "HR_PAYROLL_MANAGER" \| "ADMIN"` | ✅ required | |
| `employeeId` | string | ✅ required | must reference an existing Employee that doesn't already have a user account |
| `status` | `"Active" \| "Inactive"` | optional | defaults to `"Active"` |

**Response `201`:**
```json
{ "id": "string", "email": "string", "role": "ROLE", "status": "Active|Inactive", "employeeId": "string" }
```
(`passwordHash` is never included in any response.)

**Errors:** `400` validation, `404` "Linked employee not found", **`409`** "This employee already has a user account".

---

### `GET /api/users` — list all users
**Role:** Admin only.

**Response `200`:** `[{ id, email, role, status, employeeId, createdAt }]` (no `passwordHash`).

---

### `GET /api/users/[id]` — fetch one user
**Role:** Admin only. **`404`** if not found.

---

### `PATCH /api/users/[id]` — update a user's role/status
**Role:** Admin only.

**Request body:** (both optional, partial update)
| Field | Type | Notes |
|---|---|---|
| `status` | `"Active" \| "Inactive"` | deactivating here is what makes `withAuth()`'s per-request DB re-check reject that user's *next* request immediately |
| `role` | one of the 5 roles | **blocked with `403` "You cannot change your own role" if the caller's own userId matches the target `id`** — true regardless of which role value is sent, even a no-op value |

**Response `200`:** same shape as create's response.

---

## Frontend pages this phase's APIs back

Per the Excalidraw mockup's screen flow (`project-overview.md` §4):

| Page / Screen | Uses |
|---|---|
| **Employees — Kanban view** (default) | `POST /api/employees/list` (small page size, grouped client-side by department) |
| **Employees — List view** (sort/filter/bulk scanning) | `POST /api/employees/list` (AG Grid, full pagination/sort/filter) |
| **Employee Form** | `GET /api/employees/[id]` to load; `PATCH /api/employees/[id]` to save; `POST /api/employees` for a new record. Manager picker uses `GET /api/employees/options` |
| **Employee Form → smart buttons** (Contracts/Attendance/Time Off counts) | **not wired yet** — deferred until Phases 2–4 add those models |
| **Login screen** | `POST /api/auth/callback/credentials` (NextAuth) |
| **Admin → User Management (list + Create/Edit User form)** | `GET /api/users` (list), `POST /api/users` (create), `GET /api/users/[id]` (load one), `PATCH /api/users/[id]` (edit role/status) — this screen must never expose a "change my own role" control; the API already blocks it, but the UI should disable/hide that field for the logged-in user's own row too |

`hooks/useEmployeesGrid.js` should wrap `POST /api/employees/list` as an AG Grid `IDatasource`, per the grid contract in `Docs/hr-payroll-backend.md`.
