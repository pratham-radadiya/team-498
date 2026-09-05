# Phase 1 API Contract — Employee (login account + HR record, merged)

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 1.

> **Architecture note — read this before wiring the frontend.** The original Phase 1 design (see the "0) Login & User Access Flow" section of `Docs/HRMS OXP - 24 hours.excalidraw`) had a separate `User` model (login/role) linked to an `Employee` model (HR record). That has since been **merged by explicit decision**: `Employee` is now the login account directly — it carries `passwordHash` and `role` itself. There is no `User` model, no `/api/users/*` route, and no separate "User Management" screen. Everywhere the mockup shows a "Create/Edit User" form, the actual UI is the **Employee Form**, gated to Admin for the fields that provision a login.

All endpoints below require a valid NextAuth session (`withAuth()`); a request with no/invalid/inactive-employee session returns `401 { "error": "..." }` before touching any data. Role-gated endpoints additionally return `403 { "error": "..." }` for disallowed roles.

---

## Auth endpoints (built into NextAuth's catch-all route — not custom code)

These come for free from `NextAuth(authOptions)` in `app/api/auth/[...nextauth]/route.js`; nothing under `server/` implements them.

### `GET /api/auth/csrf` — get a CSRF token
Required as a form field on the two POSTs below.

### `POST /api/auth/callback/credentials` — log in
Body (`application/x-www-form-urlencoded`): `csrfToken`, `email`, `password`, `json=true`. Authenticates directly against `Employee.email` / `Employee.passwordHash`. Sets the `next-auth.session-token` cookie on success.

### `POST /api/auth/signout` — log out
Body: `csrfToken`, `json=true`. **Verified:** clears the session cookie (`Set-Cookie: next-auth.session-token=; Max-Age=0`); a session check immediately after returns `{}`.

### `GET /api/auth/session` — read the current session
Returns `{}` if not logged in, or `{ "user": { employeeId, email, role }, "expires" }` if logged in. (No separate `userId` — `employeeId` **is** the identity.)

---

## Employee endpoints

### `POST /api/employees` — create an employee (this also provisions its login)
**Role: Admin only.** Creating an Employee sets its role and password in the same call — this is the same sensitive operation the old User-module create used to be, so it carries the same restriction.

**Request body:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ required | min length 1 |
| `email` | string | ✅ required | must be a valid email, unique — this is also the login username |
| `password` | string | ✅ required | min length 8 — hashed with bcrypt before storage, never stored/returned plain |
| `role` | `"EMPLOYEE" \| "HR_MANAGER" \| "HR_PAYROLL_USER" \| "HR_PAYROLL_MANAGER" \| "ADMIN"` | ✅ required | controls what this login can do everywhere else in the app |
| `department` | string | optional | |
| `jobPosition` | string | optional | |
| `workLocation` | string | optional | |
| `company` | string | optional | |
| `workingScheduleId` | string | optional | id of a real `WorkingSchedule` row |
| `managerId` | string | optional | id of another Employee |
| `status` | `"Active" \| "Inactive"` | optional | defaults to `"Active"` — Inactive blocks login immediately (`withAuth()` re-checks on every request) |

