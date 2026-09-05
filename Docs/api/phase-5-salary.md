# Phase 5 API Contract — Salary Structure & Salary Rules

Status: **implemented & verified** against the running dev server + local Postgres DB. Source: `Docs/hr-payroll-backend.md` Phase 5.

All endpoints require a valid session (`withAuth()`) → `401` if missing/inactive. Every endpoint in this phase is additionally role-gated — there is no "any authenticated role" case here, unlike earlier phases.

**Role matrix for this phase (from the permission matrix):**

| Role | Access |
|---|---|
| Employee | None |
| HR Manager | **None** — despite having full CRUD on Contracts, which reference a Salary Structure (see the flagged friction below) |
| HR Payroll User | **Read-only** |
| HR Payroll Manager | Full CRUD |
| Admin | Full CRUD |

---

## Salary Structure endpoints

### `POST /api/salary-structures` — create
**Role:** HR Payroll Manager, Admin only.

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ required |
| `active` | boolean | optional, defaults `true` |

**Response `201`:** `{ id, name, active, createdAt, updatedAt }`.

### `POST /api/salary-structures/list` — AG Grid
**Role:** HR Payroll User, HR Payroll Manager, Admin (HR Manager → `403`).
Response rows include `ruleCount` and `employeeCount` (count of Contracts using this structure) — matches the mockup's List columns. Filterable: `name` (contains), `active` (equals).

### `GET /api/salary-structures/options` — dropdown source
**Role:** HR Payroll User, HR Payroll Manager, Admin. `[{id, label}]`, active structures only.

### `GET /api/salary-structures/[id]` — includes the ordered `rules[]`.
### `PATCH`/`DELETE /api/salary-structures/[id]` — HR Payroll Manager, Admin only.

---

## Salary Rule endpoints

### `POST /api/salary-rules` — create
**Role:** HR Payroll Manager, Admin only.

| Field | Type | Required | Notes |
|---|---|---|---|
| `structureId` | string | ✅ required | |
| `name` | string | ✅ required | |
| `code` | string | ✅ required | unique per structure |
| `category` | `"Basic"\|"Allowance"\|"Gross"\|"Deduction"\|"Net"` | ✅ required | |
| `sequence` | integer | ✅ required | execution order |
| `computationMethod` | `"Fixed"\|"Percentage"\|"Formula"` | ✅ required | see below |
| `fixedAmount` | number | conditional | **required if `computationMethod = "Fixed"`** |
| `percentageBase` | `"ContractWage"\|"Basic"\|"Gross"` | conditional | **required if `computationMethod = "Percentage"`** |
| `percentageValue` | number | conditional | **required if `computationMethod = "Percentage"`** (a percentage, e.g. `50` = 50%) |
| `formula` | string | conditional | **required if `computationMethod = "Formula"`** — an `expr-eval` expression, e.g. `"categories.BASIC + categories.HRA"` |

**Response `201`:** the full rule. **`400`** if the fields required for the given `computationMethod` are missing.

⚠️ Note on `PATCH`: if you change `computationMethod` in the same request, you must also supply that method's required fields in that request — the validator doesn't look at the rule's *existing* stored values, only the current request body.

### `POST /api/salary-rules/list` — AG Grid
**Role:** HR Payroll User, HR Payroll Manager, Admin. **Defaults to `sequence` ascending** if no `sortModel` is given — rule order is the whole point of this list. Filterable: `structureId`, `category` (both equals).

### `GET`/`PATCH`/`DELETE /api/salary-rules/[id]` — same role split as above (read vs write).

---

## The compute engine (`lib/payroll/computeSalaryRules.js`) — not an HTTP endpoint yet

Consumed directly by Phase 6's Payrun compute step, not exposed as its own route. Documented here since Phase 6 depends on it:

```js
computeSalaryRules(rules, { wage, workedDays })
// -> { lines: [{code, name, category, sequence, amount}, ...], categories: {CODE: amount}, basic, gross, net }
```

