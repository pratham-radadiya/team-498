# PeoplePay360 — Backend Implementation Plan

Source of truth for scope/business rules: `project-overview.md` (already in repo root, consolidates the PDF + Excalidraw mockup). This plan sequences the **backend only** (Next.js API routes + Prisma + business logic) in dependency order. Frontend screens are a separate follow-up plan, but the grid/pagination **contract** is defined here because every list endpoint must be shaped to match it from day one.

Existing state checked: `peoplepay360-backend/` is an untouched `create-next-app` scaffold (Next.js 16, React 19, Tailwind v4, JS/jsconfig — no TypeScript). No models, routes, or auth exist yet.

---

## Locked architecture decisions

| Decision | Choice | Why |
|---|---|---|
| Language | **TypeScript**, strict mode | Full type safety end-to-end: Prisma generates model types automatically, Zod schemas give runtime validation + inferred static types (`z.infer`) shared between server and client |
| Database | PostgreSQL | Relational fit for contract-per-period history, salary rule sequencing, dashboard joins/aggregates |
| ORM | Prisma | Type-safe client + migrations, fast to iterate in a time-boxed build |
| Auth | NextAuth.js (Auth.js), Credentials provider, JWT session | Built-in session/JWT handling in App Router; role + employeeId embedded in token |
| Salary formula engine | Safe expression evaluator (e.g. `expr-eval`), given a restricted `{ categories, wage, workedDays }` context | Matches the mockup's `result = categories['BASIC']` intent without arbitrary code execution risk |
| List/grid UI data source | **AG Grid Community**, Infinite Row Model | ⚠️ Flagging a guess to verify: AG Grid's *Server-Side Row Model* (built-in server grouping/pivoting) is an **Enterprise-only, paid** feature. Community only ships the *Infinite Row Model* for server-backed lazy loading — still gives real server-side pagination/sort/filter, just via a simpler `startRow/endRow` datasource contract instead of SSRM's richer request shape. This plan assumes Community. If the team has an Enterprise license, say so and the grid contract below changes. |
| List endpoint pattern | **POST** `.../list` per module, not GET+query-string | AG Grid's datasource passes a `sortModel`/`filterModel` object per column — encoding that safely in a URL query string is worse than a small JSON POST body. GET remains for single-resource fetch (`/api/employees/[id]`) and cheap lookups (`/api/employees/options`) |
| PDF (deferred to Phase 6) | Recommend `@react-pdf/renderer` | JSX-based payslip templates, fits React stack |
| Email (deferred to Phase 6) | Recommend `nodemailer` + SMTP | Simplest for hackathon; swap for Resend/SendGrid if credentials available |

---

## Folder structure (layered, per professional-practice conventions)

Thin routes → controller (validate + orchestrate) → service (business rules) → repository (Prisma access only). Every module gets one file per layer so the pattern stays uniform across all 9 modules.

