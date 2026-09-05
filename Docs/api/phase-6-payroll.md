# Phase 6 API Contract — Payroll: Payrun, Payslip, PDF, Email

Status: **implemented & verified** against the running dev server + local Postgres DB, including real PDF generation and real SMTP email delivery (via a test Ethereal account). Source: `Docs/hr-payroll-backend.md` Phase 6.

All endpoints require a valid session (`withAuth()`) → `401` if missing/inactive.

**Role matrix for this phase:**

| Role | Payruns | Payslips |
|---|---|---|
| Employee | None | Read (own only) |
| HR Manager | None | None |
| HR Payroll User | Create, Read, Update — **no Delete** | Create, Read, Update — **no Delete** |
| HR Payroll Manager | Full CRUD | Full CRUD |
| Admin | Full CRUD | Full CRUD |

Once a Payrun's `status` is `"Paid"`, it and its Payslips become immutable **for every role, including Admin** — this overrides the CRUD grants above.

---

## Payrun endpoints

### `POST /api/payruns/eligible-employees` — wizard step 2's data source
**Role:** HR Payroll User, HR Payroll Manager, Admin.

| Field | Type | Required |
|---|---|---|
| `periodStart` / `periodEnd` | `"YYYY-MM-DD"` | ✅ required |

**Response `200`:** `[{ id, name, workingHours, startDate, wage }]` — employees with a Running contract overlapping the period, with that contract's working hours (from its assigned Working Schedule), start date, and wage — exactly the columns the mockup's step-2 checkbox table needs.

### `POST /api/payruns` — create (wizard's final "Create Payrun" click)
**Role:** HR Payroll User, HR Payroll Manager, Admin.

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ required |
| `structureId` | string | ✅ required — the ONE Salary Structure used for every Payslip in this batch, regardless of what each employee's own Contract references |
| `periodStart` / `periodEnd` | `"YYYY-MM-DD"` | ✅ required |
| `employeeIds` | string[], min 1 | ✅ required — the wizard step 2 selection |

**Response `201`:** the Payrun with one Draft Payslip per `employeeId` already created (all financial fields `null` until `/compute` runs).

### `POST /api/payruns/list` — AG Grid. Filterable: `status`, `structureId` (both equals). Rows include `payslipCount`.
### `GET /api/payruns/[id]` — includes `payslips[]` (each with `warnings[]`) and `structure`.
### `DELETE /api/payruns/[id]` — HR Payroll Manager, Admin only (not HR Payroll User). **`409`** if the Payrun is Paid. Cascades to delete its Payslips (and their warnings).

### `POST /api/payruns/[id]/compute`
**Role:** HR Payroll User, HR Payroll Manager, Admin. **`409`** if the Payrun is Paid.

For each Payslip in the Payrun:
1. Resolves the employee's applicable Contract for the Payrun's period (same overlap logic as Phase 2).
2. If none found → `no_contract` warning, that Payslip's financials stay `null`, moves to the next employee.
3. Counts real `workedDays` from Attendance (`status: "Present"`, `checkOut` set, `checkIn` within the period).
4. Runs `computeSalaryRules` (Phase 5's engine) with the Payrun's Salary Structure and the contract's wage.
5. Writes `contractId`, `workedDays`, `basic`, `gross`, `net`, `lines` onto the Payslip. **Does not change the Payslip's or Payrun's lifecycle status** — Draft stays Draft.
6. Detects and (re-)writes warnings: `missing_bank` (no `Employee.bankAccount`), `duplicate` (this employee already has a Validated/Paid Payslip in a different Payrun whose period overlaps this one).

Re-running compute on the same (non-Paid) Payrun is allowed and re-does all of the above from scratch (warnings are replaced, not appended).

**Response `200`:** the full updated Payrun with all Payslips + warnings.

### `POST /api/payruns/[id]/validate`
Only valid from `status: "Draft"` → **`409`** otherwise. Moves the Payrun and all its Payslips to `"Validated"`.

### `POST /api/payruns/[id]/mark-paid`
Only valid from `status: "Validated"` → **`409`** otherwise. Moves the Payrun and all its Payslips to `"Paid"`.

### `POST /api/payruns/[id]/send-payslips`
Only valid once `status: "Paid"` → **`409`** otherwise ("Payslips can only be sent once the Payrun is marked Paid"). For each Payslip: renders its PDF, emails it to the employee.

**Response `200`:** `{ sent: number, results: [{ employeeId, email, messageId }] }` — `messageId` comes from the real SMTP transaction (`nodemailer`), not fabricated.

---

## Payslip endpoints

### `POST /api/payslips/list` — AG Grid
**Role:** Employee (scoped to own), HR Payroll User, HR Payroll Manager, Admin. HR Manager → `403`. Filterable: `employeeId`, `payrunId`, `status`.

### `GET /api/payslips/[id]`
Same role set. Employee → `403` unless it's their own.

### `GET /api/payslips/[id]/pdf`
Same role set as GET. Returns `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="payslip-<id>.pdf"`. Rendered via `@react-pdf/renderer`'s `renderToBuffer`, built with `React.createElement` rather than JSX (this project is plain `.js`, and this sidesteps needing the build toolchain to parse JSX in non-`.jsx` files).

### `DELETE /api/payslips/[id]`
HR Payroll Manager, Admin only. **`409`** if the parent Payrun is Paid.

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Payrun creation wizard, step 1** (scope: Structure + Period) | Nothing persisted yet — the frontend just holds this in local wizard state until step 2 |
| **Payrun creation wizard, step 2** (eligible-employee checkbox table) | `POST /api/payruns/eligible-employees` with step 1's period; "Create Payrun" button calls `POST /api/payruns` with both steps' data combined |
| **Payroll → Payruns** (List: Name, Period, count, Status, warning indicator) | `POST /api/payruns/list` |
| **Payrun detail** (Compute / Validate / Mark Paid / Send Payslips header actions) | `GET /api/payruns/[id]` to load; each button calls its matching action route; disable buttons whose required prior status isn't met (the API enforces this too, but the UI shouldn't offer a button that will just 409) |
| **Payroll → Payslips** (global list) | `POST /api/payslips/list` |
| **Payslip detail** (Salary Computation table + Print action) | `GET /api/payslips/[id]` for the header + `lines[]` breakdown table; "Print Payslip" links to `GET /api/payslips/[id]/pdf` |
| **Employee Form → "Payslips" area** (Employee's own self-view) | `POST /api/payslips/list` scoped by the API itself when the viewer is an EMPLOYEE |

No dedicated Payrun/Payslip hook names were listed in `Docs/hr-payroll-backend.md` beyond `usePayrunsGrid.js`/`usePayslipsGrid.js` — same AG Grid `IDatasource` pattern as every other phase.