- Rules are sorted by `sequence` internally regardless of the order passed in.
- `Fixed` → `fixedAmount`. `Percentage` → `(base * percentageValue) / 100`, where `base` resolves via the `percentageBase` convention (`ContractWage` → `wage`, `Basic` → `categories.BASIC`, `Gross` → `categories.GROSS`). `Formula` → evaluated via `expr-eval` with `{ categories, wage, workedDays }` as the only exposed variables — no function calls, no `require`, no access to anything outside that object.
- `basic`/`gross`/`net` in the return value are the amount of the **last** rule whose `category` matches `Basic`/`Gross`/`Net` respectively (there's normally exactly one of each).

---

## Frontend pages this phase's APIs back

| Page / Screen | Uses |
|---|---|
| **Payroll → Structures** (List: Structure Name, Rules, Employees, Active) | `POST /api/salary-structures/list` |
| **Salary Structure Form** (manages included rules + sequence) | `GET /api/salary-structures/[id]` (includes ordered `rules[]`), `PATCH /api/salary-structures/[id]` for the structure itself; rule rows are managed via the Salary Rule endpoints below |
| **Payroll → Rules** (List: Name, Code, Category, Structure, Sequence) | `POST /api/salary-rules/list`, default-sorted by sequence |
| **Salary Rule Form** | `POST /api/salary-rules` / `PATCH /api/salary-rules/[id]` — the form should show/hide `fixedAmount` vs `percentageBase`+`percentageValue` vs `formula` based on the selected `computationMethod`, mirroring the API's own conditional requirements |
| **Contract Form → Salary Structure field** (dropdown) | `GET /api/salary-structures/options` — **note:** this endpoint 403s for HR Manager per the matrix; if HR Manager needs to set a Contract's salary structure, the Contract Form will need a fallback for that role (flagged above, not resolved) |

No hook file yet for this phase's grids in the plan's hook list (`useSalaryStructuresGrid.js`, `useSalaryRulesGrid.js` are named in `Docs/hr-payroll-backend.md`) — same AG Grid `IDatasource` wrapper pattern as every other phase.

---

## Where to call which API — trigger-by-trigger

Every screen in this phase is gated to HR Payroll User/Manager/Admin (read varies, write is Manager/Admin only) — the whole nav section should be hidden for Employee and HR Manager, not just the buttons inside it.

### Salary Structures
| Trigger | Call | When | Then |
|---|---|---|---|
| Payroll → Structures List mounts / grid interaction | `POST /api/salary-structures/list` | for HR Payroll User/Manager/Admin only — hide the nav entry for HR Manager/Employee rather than letting them hit a `403` | render Name/Rules/Employees/Active columns straight from the row (`ruleCount`, `employeeCount` are server-computed) |
| Structure Form mounts (new) | none | — | just the Name + Active fields, no data to load |
| Structure Form mounts (edit) | `GET /api/salary-structures/[id]` | on navigation in | populates the structure fields **and** the ordered `rules[]` table shown inside the same form |
| HR Payroll Manager/Admin clicks **Save** on the structure itself | `PATCH /api/salary-structures/[id]` (edit) or the create happens via `POST /api/salary-structures` first, before rules can be added | on submit | rule rows are saved independently via the Salary Rule endpoints below, not as part of this call |
| HR Payroll Manager/Admin clicks **Delete** | `DELETE /api/salary-structures/[id]` | after confirm | `204` → remove from list |
| Contract Form's Salary Structure dropdown mounts | `GET /api/salary-structures/options` | on mount | **HR Manager gets `403` here** per the matrix — if HR Manager can open a Contract Form at all, this dropdown needs a fallback (disabled with an explanatory tooltip, or omit the field for that role) until the permission gap itself is resolved |

### Salary Rules (managed from inside a Structure's Form)
| Trigger | Call | When | Then |
|---|---|---|---|
| Structure Form's rules table renders | `POST /api/salary-rules/list` with `filterModel.structureId` set to the open structure | on the same navigation-in as the Structure load, right after `GET /api/salary-structures/[id]` (or combine — that response already includes `rules[]`, so a separate list call is usually redundant here) | default-sorted by `sequence` if no explicit sort is applied |
| Payroll → Rules List (the standalone global list, not scoped to one structure) | `POST /api/salary-rules/list` | on mount / grid interaction | shows Structure as a column since rows span structures |
| User clicks **Add Rule** / opens a rule row | `GET /api/salary-rules/[id]` (edit only) | on navigation in | show/hide `fixedAmount` vs `percentageBase`+`percentageValue` vs `formula` based on the loaded `computationMethod` |
| User changes the **Computation Method** dropdown mid-edit | none | on change, client-side only | swap which fields are visible; remember that on **Save**, all of the newly-selected method's required fields must be included in the same request — the API only looks at the current request body, not what's already stored |
| User clicks **Save** (new or edit) | `POST /api/salary-rules` / `PATCH /api/salary-rules/[id]` | on submit | `400` → map to whichever conditional field is missing for the selected method |
| User clicks **Delete** on a rule | `DELETE /api/salary-rules/[id]` | after confirm | `204` → remove from the structure's rule table |

### The compute engine
Not called directly from the frontend at all in this phase — it's consumed server-side by Phase 6's `POST /api/payruns/[id]/compute`. No UI trigger here.
