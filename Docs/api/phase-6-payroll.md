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

---

## Where to call which API — trigger-by-trigger

### Payrun creation wizard
| Trigger | Call | When | Then |
|---|---|---|---|
| Wizard step 1 (Structure + Period) — user clicks **Continue** | none | on click | just advances local wizard state; nothing is persisted until the final "Create Payrun" click on step 2 |
| Wizard step 2 mounts (arriving from step 1) | `POST /api/payruns/eligible-employees` with step 1's `periodStart`/`periodEnd` | on entering step 2 | populate the checkbox table (name, workingHours, startDate, wage per row) |
| User checks/unchecks rows, then clicks **Create Payrun** | `POST /api/payruns` with `name`, `structureId`, `periodStart`, `periodEnd`, and `employeeIds` = the checked rows | on final submit only — this is the one call in the whole wizard that actually persists anything | `201` → navigate to the new Payrun's detail page. It's created in `Draft` with un-computed Payslips |

### Payrun list + detail
| Trigger | Call | When | Then |
|---|---|---|---|
| Payroll → Payruns List mounts / grid interaction | `POST /api/payruns/list` | via `usePayrunsGrid.js` | render Name/Period/`payslipCount`/Status; a warning indicator needs per-row warning data the list response doesn't carry yet — compute it lazily per row on hover/expand, or defer the indicator until the list response adds it |
| User clicks a Payrun row | `GET /api/payruns/[id]` | on navigation in | populates header + the full `payslips[]` (each with `warnings[]`) + `structure` |
| User clicks **Compute** | `POST /api/payruns/[id]/compute` | on click — disable this button once `status` is `Paid` (matches the API's own `409`) | `200` → refresh the whole detail view from the response; warnings shown per-payslip are a full replace, not additive, so just re-render from what came back |
| User clicks **Validate** | `POST /api/payruns/[id]/validate` | on click — only enable while `status === "Draft"` | `200` → status flips to Validated, re-render |
| User clicks **Mark Paid** | `POST /api/payruns/[id]/mark-paid` | on click — only enable while `status === "Validated"` | `200` → status flips to Paid; from this point, hide/disable Compute/Validate/Delete for every role including Admin |
| User clicks **Send Payslips** | `POST /api/payruns/[id]/send-payslips` | on click — only enable once `status === "Paid"` | `200` with `{sent, results[]}` — show a per-employee sent/failed summary from `results`, don't just show a generic "done" toast |
| User clicks **Delete** on a Payrun | `DELETE /api/payruns/[id]` | after confirm — hide this control once `status === "Paid"`, and never show it to HR Payroll User | `204` → back to list. **`409`** if somehow reached on a Paid Payrun anyway |

### Payslips
| Trigger | Call | When | Then |
|---|---|---|---|
| Payroll → Payslips global list mounts / grid interaction | `POST /api/payslips/list` | via `usePayslipsGrid.js` — EMPLOYEE role forced to their own rows automatically | render rows; HR Manager should never reach this screen (`403`) — hide the nav entry for that role |
| Employee Form's "Payslips" self-view section mounts | `POST /api/payslips/list` | same call as above — the server-side EMPLOYEE scoping is what makes this "just their own" without any special client filtering | render as a read-only list |
| User clicks a Payslip row | `GET /api/payslips/[id]` | on navigation in | populate header + `lines[]` breakdown table (Basic/Allowances/Deductions/Gross/Net) |
| User clicks **Print Payslip** | `GET /api/payslips/[id]/pdf` | on click — link/open in a new tab rather than `fetch`, since the response is a binary PDF with `Content-Disposition: attachment` | browser handles the download natively |
| HR Payroll Manager/Admin clicks **Delete** on a Payslip | `DELETE /api/payslips/[id]` | after confirm — hide for HR Payroll User (no delete grant) and once the parent Payrun is Paid | `204` → remove from list. **`409`** if the parent Payrun turned out to be Paid |