```
peoplepay360-backend/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/route.ts
│  │     ├─ employees/
│  │     │  ├─ route.ts            # GET (single-purpose lookups) / POST (create)
│  │     │  ├─ list/route.ts       # POST — AG Grid datasource endpoint
│  │     │  ├─ options/route.ts    # GET — lightweight {id,label}[] for FK pickers
│  │     │  └─ [id]/route.ts       # GET / PATCH / DELETE
│  │     ├─ contracts/…            # same 4-route shape
│  │     ├─ working-schedules/…
│  │     ├─ attendance/…
│  │     ├─ timeoff/{types,allocations,requests}/…
│  │     ├─ salary-structures/…
│  │     ├─ salary-rules/…
│  │     ├─ payruns/…
│  │     ├─ payslips/…
│  │     └─ dashboard/…
│  ├─ server/
│  │  ├─ controllers/              # one per module: employee.controller.ts, contract.controller.ts, …
│  │  ├─ services/                 # business rules: employee.service.ts, payroll.service.ts, …
│  │  ├─ repositories/             # Prisma queries only, no business logic: employee.repository.ts, …
│  │  ├─ validators/                # Zod schemas per module: employee.validator.ts exports
│  │  │                             #   createEmployeeSchema, updateEmployeeSchema, employeeListRequestSchema
│  │  ├─ rbac/
│  │  │  ├─ roles.ts                # Role enum + permission matrix (module × role × action)
│  │  │  └─ guards.ts               # requireRole(), requireSelfOrRole(), withAuth() route wrapper
│  │  ├─ grid/
│  │  │  ├─ grid.schema.ts          # shared Zod schema for { startRow, endRow, sortModel, filterModel }
│  │  │  └─ buildPrismaGridQuery.ts # gridRequest -> Prisma { skip, take, orderBy, where }, typed generically
│  │  └─ lib/
│  │     ├─ prisma.ts               # singleton PrismaClient
│  │     ├─ auth.ts                 # NextAuth config
│  │     └─ payroll/
│  │        ├─ computeSalaryRules.ts
│  │        └─ formulaEvaluator.ts
│  ├─ hooks/                        # client-side, consumed once the frontend plan starts
│  │  ├─ useEmployeesGrid.ts        # wraps an AG Grid IDatasource around POST /api/employees/list
│  │  ├─ useContractsGrid.ts
│  │  ├─ useAuthSession.ts
│  │  └─ …one per grid-backed module
│  ├─ types/
│  │  └─ api.ts                     # shared response envelopes: ApiResult<T>, GridResponse<T>
│  └─ middleware.ts                 # role-gated route groups, reads JWT via next-auth
```

**Rule enforced across every module:** a route file never talks to Prisma directly and never contains a business rule — it parses the request, calls the controller, returns the response. The controller validates with the module's Zod schema and calls the service. The service holds the actual business logic (contract-overlap checks, balance math, rule sequencing) and calls the repository for persistence. This keeps every business rule in exactly one place per module, testable without HTTP.

---

## AG Grid & pagination contract (applies to every list-bearing module)

**Request** — `POST /api/<module>/list`, body validated by `grid.schema.ts`:
```ts
{
  startRow: number;      // e.g. 0
  endRow: number;        // e.g. 100 — page size = endRow - startRow
  sortModel: { colId: string; sort: 'asc' | 'desc' }[];
  filterModel: Record<string, { filterType: string; type: string; filter: unknown }>;
}
```

**Response** — shape used by the Infinite Row Model's `successCallback(rowsThisBlock, lastRow)`:
```ts
{
  rows: T[];
  rowCount: number | null;   // total known count, or null if not yet known at the last block
}
```

`buildPrismaGridQuery.ts` translates that request into `{ skip: startRow, take: endRow - startRow, orderBy: [...sortModel], where: {...filterModel} }` generically, so each module's repository just plugs its own `where`-clause field map in — the pagination/sort mechanics are written once, not per module.

Every module in Phases 1–7 gets this same `list/route.ts` + a matching `useXGrid.ts` hook. Small reference lists that a form needs as a dropdown (e.g. picking a Working Schedule on a Contract form) use the separate lightweight `options/route.ts` (`GET`, returns `{ id, label }[]`, no pagination needed) instead of the grid endpoint.

---

## Phase 0 — Foundation, TypeScript, Auth & Grid Scaffolding

