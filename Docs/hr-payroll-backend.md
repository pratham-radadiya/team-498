# PeoplePay360 — Backend Implementation Plan

Source of truth for scope/business rules: `project-overview.md` (already in repo root, consolidates the PDF + Excalidraw mockup). This plan sequences the **backend only** (Next.js API routes + Prisma + business logic) in dependency order. Frontend screens are a separate follow-up plan, but the grid/pagination **contract** is defined here because every list endpoint must be shaped to match it from day one.

Existing state checked: `peoplepay360-backend/` is an untouched `create-next-app` scaffold (Next.js 16, React 19, Tailwind v4, JS/jsconfig — no TypeScript). No models, routes, or auth exist yet.

---

## Locked architecture decisions

| Decision | Choice | Why |
|---|---|---|
| Language | **JavaScript** (no TypeScript) | Team decision — stays on the existing `jsconfig.json` scaffold. Runtime type safety instead comes from Zod schemas on every request (validated shape, not just documented) and Prisma's generated JS client |
| Database | **Local PostgreSQL 18** (already installed and running on `localhost:5432` — confirmed via `psql`/`pg_isready`; no Docker needed) | Relational fit for contract-per-period history, salary rule sequencing, dashboard joins/aggregates. `DATABASE_URL` in `.env` points at this local instance; create the database once with `createdb peoplepay360` (or `CREATE DATABASE peoplepay360;` in `psql`) before the first `prisma migrate dev` |
| ORM | Prisma | Type-safe-at-runtime client + migrations, fast to iterate in a time-boxed build |
| Auth | NextAuth.js (Auth.js), Credentials provider, JWT session | Built-in session/JWT handling in App Router; role + employeeId embedded in token |
| **Per-request user validation** | **Every API route (except `/api/auth/*`) re-validates the requesting user before running any business logic** | Not just role-gating a few route groups — a shared `withAuth()` wrapper runs on every single route handler, decodes the session, then re-checks that `User.status === 'Active'` in the database on that request (never trusts the JWT payload alone, since a deactivated/deleted user's existing token would otherwise keep working until it expires) |
| Salary formula engine | Safe expression evaluator (e.g. `expr-eval`), given a restricted `{ categories, wage, workedDays }` context | Matches the mockup's `result = categories['BASIC']` intent without arbitrary code execution risk |
| List/grid UI data source | **AG Grid Community**, Infinite Row Model | ⚠️ Flagging a guess to verify: AG Grid's *Server-Side Row Model* (built-in server grouping/pivoting) is an **Enterprise-only, paid** feature. Community only ships the *Infinite Row Model* for server-backed lazy loading — still gives real server-side pagination/sort/filter, just via a simpler `startRow/endRow` datasource contract instead of SSRM's richer request shape. This plan assumes Community. If the team has an Enterprise license, say so and the grid contract below changes. |
| List endpoint pattern | **POST** `.../list` per module, not GET+query-string | AG Grid's datasource passes a `sortModel`/`filterModel` object per column — encoding that safely in a URL query string is worse than a small JSON POST body. GET remains for single-resource fetch (`/api/employees/[id]`) and cheap lookups (`/api/employees/options`) |
| PDF (deferred to Phase 6) | Recommend `@react-pdf/renderer` | JSX-based payslip templates, fits React stack |
| Email (deferred to Phase 6) | Recommend `nodemailer` + SMTP | Simplest for hackathon; swap for Resend/SendGrid if credentials available |

---

## Folder structure (layered, per professional-practice conventions)

Thin routes → controller (validate + orchestrate) → service (business rules) → repository (Prisma access only). Every module gets one file per layer so the pattern stays uniform across all 9 modules. Plain JavaScript throughout (`.js`, not `.ts`).

```
peoplepay360-backend/                 # NO src/ dir — actual scaffold has app/ at project root
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.js
├─ prisma.config.mjs                  # Prisma 7 config (DATABASE_URL, migrations path) — replaces datasource url in schema.prisma
├─ app/
│  └─ api/
│     ├─ auth/[...nextauth]/route.js       # the one route NOT behind withAuth()
│     ├─ employees/
│     │  ├─ route.js             # GET (single-purpose lookups) / POST (create)
│     │  ├─ list/route.js        # POST — AG Grid datasource endpoint
│     │  ├─ options/route.js     # GET — lightweight {id,label}[] for FK pickers
│     │  └─ [id]/route.js        # GET / PATCH / DELETE
│     ├─ contracts/…             # same 4-route shape
│     ├─ working-schedules/…
│     ├─ attendance/…
│     ├─ timeoff/{types,allocations,requests}/…
│     ├─ salary-structures/…
│     ├─ salary-rules/…
│     ├─ payruns/…
│     ├─ payslips/…
│     └─ dashboard/…
├─ server/
│  ├─ controllers/               # one per module: employee.controller.js, contract.controller.js, …
│  ├─ services/                  # business rules: employee.service.js, payroll.service.js, …
│  ├─ repositories/              # Prisma queries only, no business logic: employee.repository.js, …
│  ├─ validators/                 # Zod schemas per module: employee.validator.js exports
│  │                              #   createEmployeeSchema, updateEmployeeSchema, employeeListRequestSchema
│  ├─ rbac/
│  │  ├─ roles.js                 # Role enum (plain object) + permission matrix (module × role × action)
│  │  └─ guards.js                # withAuth() — runs on EVERY route; requireRole(), requireSelfOrRole() — layered on top for role-gated routes
│  ├─ grid/
│  │  ├─ grid.schema.js           # shared Zod schema for { startRow, endRow, sortModel, filterModel }
│  │  └─ buildPrismaGridQuery.js  # gridRequest -> Prisma { skip, take, orderBy, where }, generic across modules
│  └─ lib/
│     ├─ prisma.js                # singleton PrismaClient, instantiated with the @prisma/adapter-pg driver adapter (Prisma 7 requires an adapter, not a bare connection string)
│     ├─ auth.js                  # NextAuth config
│     └─ payroll/
│        ├─ computeSalaryRules.js
│        └─ formulaEvaluator.js
├─ hooks/                         # client-side, consumed once the frontend plan starts
│  ├─ useEmployeesGrid.js         # wraps an AG Grid IDatasource around POST /api/employees/list
│  ├─ useContractsGrid.js
│  ├─ useAuthSession.js
│  └─ …one per grid-backed module
└─ proxy.js                       # edge-level fast reject for unauthenticated requests (defense in depth's first layer)
```

⚠️ **Prisma major-version correction, verified empirically against the actually-installed version (7.10.0), not assumed from training data:** Prisma 7 requires a `prisma.config.mjs` file for `DATABASE_URL` instead of `datasource { url = env(...) }` in `schema.prisma`, and a driver adapter package (`@prisma/adapter-pg` + `pg`) passed to `new PrismaClient({ adapter })` — this is a Prisma-7-wide runtime requirement (confirmed by testing: `new PrismaClient()` with no adapter throws `PrismaClientInitializationError` even with the classic generator) — a bare connection string alone no longer works. Separately, **the generator block must stay on the legacy `provider = "prisma-client-js"`**, not v7's new default `provider = "prisma-client"`: the new generator can only emit TypeScript source (confirmed by inspecting its output — `client.ts` contains real generic type syntax like `export type PrismaClient<LogOpts extends ...>`, regardless of `moduleFormat`), which conflicts with this project's JS-only requirement. `prisma-client-js` emits plain `.js` into `node_modules/@prisma/client` (confirmed by inspecting the output directory), importable the classic way: `import { PrismaClient } from '@prisma/client'`. `prisma generate` and `prisma db seed` must also be run explicitly; they're no longer triggered automatically by `migrate dev`.

⚠️ **Correction after checking this project's actual installed Next.js version (16.3.4) docs, not training-data assumptions:** `middleware.js` is deprecated in Next.js 16, renamed to `proxy.js` with `export function proxy(request)` (not `export function middleware()`). Every mention of "middleware" below means this `proxy.js` file. Next.js's own docs additionally recommend *against* relying on it for auth at all — reinforcing why `withAuth()` inside each route, not the proxy file, is the authoritative check here.

**Rule enforced across every module:** a route file never talks to Prisma directly and never contains a business rule — it calls `withAuth()` first, then parses the request, calls the controller, returns the response. The controller validates with the module's Zod schema and calls the service. The service holds the actual business logic (contract-overlap checks, balance math, rule sequencing) and calls the repository for persistence. This keeps every business rule in exactly one place per module, testable without HTTP.

**Rule enforced on every route without exception (except `/api/auth/*`):** `route.js` calls `withAuth(request)` as its first line. `withAuth()` decodes the NextAuth session, then queries `User` by id and confirms `status === 'Active'` — a request with a technically-valid but stale JWT (user deactivated by Admin after the token was issued) is rejected with 401 on that very request, not just at next login. `withAuth()` returns `{ userId, employeeId, role }` for the controller to use; role-specific routes additionally call `requireRole(session, [...allowedRoles])` from the same file. `proxy.js` (Next.js 16's renamed `middleware.js`, `export function proxy(request)`) is a fast first-pass reject at the edge (no valid session cookie at all → redirect/401 immediately) but is **not** relied on as the sole guard — `withAuth()` inside the route is the authoritative check, since proxy/middleware can be bypassed by direct route invocation in tests or misconfigured matchers.

---

## AG Grid & pagination contract (applies to every list-bearing module)

**Request** — `POST /api/<module>/list`, body validated by `grid.schema.js`:
```js
{
  startRow: 0,          // number
  endRow: 100,           // number — page size = endRow - startRow
  sortModel: [{ colId: 'name', sort: 'asc' }],
  filterModel: {
    // e.g. { status: { filterType: 'text', type: 'equals', filter: 'Running' } }
  },
}
```

**Response** — shape used by the Infinite Row Model's `successCallback(rowsThisBlock, lastRow)`:
```js
{
  rows: [ /* T[] */ ],
  rowCount: 0,   // total known count, or null if not yet known at the last block
}
```

`buildPrismaGridQuery.js` translates that request into `{ skip: startRow, take: endRow - startRow, orderBy: [...sortModel], where: {...filterModel} }` generically, so each module's repository just plugs its own `where`-clause field map in — the pagination/sort mechanics are written once, not per module.

Every module in Phases 1–7 gets this same `list/route.js` + a matching `useXGrid.js` hook. Small reference lists that a form needs as a dropdown (e.g. picking a Working Schedule on a Contract form) use the separate lightweight `options/route.js` (`GET`, returns `{ id, label }[]`, no pagination needed) instead of the grid endpoint.

---

## Role permission matrix (module × role × action)

This is the concrete content `rbac/roles.js` implements as a plain const in Phase 0 — every phase's RBAC guard references this table instead of restating role logic ad hoc. Source: PDF §3 "User Roles" (`project-overview.md` §3).

| Module | Employee | HR Manager | HR Payroll User | HR Payroll Manager | Admin |
|---|---|---|---|---|---|
| Employees | Read (own record only) | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Contracts | Read (own only) | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Working Schedules | Read (own assigned only) | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Attendance | Create + Read (own only) | Full CRUD (all employees, incl. corrections) | Full CRUD (all employees) | Full CRUD (all employees) | Full CRUD |
| Time Off Types | Read only | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Time Off Allocations | Read (own only) | Full CRUD | Full CRUD | Full CRUD | Full CRUD |
| Time Off Requests | Create + Read (own only) | Full CRUD + Approve/Refuse | Full CRUD + Approve/Refuse | Full CRUD + Approve/Refuse | Full CRUD |
| Salary Structures | None | None | **Read-only** | Full CRUD | Full CRUD |
| Salary Rules | None | None | **Read-only** | Full CRUD | Full CRUD |
| Payruns | None | None | Create + Read + Update (**no Delete**) | Full CRUD | Full CRUD |
| Payslips | Read (own only, no PII of others) | None | Create + Read + Update (**no Delete**) | Full CRUD | Full CRUD |
| Payroll Dashboard | None | ⚠️ unspecified by PDF — recommend: **read access** (team to confirm) | Read | Read | Full |
| User Management (accounts, role assignment) | None | None | None | None | Full CRUD |

**Enforced invariants that fall out of this table (implemented in `guards.js`, checked in Phase 9's security gate):**
- Every route validates the requesting user's session and Active status first (see `withAuth()` above), *then* applies the table above — an inactive user is rejected regardless of what the table would otherwise allow.
- No role can grant or elevate its own `role` field — only Admin's User Management flow sets `role`.
- "Own record only" scoping (Employee row) means the service layer filters `WHERE employeeId = session.employeeId`, never trusts a client-supplied `employeeId` for that role.
- HR Manager has zero read/write on Payruns, Payslips, Salary Structures, Salary Rules — attempting any of those routes as HR Manager must 403, not just hide the UI.
- HR Payroll User's "no Delete" on Payruns/Payslips and "Read-only" on Salary Structures/Rules must be enforced at the controller/service layer, not just omitted from a frontend menu.

⚠️ **Open item to confirm with the team:** the PDF doesn't state whether HR Manager can view the Payroll Dashboard (it's not strictly a "payroll feature", but it does aggregate payroll figures like Total Net Salary Paid). Default above is HR Manager gets read access; flag if the team wants dashboard restricted to payroll roles only.

---

## Build order — two rounds

Two-pass strategy: get every module functionally complete first (fastest path to a working, demoable backend), then go back and harden role restrictions module-by-module. This avoids debugging business logic and RBAC plumbing at the same time. The per-request `withAuth()` user-validation check (above) applies from Phase 0 onward in **both** rounds — it's not deferred to Round 2, since even Round 1's Admin-only flows must run through it to prove the pattern works before every other module copies it.

**Round 1 — Admin-side functional core, all modules (Phases 0–7 below).** Admin already has full CRUD on every module per the permission matrix, so build each module's data model, API, and business logic against the Admin role first — the other 4 roles ride on the same code paths, just gated later. By the end of Round 1 the entire spec's business logic (contract-period resolution, schedule hour computation, leave balance math, salary rule sequencing, payrun lifecycle, dashboard aggregation) works end-to-end, provable with the seeded Admin account.

**Round 2 — Role-restriction hardening, one module at a time, in the Excalidraw mockup's own navigation grouping (Phase 8 below).** Once the functional core exists, revisit modules **in the exact grouping the mockup's top nav uses** — not the Round 1 dependency order — and wire in the other 4 roles' restrictions from the permission matrix, plus each module's mockup-specific nuances (quick check-in/out widget, approve/refuse actions, payrun wizard steps). Mockup grouping, in order:
1. Employees & Contracts (one nav item, one Employee Form hub)
2. Attendance (global nav item + employee-scoped smart button)
3. Time Off — Requests, Allocations, Types, and its own mini-dashboard, all under one `Time Off ▼` dropdown, hardened together as one module
4. Payroll — Payruns, Payslips, Structures, Rules, all under one `Payroll ▼` dropdown, hardened together as one module
5. Payroll Dashboard

Phase 9 (seed data + final cross-module security gate) closes out after both rounds.

---

## Phase 0 — Foundation, Auth & Grid Scaffolding *(Round 1)*

- [x] Add deps: `prisma@7.10.0`, `@prisma/client@7.10.0` (pinned exact — `npm install prisma` alone resolves to an `8.0.0-rc` release candidate while `@prisma/client` resolves to stable `7.10.0`; pinning both avoids a CLI/client version mismatch), `next-auth` (resolved to stable `4.24.15`), `bcryptjs`, `zod`, `expr-eval`, `ag-grid-community`, `ag-grid-react`, `@prisma/adapter-pg`, `pg`, `dotenv`
- [x] `npx prisma init --datasource-provider postgresql`; write `prisma.config.mjs` (DATABASE_URL via `env()` + `dotenv/config`); `schema.prisma`'s `generator client` block uses `provider = "prisma-client-js"` (the legacy JS-emitting generator — see the correction above)
- [x] `User` model: `id, email, passwordHash, role (enum), employeeId (nullable, becomes a real FK once Employee exists in Phase 1), status (Active/Inactive)`
- [x] `Role` enum: `EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN`
- [x] Scaffold `server/{controllers,services,repositories,validators,rbac,grid,lib}` per the folder structure above (plain `.js`, project root — no `src/`)
- [x] `rbac/roles.js` — permission matrix (module × role × action) as a plain const, single source of truth for both `proxy.js` and controller-level guards
- [x] `rbac/guards.js` — `withAuth(request)` (decode session, re-check `User.status === 'Active'` in the DB, return `{ userId, employeeId, role }` or throw 401) + `requireRole(session, allowedRoles)` (throw 403). **`withAuth()` is written once here and imported into literally every route file from Phase 1 onward.**
- [x] `grid/grid.schema.js` + `grid/buildPrismaGridQuery.js` — generic, written once, reused by every module — Zod schema verified against installed zod v4's `z.record(keySchema, valueSchema)` signature
- [x] `lib/prisma.js`: singleton `PrismaClient` instantiated with `new PrismaPg({ connectionString: process.env.DATABASE_URL })` as its `adapter` (Prisma 7 requirement)
- [x] NextAuth config (`lib/auth.js`): Credentials provider (bcrypt compare), JWT callback embeds `{ userId, role, employeeId }`
- [x] `proxy.js` (NOT `middleware.js` — deprecated/renamed in this project's Next.js 16): `export function proxy(request) {...}`, edge-level fast reject for requests with no session cookie at all (first line of defense; `withAuth()` per-route remains the authoritative check)
- [x] Create the local database: `createdb peoplepay360` (or via `psql`), then point `.env`'s `DATABASE_URL` at the local instance, run `npx prisma migrate dev --name init` and then `npx prisma generate` explicitly (Prisma 7 no longer auto-generates after migrate) — verified: migration applied, client generated to `node_modules/@prisma/client`, a real query against the local DB succeeded via `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- [x] Seed script (`prisma/seed.js`): one Admin user — run explicitly via `npx prisma db seed` (Prisma 7 no longer auto-seeds) — ran successfully, created `admin@peoplepay360.com`
- **Agent:** `rain-skill:database-architect` (schema) + `rain-skill:backend-specialist` (auth + folder scaffolding + grid utility)
- **Verify — all confirmed with real evidence, `next dev` running against the local DB:**
  - `resolveActiveUser()` tested directly against the DB: `null` userId → rejected; seeded Admin → resolved `{role: "ADMIN", ...}`; Admin's `status` flipped to `Inactive` in the DB → immediately rejected on next check (proves the DB re-check, not just JWT trust); reactivated afterward
  - `GET /api/auth/session` before login → `{}`; NextAuth credentials login (`POST /api/auth/callback/credentials` with CSRF token) → succeeded; `GET /api/auth/session` after login → `{"user":{"email":"admin@peoplepay360.com","role":"ADMIN",...}}`
  - `GET /api/employees` (no route exists yet, but proxy's matcher still applies) with no session cookie → **401** `{"error":"Not authenticated"}`; same request with the session cookie → **404** (Next's own not-found, proving proxy let it through); `GET /api/auth/session` with no cookie → **200** (correctly excluded from the proxy matcher)

## Phase 1 — Employee Master + User Management *(Round 1)* ✅ DONE — see `Docs/api/phase-1-employee-user.md` for the full API contract

- **Models:** `Employee` (department, manager self-FK, workLocation, jobPosition, workingScheduleId, status, company), `User` link
- **Files:** `employee.validator.js`, `employee.controller.js`, `employee.service.js`, `employee.repository.js` (+ same 4 for `user`)
- **Routes:** `POST /api/employees` (create), `POST /api/employees/list` (AG Grid), `GET /api/employees/options`, `GET/PATCH/DELETE /api/employees/[id]`; `POST/GET /api/users` (Admin only) — every one of these calls `withAuth()` first
- **Business rules:**
  - Employee is the central record other modules link to
  - A User must link to an Employee; role is assigned only at creation by Admin
  - A user can never change their own `role` field (guard on self-PATCH, enforced in `user.service.js`)
  - Per the permission matrix: EMPLOYEE role reads only their own record (`WHERE employeeId = session.employeeId`, never a client-supplied id); all other roles get full CRUD (User Management stays Admin-only)
  - ⚠️ Deferred: smart-button counts (contracts/attendance/timeoff) can't be implemented yet — those models don't exist until Phases 2–4. Revisit once they land.
- **Hook:** `useEmployeesGrid.js`
- **Agent:** `rain-skill:backend-specialist`
- **Verify — all confirmed against the running server + real DB:**
  - Admin created an Employee (201), listed via grid (`rows`/`rowCount` correct), fetched by id, updated (PATCH), deleted (204)
  - Admin created a User linked to that Employee with role `EMPLOYEE`; duplicate user for the same `employeeId` → **409**; missing required fields on create → **400** with Zod issue details
  - Logged in as the EMPLOYEE user: reading own record → **200**; reading a different employee's record → **403** "You may only view your own employee record"; grid list forced to own record only regardless of filters; attempting to `POST /api/employees` (create) → **403** "Insufficient role for this action"
  - Admin attempting to `PATCH` **their own** role → **403** "You cannot change your own role"; Admin changing a *different* user's role → succeeds
  - Confirmed the smart-button-counts deferral above didn't silently ship half-working code — it's simply not called anywhere yet

## Phase 2 — Working Schedule + Contract *(Round 1)* ✅ DONE — see `Docs/api/phase-2-working-schedule-contract.md` for the full API contract

- **Models:** `WorkingSchedule` (name, **calendarType** — per mockup's list-view column, e.g. Standard/Night Shift/Flexible — a plain label field, not a separate lookup table, company, status) + `WorkingScheduleDay` (day, start, end, break), `Contract`. `Employee.workingScheduleId` upgraded from Phase 1's placeholder plain string to a real Prisma FK relation now that `WorkingSchedule` exists.
- **Files:** `workingSchedule.{validator,controller,service,repository}.js`, `contract.{validator,controller,service,repository}.js`
- **Business rules:**
  - `totalWeeklyHours` is always server-computed in `workingSchedule.service.js` from day rows, never accepted from the client
  - `Contract`: employeeId, department, jobPosition, startDate, endDate (nullable), wage, workingScheduleId, salaryStructureId, status (Running/Expired)
  - Enforce no two overlapping **Running** contracts for the same employee (overlap check in `contract.service.js`, via `findOverlappingRunningContracts` in the repository)
- **Routes:** `/api/working-schedules` (+ `/list`, `/options`, `/[id]`), `/api/contracts` (+ `/list`, `/[id]`), `/api/employees/[id]/contracts` (scoped, reuses the contract grid contract with a forced `employeeId` filter) — all behind `withAuth()`. No `/api/contracts/options` — nothing in the app picks "a contract" from a generic dropdown, unlike Working Schedules which are referenced by Employee/Contract forms.
- **Hooks:** `useWorkingSchedulesGrid.js`, `useContractsGrid.js`
- **Agent:** `rain-skill:database-architect` + `rain-skill:backend-specialist`
- **Verify — all confirmed against the running server + real DB:**
  - Created a WorkingSchedule with 2 days (09:00–17:00, 30min break each) → server computed `hours: 7.5` per day, `totalWeeklyHours: 15` (client never sent these)
  - A day entry with `endTime` before `startTime` → **400** "Invalid day entry... endTime must be after startTime + break"
  - `GET /api/working-schedules/options` → `[{id, label}]`, Active schedules only
  - Assigned the schedule to Aarav's Employee record via `PATCH /api/employees/[id]`; created a Running Contract for him referencing it
  - 2nd overlapping Running contract for the same employee → **409** "already has a Running contract that overlaps this period"; after expiring the first (`status: "Expired"`, `endDate` set), a new non-overlapping Running contract → **201**
  - EMPLOYEE role: reading their own assigned WorkingSchedule → **200**; `PATCH` on any WorkingSchedule → **403**; their Contracts grid list is silently forced to their own `employeeId` regardless of filters; `POST /api/employees/[id]/contracts` for a *different* employee's id → **403** "You may only view your own contracts"
  - Found and fixed a real bug during verification: Zod validated `startDate`/`endDate` as plain `"YYYY-MM-DD"` strings, but Prisma's `DateTime` column requires a real `Date`/full ISO datetime — `contract.service.js` now converts both fields once, centrally, before anything reaches the repository

## Phase 3 — Attendance *(Round 1)* ✅ DONE — see `Docs/api/phase-3-attendance.md` for the full API contract

- **Model:** `Attendance` (employeeId, checkIn, checkOut, workedHours computed, overtime computed vs. schedule, status, notes, correctedBy)
- **Files:** `attendance.{validator,controller,service,repository}.js`
- **Routes:** `/api/attendance/list` (POST, AG Grid, scoped by optional `employeeId` filter), `/api/attendance/[id]` (GET/PATCH correction/DELETE, role-gated), `/api/attendance/check-in`, `/api/attendance/check-out` — all behind `withAuth()`. Non-EMPLOYEE roles may pass an `employeeId` in the check-in/check-out body to act on someone else's behalf; EMPLOYEE role always acts on their own session, ignoring that field.
- **Business rules:** workedHours/overtime derived in `attendance.service.js` from checkIn/checkOut against the employee's assigned WorkingSchedule day (matched by weekday); falls back to zero measurable overtime when there's no schedule or no matching day, rather than counting all hours as overtime. Duplicate check-in (already has an open session) and check-out-with-no-open-session both rejected with `409`. Per the permission matrix: EMPLOYEE may only Create + Read their own Attendance (no correction); HR Manager, HR Payroll User, HR Payroll Manager, and Admin all get full CRUD including manual correction (`rbac` guard)
- **Hook:** `useAttendanceGrid.js`
- **Agent:** `rain-skill:backend-specialist`
- **Verify — all confirmed against the running server + real DB:**
  - Check-in → check-out (a few seconds apart) → `workedHours` and `overtime` computed correctly (`overtime: 0` since no schedule entry for that weekday); duplicate check-in while open → **409**; check-out with no open session → **409**
  - Admin corrected a record's `checkIn`/`checkOut` to a synthetic 10-hour Monday shift → `workedHours: 10`, `overtime: 2.5` against the employee's 7.5h Monday schedule entry, `correctedBy` set to the Admin's userId
  - EMPLOYEE attempting `PATCH`/`DELETE` → **403**; reading their own record → **200**
  - Bulk-seeded 120 attendance rows directly via Prisma; grid list `rowCount: 122`, page 1 (`0-50`) returned 50 rows, page 3 (`100-150`) correctly returned the remaining 22

## Phase 4 — Time Off (Types, Allocations, Requests) *(Round 1)* ✅ DONE — see `Docs/api/phase-4-time-off.md` for the full API contract

- **Models:** `TimeOffType` (unit enum days/hours, requiresAllocation, approvalRole, payrollWorkEntry flag, color, active), `Allocation` (employeeId, typeId, allocated, taken computed, remaining computed at read-time, validity dates, status, approver), `TimeOffRequest` (employeeId, typeId, startDate, endDate, duration computed, allocationId nullable, reason, status, approver)
- **Files:** `timeOffType.{validator,controller,service,repository}.js`, `allocation.{…}.js`, `timeOffRequest.{…}.js`
- **Routes:** `/api/timeoff/types` (+`/list`,`/options`,`/[id]`), `/api/timeoff/allocations` (+`/list`,`/[id]`), `/api/timeoff/requests` (+`/list`,`/[id]`,`/[id]/approve`,`/[id]/refuse`) — all behind `withAuth()`
- **Business rules:**
  - Allocation only contributes to balance once approved; `remaining = allocated - taken` is always computed at read time, never persisted, so the two numbers can't drift apart
  - Per the mockup's refined wording: for a `TimeOffType` with `requiresAllocation = true`, the employee must already have an available (Approved) Allocation with sufficient remaining balance **at Request creation time** — `timeOffRequest.service.js` checks this on `POST`, not only when the request is later approved. A request that fails this check is rejected immediately with `409`, not left to fail silently at approval. A request maps to exactly **one specific** Allocation (picked deterministically, oldest first) — balance is never summed across multiple Allocations.
  - `duration` is server-computed from `startDate`/`endDate` (inclusive day count) — never accepted from the client
  - Approving a Request (for a type requiring allocation) atomically decrements the matched Allocation's `taken` in one transaction (`timeOffRequest.service.js`)
  - Balance is re-checked **again at approval time** (not just at creation) — a request that was valid on submission can still be rejected at approval if the allocation's balance changed in the meantime (e.g. another request consumed it first)
  - Approve/refuse are only valid on a `Pending` request — both reject with `409` on an already-Approved/Refused one
- **Hooks:** `useTimeOffTypesGrid.js`, `useAllocationsGrid.js`, `useTimeOffRequestsGrid.js`
- **Agent:** `rain-skill:backend-specialist`
- **Verify — all confirmed against the running server + real DB:**
  - Request with no allocation at all → **409**; same request after an allocation exists but is still `Pending` (not yet Approved) → still **409**; after HR approves the allocation → request **201** with `duration: 3`, matched to the correct `allocationId`
  - A 2nd request for 8 more days succeeded at submission (balance still shows 10 while the first request is only Pending — Pending requests don't reserve balance); a 3rd request for 20 days → **409** (exceeds the 10 allocated)
  - Admin approved the 3-day request → allocation's `taken` went `0→3`, `remaining` `10→7`; approving the 8-day request next → **409** "no longer has sufficient remaining balance" (re-checked at approval, not just at creation) → refused instead → **200**
  - EMPLOYEE: blocked (`403`) from creating Types/Allocations and from approving/refusing; could create their own Request; Allocations/Requests grids silently scoped to their own `employeeId`
  - Double-approve on an already-Approved request → **409** "Only a Pending request can be approved"

### Pending items from earlier phases, completed now
- **Phase 1's deferred smart-button counts** — `GET /api/employees/[id]` now returns `smartButtonCounts: { contracts, attendance, timeOff, allocations }` via a single Prisma `_count` query. Verified: `{contracts: 2, attendance: 121, timeOff: 0, allocations: 0}` for the test employee at the time.
- **Phase 3's deferred "current attendance status" gap** — added `GET /api/attendance/current` (`{ isOpen, attendance }`), exactly what the quick check-in/out widget needs. Verified: `isOpen: false` before check-in, `isOpen: true` with the open record right after check-in, back to `false` after check-out.

### Full remaining schema built ahead of the plan, at this point
Rather than keep upgrading placeholder-string FKs phase by phase (as happened with `workingScheduleId` in Phase 2 and `salaryStructureId` here), **all of Phase 5 and 6's models were added to `schema.prisma` in this same migration**: `SalaryStructure`, `SalaryRule`, `Payrun`, `Payslip`, `PayslipWarning` — with `Contract.salaryStructureId` upgraded from a placeholder string to a real FK now that `SalaryStructure` exists. Phases 5 and 6 below only need to add the service/controller/route layer on top of tables that already exist and are already migrated. `npx prisma validate` was run and one missing back-relation (`Contract.payslips`) was caught and fixed before migrating.

### Mock data seeded (`rain-skill:mock-data-seeding`)
`prisma/seed.js` (extended, not replaced) now seeds a full deterministic dataset (`faker.seed(12345)`, wipe-and-reseed, guarded against `NODE_ENV=production` and non-local `DATABASE_URL`): 6 Users (one per role, fixed demo credentials, plus one deliberately `Inactive`), 21 Employees, 4 Working Schedules, 26 Contracts (some with Expired+Running history), 252 Attendance rows (30 weekdays × 12 employees), 3 Salary Structures with all 19 Rules (the PDF's exact 12-rule "Regular Salary" chain plus lighter Intern/Contractor structures), 3 Time Off Types, 12 Allocations, 9 Time Off Requests (6 Approved, 2 Pending, 1 Refused). Verified idempotent — re-running produced identical counts. Demo logins:

| Email | Password | Role |
|---|---|---|
| `admin@peoplepay360.com` | `Admin@123` | ADMIN |
| `employee@peoplepay360.com` | `Employee@123` | EMPLOYEE |
| `hrmanager@peoplepay360.com` | `Manager@123` | HR_MANAGER |
| `payrolluser@peoplepay360.com` | `Payroll@123` | HR_PAYROLL_USER |
| `payrollmanager@peoplepay360.com` | `Payroll@123` | HR_PAYROLL_MANAGER |
| `inactive@peoplepay360.com` | `Employee@123` | EMPLOYEE, status `Inactive` — for testing the deactivated-user rejection |

## Phase 5 — Salary Structure & Salary Rules (formula engine) *(Round 1)*

**Schema already migrated** (see the note above) — this phase only adds `salaryStructure.{validator,controller,service,repository}.js`, `salaryRule.{…}.js`, and the formula engine on top of the existing tables.

- **Models:** `SalaryStructure` (name, active), `SalaryRule` (structureId, name, code, category enum [Basic/Allowance/Gross/Deduction/Net], sequence, computationMethod enum [Fixed/Percentage/Formula], fixedAmount, percentageBase, percentageValue, formula string)
- **Files:** `salaryStructure.{validator,controller,service,repository}.js`, `salaryRule.{…}.js`
- **Core engine:** `lib/payroll/computeSalaryRules.js` — `computeSalaryRules(rules, context)` returns an array of payslip lines; iterate rules in ascending sequence, accumulate a `categories` map, evaluate `Formula` rules via `formulaEvaluator.js` with only `{ categories, wage, workedDays }` exposed
- **Routes:** `/api/salary-structures` (+`/list`,`/options`,`/[id]`), `/api/salary-rules` (+`/list`,`/[id]`, always sorted by `sequence` by default) — all behind `withAuth()`
- **Business rules:** rules always execute in sequence order; Percentage resolves against contract wage or an already-computed category; Formula sandbox has no network/filesystem access. Per the permission matrix: HR Payroll User gets **read-only** access (403 on POST/PATCH/DELETE at the controller layer, not just hidden in a UI); HR Payroll Manager and Admin get full CRUD; HR Manager and Employee get no access at all
- **Hooks:** `useSalaryStructuresGrid.js`, `useSalaryRulesGrid.js`
- **Agent:** `rain-skill:backend-specialist` + `rain-skill:security-auditor` review of the formula sandbox boundary
- **Verify:** reproduce the spec's worked 12-rule "Regular Salary" chain end-to-end and confirm Net matches a hand calculation

## Phase 6 — Payroll: Payrun, Payslip, PDF, Email *(Round 1)*

- **Models:** `Payrun` (name, structureId, periodStart, periodEnd, status [Draft/Validated/Paid]), `Payslip` (payrunId, employeeId, contractId snapshot, status, workedDays, basic/gross/net snapshot, rule-line breakdown), `PayslipWarning` (payslipId, type [missing_bank/duplicate/...], message)
- **Files:** `payrun.{validator,controller,service,repository}.js`, `payslip.{…}.js`
- **Routes:** (all behind `withAuth()`)
  - `POST /api/payruns` — wizard step 2 only; creates the batch containing exactly the selected employees (step 1 scope data is passed through, never persisted alone)
  - `POST /api/payruns/list` (AG Grid), `GET /api/payruns/[id]`
  - `POST /api/payruns/[id]/compute` — resolves each employee's period-applicable contract + the Payrun's structure, runs `computeSalaryRules`, writes Payslips, detects warnings
  - `POST /api/payruns/[id]/validate`, `/mark-paid`, `/send-payslips` (bulk email)
  - `POST /api/payslips/list` (AG Grid), `GET /api/payslips/[id]`, `GET /api/payslips/[id]/pdf`
- **Business rules:**
  - Payslip computation resolves the one contract valid for the Payrun's period (reuses Phase 2's resolution logic)
  - Warnings must be surfaced before Validate can proceed
  - Paid/finalized Payruns become immutable (enforced in `payrun.service.js`)
  - Per the permission matrix: HR Payroll User gets Create + Read + Update but **no Delete** on Payruns/Payslips (guard the DELETE handler specifically, don't just omit it from routes); HR Payroll Manager and Admin get full CRUD; Employee gets Read on their own Payslips only; HR Manager gets no access at all
- **Hooks:** `usePayrunsGrid.js`, `usePayslipsGrid.js`
- **Agent:** `rain-skill:backend-specialist` + `rain-skill:database-architect` (payslip line snapshot modeling)
- **Verify:** run a full employee→payslip flow for 2+ employees, one deliberately missing bank info → warning appears; PDF downloads; bulk email send succeeds/logs; Payslips grid sorts by Net and filters by Status correctly

## Phase 7 — Payroll Dashboard (aggregation APIs) *(Round 1)*

- **Files:** `dashboard.{controller,service,repository}.js` (no create/update, so no validator beyond a query-filter schema)
- **Routes:** `POST /api/dashboard/kpis`, `/salary-by-department`, `/salary-trend`, `/attendance-overview`, `/timeoff-overview`, `/department-overview` — all accept a `{ period, department, employeeType, company }` filter body (POST, not GET, to keep the filter contract consistent with the grid endpoints), all behind `withAuth()`
- **Implementation:** Prisma `aggregate`/`groupBy` across Employee/Contract/Payslip/Attendance/TimeOff — no hardcoded figures
- **Minimum content bar (verbatim from the mockup's own dashboard spec note — treat as the acceptance floor, not a ceiling):**
  - Salary payment KPIs: total net salary, number of payslips, paid/pending state
  - Department overview: headcount and/or total salary by department
  - Time Off overview: approved leave days, pending requests, remaining balances by type
  - Attendance overview: present/absent/late counts, overtime or data-quality gaps (e.g. missing check-outs)
  - At least 2 visual summaries (bar/line/stacked chart or compact table) — not KPI cards alone
- **Agent:** `rain-skill:database-architect` (query design) + `rain-skill:backend-specialist`
- **Verify:** changing filters changes the numbers; hand-verify one KPI against seeded data

## Phase 8 — Round 2: Role-Restriction Hardening (module by module, Excalidraw nav order)

Round 1 delivered every module working end-to-end for Admin, already behind `withAuth()`'s per-request user validation. This phase does **not** add new models or endpoints — it wires the already-defined Role permission matrix into the existing controllers/services for the other 4 roles, plus a couple of mockup-specific behaviors that only matter once non-Admin roles exist. Each module below is one self-contained hardening pass with its own verification, in the mockup's own top-nav grouping order (not the Round 1 dependency order):

- [ ] **8.1 Employees & Contracts** — enforce EMPLOYEE's own-record-only read on `employee.service.js` / `contract.service.js`; confirm HR Manager/HR Payroll User/HR Payroll Manager/Admin all still get full CRUD
  - Verify: log in as a seeded EMPLOYEE user → can read own Employee+Contracts, 403 on any other employeeId; log in as HR Manager → full CRUD still works
- [ ] **8.2 Attendance** — enforce EMPLOYEE's Create+Read-own-only scope (no correction endpoint access); implement the mockup's quick check-in/check-out widget behavior (auto-detect open session, live elapsed time is a frontend concern but the API must expose "current open attendance for this employee")
  - Verify: EMPLOYEE can check in/out and read own records, 403 on `/api/attendance/[id]` PATCH (correction) and on other employees' records
- [ ] **8.3 Time Off — Requests, Allocations, Types (hardened together, one module per the mockup's single `Time Off ▼` dropdown)** — EMPLOYEE can create/read own Requests only and read own Allocations, no access to Types or Allocation creation; HR Manager+ keep full CRUD + Approve/Refuse
  - Verify: EMPLOYEE submits a request → visible only to them and their approver; EMPLOYEE attempting to approve/refuse or edit a Time Off Type → 403
- [ ] **8.4 Payroll — Payruns, Payslips, Structures, Rules (hardened together, one module per the mockup's single `Payroll ▼` dropdown)** — HR Manager gets 403 on all four; HR Payroll User gets CRU-no-Delete on Payruns/Payslips and read-only on Structures/Rules; HR Payroll Manager/Admin keep full CRUD; EMPLOYEE gets read-only on their own Payslips
  - Verify: HR Payroll User attempts DELETE on a Payrun → 403; attempts PATCH on a Salary Rule → 403; EMPLOYEE can view own Payslip PDF but not another employee's
- [ ] **8.5 Payroll Dashboard** — apply the confirmed (or default) dashboard-access rule from the permission matrix; EMPLOYEE gets 403
  - Verify: role-by-role check against the matrix's Dashboard row
- **Agent:** `rain-skill:backend-specialist` (guard wiring) + `rain-skill:security-auditor` (per-module boundary review, folded into each 8.x verify step rather than one pass at the very end)

## Phase 9 — Seed Data & Final Security/Verification Gate

- [ ] Seed script covering all modules (employees, contracts, schedules, attendance, timeoff, the spec's worked "Regular Salary" structure, 1–2 payruns) with **enough rows per module (200+) to exercise real pagination**, not just enough to look populated
- [ ] Seed at least one User per role (EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN), plus one Inactive user, so Phase 8's per-module role checks and the deactivated-user check are actually runnable end-to-end
- [ ] Run `rain-skill:security-gate` — full cross-module RBAC boundary sweep (re-checking all of Phase 8's role/module combinations together), confirm every route (grep the whole `src/app/api` tree) actually calls `withAuth()` with none skipped, formula-input isolation check, grid endpoint injection check (filterModel values must be validated/typed, never string-concatenated into a query)
- [ ] Run `rain-skill:post-task-review`
- [ ] Confirm both demo scenarios work end-to-end: employee → payslip, and leave allocation → request

---

## Out of scope for this plan

- Actual UI screens/layouts (Kanban/Form/Wizard) — tracked in a separate frontend plan once this API layer exists. The AG Grid **list** views are the one frontend-adjacent piece pulled forward into this plan because they dictate the API response shape.
- Password reset / invitations / SSO (explicitly optional per spec)

## Reference

- `project-overview.md` — full consolidated spec (already in repo root)
- `PeoplePay360 HR & Payroll.pdf` — original problem statement
- `HRMS OXP - 24 hours.excalidraw` / https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex — mockup