**Response `201`:** the safe Employee shape (never includes `passwordHash`) —
```json
{
  "id": "string", "name": "string", "email": "string", "status": "Active|Inactive",
  "role": "ROLE", "department": "string|null", "jobPosition": "string|null",
  "workLocation": "string|null", "company": "string|null", "bankAccount": "string|null",
  "workingScheduleId": "string|null", "managerId": "string|null",
  "createdAt": "ISO datetime", "updatedAt": "ISO datetime"
}
```
**Errors:** `400` validation (missing `name`/`email`/`password`/`role`, or invalid email/short password), `403` caller isn't Admin, **`409`** "An employee with this email already exists".

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
{ "rows": [ /* Employee[], safe shape — no passwordHash */ ], "rowCount": 0 }
```

---

### `GET /api/employees/options` — lightweight list for dropdown/FK pickers
**Role:** any authenticated role.

**Response `200`:** `[{ "id": "string", "label": "string" }]` (label = employee name), sorted by name.

---

### `GET /api/employees/[id]` — fetch one employee
**Role:** any authenticated role, but **EMPLOYEE role gets `403` unless `id` equals their own `employeeId`.**

**Response `200`:** the safe Employee shape (see above) plus `smartButtonCounts: { contracts, attendance, timeOff, allocations }`. **`404`** if not found.

---

### `PATCH /api/employees/[id]` — update an employee
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee).

**Request body:** any subset of the create-body fields **except `password`** (no password-change flow exists yet — that field is dropped from this schema entirely).

**Role field is specially guarded**, mirroring the old User-module rule exactly:
- Sending `role` when `id` equals the caller's own `employeeId` → **`403`** "You cannot change your own role" (true even for a no-op value).
- Sending `role` for anyone else when the caller isn't Admin → **`403`** "Only Admin can change a role".

**Errors:** `404` if the employee doesn't exist.

---

### `DELETE /api/employees/[id]` — delete an employee
**Role:** HR Manager, HR Payroll User, HR Payroll Manager, Admin (not Employee). Deleting an Employee deletes its login along with it — there's nothing else to clean up, since they're the same row.

**Response:** `204` no body. **Errors:** `404` if not found.

---

## UI, per the Excalidraw mockup ("0) Login & User Access Flow")

The mockup's own notes for this flow, quoted directly (`Docs/HRMS OXP - 24 hours.excalidraw`):

> Administrators create user accounts and assign access. Employees use Login to enter the HR and Payroll application.
> In the ERP flow, user accounts are created by an Admin. When creating a user, link the account to the relevant employee and assign a role. Roles control which modules, records and actions become available after login. Users must not be able to assign or elevate their own roles. Password reset, invitations, SSO, etc. can be added as enhancements.
> After sign-in, show only the modules and actions allowed by the user's assigned role.

Every one of those rules is implemented exactly as stated above — the only thing that changed from the mockup's original picture is **which screen does it**: there's no separate "User" entity to manage, so "create the account" and "create the employee" are the same form, the same API call, the same screen.

### Screen 1 — Login ("HR Portal")
- Card titled **"Welcome back"**, subtext **"Sign in to continue to your workspace."**
- Fields: **Work Email** (placeholder `name@company.com`), **Password** (masked).
- **Sign In** button → `POST /api/auth/callback/credentials`.
- **Forgot password?** link shown in the mockup — **not implemented** (no password-reset flow exists; the mockup itself flags this as a future enhancement, not a Phase 1 requirement).
- On success, redirect into the app; the session's `role` (from `GET /api/auth/session`) decides which sidebar sections render, per "show only the modules and actions allowed by the user's assigned role."

### Sidebar (role-filtered)
Menu items per the mockup: **Employees ▾**, **Contracts ▾**, **Attendance**, **Time Off ▾**, **Payroll**. Show/hide each section using the role permission matrix in `server/rbac/roles.js` (`PERMISSION_MATRIX`) — e.g. an `EMPLOYEE` role sees Attendance/Time Off scoped to themselves and no Payroll admin screens.

### Screen 2 — Employees (Kanban + List)
- **Default view: Kanban**, grouped by department, one card per employee (name, role/job position, department). A **List** view toggle gives the sortable/filterable AG Grid table.
- Both views open the **same Employee Form** when a card/row is clicked — per the mockup's own note: *"Kanban is good for browsing; clicking a card should open the same Employee Form used everywhere else."*
- Data source for both: `POST /api/employees/list`.

### Screen 3 — Employee Form (doubles as the mockup's "Create/Edit User" form)
This single form covers everything the mockup split across "Employee Form" and "Create / Edit User":

| Mockup field | Maps to | Notes |
|---|---|---|
| Employee * (picker) | — | not needed — this form *is* the employee, not a link to one |
| Work Email * | `email` | also the login username |
| Password | `password` | **create-only.** Hide this field entirely when editing an existing employee — the API rejects it on `PATCH` |
| Role(s) * | `role` | single-select in this implementation (the mockup's checkbox-list implies multi-role; the backend enforces exactly one role per Employee) |
| Status | `status` | Active/Inactive — Inactive immediately blocks login |
| — | `name`, `department`, `jobPosition`, `workLocation`, `company`, `workingScheduleId`, `managerId` | the rest of the HR record, same fields as before the merge |

**Admin-only fields:** the `password` field (create) and the `role` field (create + edit) should only render/submit for a caller with `role === 'ADMIN'`. Everyone else editing an employee (HR Manager, HR Payroll User/Manager) should see the HR fields only — sending `role` as a non-Admin gets a `403` regardless of the UI, so hiding it is a UX courtesy, not the real guard.

**Self-service guard:** whatever screen renders "your own profile" must disable/hide the Role field entirely — the API blocks changing your own role with `403` no matter what value is sent, matching the mockup's *"Users must not be able to assign or elevate their own roles."*

**Smart buttons** (Contracts / Attendance / Time Off / Allocations counts, from `smartButtonCounts` in the `GET /api/employees/[id]` response) open those related records filtered to the current employee — per the mockup's *"smart buttons should open related Contracts, Attendance and Time Off records filtered for the current employee."*

### What replaces the mockup's dedicated "User Management" screen
The mockup shows a standalone screen (**"ADMIN ONLY"** tag, `+ New User` button, search box, Role Filter dropdown, list of Name/Email/Role/Status rows) separate from the Employee list. In this implementation that screen **is just the Employee list**, with two differences an Admin-specific view should add on top of the plain Employees List/Kanban:
- A **Role Filter** dropdown (client-side filter on the already-fetched grid rows, or extend `filterModel` support server-side if the list grows large).
- The **"+ New Employee"** button only visible/enabled for Admin, since `POST /api/employees` is Admin-only.

No separate route, model, or screen is needed — it's the same Employee Form and Employee grid, just reached from wherever the Admin nav puts "Manage Access."

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Login ("HR Portal")** | `POST /api/auth/callback/credentials` (NextAuth) |
| **Employees — Kanban view** (default) | `POST /api/employees/list` (small page size, grouped client-side by department) |
| **Employees — List view** (sort/filter/bulk scanning; also the Admin's "Manage Access" entry point) | `POST /api/employees/list` (AG Grid, full pagination/sort/filter) |
| **Employee Form** (also serves as the mockup's Create/Edit User form) | `GET /api/employees/[id]` to load; `PATCH /api/employees/[id]` to save (role/password fields hidden or blocked per the rules above); `POST /api/employees` for a new record (Admin only — includes `password` + `role`). Manager picker uses `GET /api/employees/options` |
| **Employee Form → smart buttons** (Contracts/Attendance/Time Off/Allocations counts) | `GET /api/employees/[id]` returns `smartButtonCounts`; clicking a button navigates to that module's list pre-filtered to this employee |

`hooks/useEmployeesGrid.js` should wrap `POST /api/employees/list` as an AG Grid `IDatasource`, per the grid contract in `Docs/hr-payroll-backend.md`.

---

## Where to call which API — trigger-by-trigger

Every call this phase needs, in the order a user would actually hit them, with exactly when to fire it and what to do with the result.

### Login flow
| Trigger | Call | When | Then |
|---|---|---|---|
| Login page mounts | `GET /api/auth/csrf` | on mount, before the form is submittable | store `csrfToken` in state/hidden field — NextAuth rejects the login POST without it |
| User clicks **Sign In** | `POST /api/auth/callback/credentials` | on submit, with `email`, `password`, the stored `csrfToken`, `json=true` | `200` + `Set-Cookie` → redirect into the app. No special error body on bad credentials — treat any non-redirect/non-200 as "invalid email or password", since NextAuth never reveals which one was wrong |
| Immediately after login, and on every full app reload | `GET /api/auth/session` | on mount of the authenticated shell (layout-level, once) | empty `{}` → bounce to Login. Otherwise read `user.role` to decide which sidebar sections render (see permission matrix) |
| User clicks **Sign out** | `POST /api/auth/signout` | on click, with `csrfToken` + `json=true` | on response, clear any client-side role/user state and redirect to Login |

### Employees — browsing (Kanban / List)
| Trigger | Call | When | Then |
|---|---|---|---|
| Employees page mounts, view = Kanban | `POST /api/employees/list` | once on mount, with a large `endRow` (Kanban isn't paginated the same way — pull enough rows to group client-side by department) | group `rows` by `department` client-side into columns |
| Employees page mounts, view = List; or user scrolls/sorts/filters the grid | `POST /api/employees/list` | fired by AG Grid's `IDatasource` (`getRows`) — don't call this manually, wire it once through `hooks/useEmployeesGrid.js` | AG Grid handles rendering `rows`/`rowCount` itself |
| User toggles Kanban ↔ List | no new call strictly required | re-use already-fetched rows if the dataset is small; otherwise re-fetch for the new view's page size | |
| Admin's Employees list, **Role Filter** dropdown changes | client-side filter on already-fetched rows (small dataset), or add `role` to `filterModel` if the grid grows large and needs server-side filtering | on dropdown change | note: `role` filtering is **not yet wired** server-side in `FILTER_FIELD_MAP` — add it there first if you go the server-side route |
| User types in a search box (mockup: "Search users, employees or email…") | reuse `filterModel.name` (contains) against `POST /api/employees/list` | debounce ~300ms as the user types | |

### Employee Form — viewing and editing
| Trigger | Call | When | Then |
|---|---|---|---|
| User clicks a Kanban card or List row | `GET /api/employees/[id]` | on navigation into the form | populate all fields; also read `smartButtonCounts` for the button badges. `403` here (EMPLOYEE role opening someone else's record) should never happen if the UI only ever links employees to their own record — treat it as a bug, not a normal error path |
| Form mounts with a Manager picker, or any other employee-picker field | `GET /api/employees/options` | once, on mount (cache it — this list rarely changes mid-session) | populate the dropdown with `{id, label}` pairs |
| User clicks **Create Employee** (Admin only, new-record form) | `POST /api/employees` | on submit | `201` → navigate to the new record's form. `409` → show inline "An employee with this email already exists" under the Email field. `400` → map `details` to the matching field |
| User clicks **Save** on an existing employee | `PATCH /api/employees/[id]` | on submit, body = only the changed fields (never send `password`) | `200` → update local state / toast success. `403` on a role change → this should be prevented by hiding the field per the rules above, so treat a `403` here as a UI bug, not a normal user-facing error |
| User clicks a smart button (Contracts/Attendance/Time Off/Allocations) | none in this phase | on click | navigate to that module's own list screen (Phase 2–4) pre-filtered to `employeeId` — those screens own their own APIs |
| User clicks **Delete** | `DELETE /api/employees/[id]` | after a confirm dialog | `204` → navigate back to the list and remove the row locally |

### General rules for every call above
- Every call needs the session cookie (`credentials: 'include'` on `fetch`, or equivalent) — there's no separate auth token to attach.
- A `401` from **any** endpoint means the session died (e.g. an Admin flipped this user to Inactive mid-session) — the frontend's single fetch wrapper should catch `401` globally and force a redirect to Login, rather than each screen handling it separately.
- A `403` means the role genuinely isn't allowed — for the create/role-change cases above, the UI should already prevent reaching this state by hiding the control, so a `403` in practice signals a UI bug worth logging, not just a toast to swallow silently.