- [ ] Convert scaffold to TypeScript: add `typescript`, `@types/react`, `@types/node`, `tsconfig.json` (strict: true); Next.js will migrate remaining `.js` config files automatically on first `next dev`
- [ ] Add deps: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `zod`, `expr-eval`, `ag-grid-community`, `ag-grid-react`
- [ ] `npx prisma init`, configure `DATABASE_URL`, base `prisma/schema.prisma`
- [ ] `User` model: `id, email, passwordHash, role (enum), employeeId (nullable FK), status (Active/Inactive)`
- [ ] `Role` enum: `EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN`
- [ ] Scaffold `src/server/{controllers,services,repositories,validators,rbac,grid,lib}` per the folder structure above
- [ ] `rbac/roles.ts` — permission matrix (module × role × action) as a typed const, single source of truth for both `middleware.ts` and controller-level guards
- [ ] `grid/grid.schema.ts` + `grid/buildPrismaGridQuery.ts` — generic, written once, reused by every module
- [ ] NextAuth config (`lib/auth.ts`): Credentials provider (bcrypt compare), JWT callback embeds `{ userId, role, employeeId }`
- [ ] `middleware.ts`: role-gated route groups (`/api/admin/*`, `/api/payroll/*`, `/api/hr/*`) via `rbac/guards.ts`
- [ ] Seed script (`prisma/seed.ts`): one Admin user
- **Agent:** `rain-skill:database-architect` (schema) + `rain-skill:backend-specialist` (auth + folder scaffolding + grid utility)
- **Verify:** `tsc --noEmit` passes with zero errors; log in as seeded Admin; confirm 401/403 on role-gated route without correct role

## Phase 1 — Employee Master + User Management

- **Models:** `Employee` (department, manager self-FK, workLocation, jobPosition, workingScheduleId, status, company), `User` link
- **Files:** `employee.validator.ts`, `employee.controller.ts`, `employee.service.ts`, `employee.repository.ts` (+ same 4 for `user`)
- **Routes:** `POST /api/employees` (create), `POST /api/employees/list` (AG Grid), `GET /api/employees/options`, `GET/PATCH/DELETE /api/employees/[id]`; `POST/GET /api/users` (Admin only)
- **Business rules:**
  - Employee is the central record other modules link to
  - A User must link to an Employee; role is assigned only at creation by Admin
  - A user can never change their own `role` field (guard on self-PATCH, enforced in `user.service.ts`)
  - Return smart-button counts (contracts/attendance/timeoff) as aggregate queries scoped to one employee
- **Hook:** `useEmployeesGrid.ts`
- **Agent:** `rain-skill:backend-specialist`
- **Verify:** `tsc --noEmit` clean; create employee → create linked user with a role → confirm self-role-elevation attempt is rejected; grid endpoint returns correct `rows`/`rowCount` for a sort + a filter + a page beyond row 0

## Phase 2 — Working Schedule + Contract

- **Models:** `WorkingSchedule` + `WorkingScheduleDay` (day, start, end, break), `Contract`
- **Files:** `workingSchedule.{validator,controller,service,repository}.ts`, `contract.{validator,controller,service,repository}.ts`
- **Business rules:**
  - `totalWeeklyHours` is always server-computed in `workingSchedule.service.ts` from day rows, never accepted from the client
  - `Contract`: employeeId, department, jobPosition, startDate, endDate (nullable), wage, workingScheduleId, salaryStructureId, status (Running/Expired)
  - Enforce no two overlapping **Running** contracts for the same employee (transaction + overlap check in `contract.service.ts`)
- **Routes:** `/api/working-schedules` (+ `/list`, `/options`, `/[id]`), `/api/contracts` (+ `/list`, `/options`, `/[id]`), `/api/employees/[id]/contracts` (scoped, reuses the contract grid contract with a forced `employeeId` filter)
- **Hooks:** `useWorkingSchedulesGrid.ts`, `useContractsGrid.ts`
- **Agent:** `rain-skill:database-architect` + `rain-skill:backend-specialist`
- **Verify:** attempt a 2nd overlapping Running contract for one employee → rejected with a clear error; Contracts grid list correctly highlights/filters by status = Running

## Phase 3 — Attendance

- **Model:** `Attendance` (employeeId, checkIn, checkOut, workedHours computed, overtime computed vs. schedule, status, notes, correctedBy)
- **Files:** `attendance.{validator,controller,service,repository}.ts`
- **Routes:** `/api/attendance/list` (POST, AG Grid, scoped by optional `employeeId` filter), `/api/attendance/[id]` (correction, role-gated), `/api/attendance/check-in`, `/api/attendance/check-out`
- **Business rules:** workedHours/overtime derived in `attendance.service.ts` from checkIn/checkOut against the employee's WorkingSchedule; manual correction restricted to HR Manager and above (`rbac` guard)
- **Hook:** `useAttendanceGrid.ts`
- **Agent:** `rain-skill:backend-specialist`
- **Verify:** check-in → check-out produces correct workedHours; correction attempt by EMPLOYEE role is blocked; grid list paginates correctly with 100+ seeded attendance rows

## Phase 4 — Time Off (Types, Allocations, Requests)

- **Models:** `TimeOffType` (unit enum days/hours, requiresAllocation, approvalRole, payrollWorkEntry flag, color, active), `Allocation` (employeeId, typeId, allocated, taken computed, remaining computed, validity dates, status, approver), `TimeOffRequest` (employeeId, typeId, startDate, endDate, duration, allocationId nullable, reason, status, approver)
- **Files:** `timeOffType.{validator,controller,service,repository}.ts`, `allocation.{…}.ts`, `timeOffRequest.{…}.ts`
- **Routes:** `/api/timeoff/types` (+`/list`,`/options`,`/[id]`), `/api/timeoff/allocations` (+`/list`,`/[id]`), `/api/timeoff/requests` (+`/list`,`/[id]`,`/[id]/approve`,`/[id]/refuse`)
- **Business rules:**
  - Allocation only contributes to balance once approved
  - Approving a Request (for a type requiring allocation) atomically decrements the matched Allocation's `taken`/`remaining` in one transaction (`timeOffRequest.service.ts`)
  - Reject a request if remaining balance is insufficient
- **Hooks:** `useTimeOffTypesGrid.ts`, `useAllocationsGrid.ts`, `useTimeOffRequestsGrid.ts`
- **Agent:** `rain-skill:backend-specialist`
- **Verify:** approve allocation → balance appears; approve request → balance decrements; over-request is rejected; Requests grid filters correctly by Status column

## Phase 5 — Salary Structure & Salary Rules (formula engine)

- **Models:** `SalaryStructure` (name, active), `SalaryRule` (structureId, name, code, category enum [Basic/Allowance/Gross/Deduction/Net], sequence, computationMethod enum [Fixed/Percentage/Formula], fixedAmount, percentageBase, percentageValue, formula string)
- **Files:** `salaryStructure.{validator,controller,service,repository}.ts`, `salaryRule.{…}.ts`
- **Core engine:** `lib/payroll/computeSalaryRules.ts` — fully typed: `computeSalaryRules(rules: SalaryRule[], context: PayrollContext): PayslipLine[]`; iterate rules in ascending sequence, accumulate a `categories` map, evaluate `Formula` rules via `formulaEvaluator.ts` with only `{ categories, wage, workedDays }` exposed
- **Routes:** `/api/salary-structures` (+`/list`,`/options`,`/[id]`), `/api/salary-rules` (+`/list`,`/[id]`, always sorted by `sequence` by default)
- **Business rules:** rules always execute in sequence order; Percentage resolves against contract wage or an already-computed category; Formula sandbox has no network/filesystem access
- **Hooks:** `useSalaryStructuresGrid.ts`, `useSalaryRulesGrid.ts`
- **Agent:** `rain-skill:backend-specialist` + `rain-skill:security-auditor` review of the formula sandbox boundary
- **Verify:** `tsc --noEmit` clean on the engine's types; reproduce the spec's worked 12-rule "Regular Salary" chain end-to-end and confirm Net matches a hand calculation

## Phase 6 — Payroll: Payrun, Payslip, PDF, Email

- **Models:** `Payrun` (name, structureId, periodStart, periodEnd, status [Draft/Validated/Paid]), `Payslip` (payrunId, employeeId, contractId snapshot, status, workedDays, basic/gross/net snapshot, rule-line breakdown), `PayslipWarning` (payslipId, type [missing_bank/duplicate/...], message)
- **Files:** `payrun.{validator,controller,service,repository}.ts`, `payslip.{…}.ts`
- **Routes:**
  - `POST /api/payruns` — wizard step 2 only; creates the batch containing exactly the selected employees (step 1 scope data is passed through, never persisted alone)
  - `POST /api/payruns/list` (AG Grid), `GET /api/payruns/[id]`
  - `POST /api/payruns/[id]/compute` — resolves each employee's period-applicable contract + the Payrun's structure, runs `computeSalaryRules`, writes Payslips, detects warnings
  - `POST /api/payruns/[id]/validate`, `/mark-paid`, `/send-payslips` (bulk email)
  - `POST /api/payslips/list` (AG Grid), `GET /api/payslips/[id]`, `GET /api/payslips/[id]/pdf`
- **Business rules:**
  - Payslip computation resolves the one contract valid for the Payrun's period (reuses Phase 2's resolution logic)
  - Warnings must be surfaced before Validate can proceed
  - Paid/finalized Payruns become immutable (enforced in `payrun.service.ts`)
- **Hooks:** `usePayrunsGrid.ts`, `usePayslipsGrid.ts`
- **Agent:** `rain-skill:backend-specialist` + `rain-skill:database-architect` (payslip line snapshot modeling)
- **Verify:** run a full employee→payslip flow for 2+ employees, one deliberately missing bank info → warning appears; PDF downloads; bulk email send succeeds/logs; Payslips grid sorts by Net and filters by Status correctly

## Phase 7 — Payroll Dashboard (aggregation APIs)

- **Files:** `dashboard.{controller,service,repository}.ts` (no create/update, so no validator beyond a query-filter schema)
- **Routes:** `POST /api/dashboard/kpis`, `/salary-by-department`, `/salary-trend`, `/attendance-overview`, `/timeoff-overview`, `/department-overview` — all accept a typed `{ period, department, employeeType, company }` filter body (POST, not GET, to keep the filter contract consistent with the grid endpoints)
- **Implementation:** Prisma `aggregate`/`groupBy` across Employee/Contract/Payslip/Attendance/TimeOff — no hardcoded figures
- **Agent:** `rain-skill:database-architect` (query design) + `rain-skill:backend-specialist`
- **Verify:** changing filters changes the numbers; hand-verify one KPI against seeded data

## Phase 8 — Seed Data & Security/Verification Gate

- [ ] Seed script covering all modules (employees, contracts, schedules, attendance, timeoff, the spec's worked "Regular Salary" structure, 1–2 payruns) with **enough rows per module (200+) to exercise real pagination**, not just enough to look populated
- [ ] Run `rain-skill:security-gate` — RBAC boundary tests per role, formula-input isolation check, grid endpoint injection check (filterModel values must be validated/typed, never string-concatenated into a query)
- [ ] Run `rain-skill:post-task-review`
- [ ] `tsc --noEmit` across the whole `src/` tree — zero errors, zero `any` introduced without justification
- [ ] Confirm both demo scenarios work end-to-end: employee → payslip, and leave allocation → request

---

## Out of scope for this plan

- Actual UI screens/layouts (Kanban/Form/Wizard) — tracked in a separate frontend plan once this API layer exists. The AG Grid **list** views are the one frontend-adjacent piece pulled forward into this plan because they dictate the API response shape.
- Password reset / invitations / SSO (explicitly optional per spec)

## Reference

- `project-overview.md` — full consolidated spec (already in repo root)
- `PeoplePay360 HR & Payroll.pdf` — original problem statement
- `HRMS OXP - 24 hours.excalidraw` / https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex — mockup
