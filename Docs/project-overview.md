# PeoplePay360 — HR & Payroll Platform
### Project Overview (consolidated from problem statement PDF + Excalidraw screen-flow mockup — every note in both files folded in)

---

## 1. What this project is

An integrated HR & Payroll platform (hackathon project, working title "Odoo HR Payroll Hackathon" in the mockup, "PeoplePay360" in the brief) that goes beyond CRUD screens for employees, attendance, leave and payroll — the point is that these records are *connected*: a payroll run has to pull the right contract, the right schedule, the right attendance, and the right leave balance for the period it's processing, not just display isolated tables.

Stack is not prescribed — any language/framework/DB is allowed. The evaluation focus is business logic, data relationships, payroll computation, and end-to-end flow, not UI polish or platform choice.

---

## 2. Core entities and how they relate

- **Employee** — the central/master record. Links out to Contracts, Attendance, Time Off Requests, Allocations.
- **Contract** — an employee can have *multiple contracts over time* (history), but only **one active/"Running" contract per period** may be used by payroll. The system must prevent concurrent active contracts and select the contract matching the payroll period.
- **Working Schedule** — a weekly pattern (day, start time, end time, break); total weekly hours are **derived automatically**, not manually entered. Assigned to an Employee/Contract; used as expected working time by Attendance and Payroll.
- **Attendance** — check-in/check-out, worked hours, status, exceptions. Global or scoped to one employee. Manual corrections restricted to authorized users.
- **Time Off Type** — defines leave policy: unit (days/hours), whether allocation is required, approval workflow, payroll/work-entry integration. Exact validation rules are left to the team.
- **Allocation** — grants an employee a leave balance for a Time Off Type; requires approval before usable; tracks Allocated / Taken / Remaining / validity period.
- **Time Off Request** — consumes balance from the matching Allocation once approved (only for leave types that require allocation).
- **Salary Structure** — a named container (e.g. "Regular Salary", "Intern Salary", "Contractor") of Salary Rules, in an execution sequence, reused by every Payrun that selects it.
- **Salary Rule** — one computable component (Basic, Allowance, Deduction, Gross, Net) with Category, Sequence, Quantity, and a **computation method**:
  - **Fixed Amount** — exact value (e.g. Meal Allowance = 2,000)
  - **Percentage of Wage** — of a selected base such as Contract Wage / Basic / Gross (e.g. HRA = 50% × Basic)
  - **Python Code / Formula** — for anything the first two can't express (attendance-based pay, overtime, unpaid-leave deductions, cross-rule formulas). The mockup's own example expression is `result = categories['BASIC']` — rules reference each other by **category code**, which is why category + sequence both matter.
- **Payrun** — a batch representing payroll processing for one period; groups the Payslips it generates.
- **Payslip** — one employee's computed salary for that Payrun/period: Basic, Allowances, Deductions, Gross, Net, Worked Days — computed from *that employee's applicable contract* + *the Payrun's assigned Salary Structure*.

---

## 3. User roles & permissions

### As specified in the PDF (the 5 roles to actually build against)

| Role | Access |
|---|---|
| **Employee** | View own profile, attendance, leave balances; create Attendance entries and Time Off Requests. No HR/payroll admin. |
| **HR Manager** | Full CRUD on Employees, Attendance, Contracts, Working Schedules, Time Off; approve/refuse Time Off Requests. No payroll access. |
| **HR Payroll User** | Everything HR Manager has, plus Create/Read/Update on Payruns & Payslips; read-only on Salary Structures/Rules. |
| **HR Payroll Manager** | Everything HR Payroll User has, plus full CRUD on Payruns, Payslips, Salary Structures, Salary Rules. |
| **Admin** | Full access to every module/model, user management, role assignment, permission configuration. |

### Screen 0 — Login & User Access (mockup detail not in the PDF)

- Admin creates User accounts from a **User Management** screen and links each account to an Employee record.
- User list/form fields: **User, Employee, Work Email, Role, Status (Active/Inactive)**.
- Roles must be assigned at account-creation time; a user **must not be able to assign or elevate their own role**.
- After sign-in, only the modules/actions the assigned role permits should be visible.
- Password reset, invitations, and SSO are explicitly flagged as **optional enhancements**, not required scope.

> ⚠️ **Discrepancy worth resolving as a team**: the mockup's sample User list shows more granular role *labels* than the PDF's 5 — e.g. `Payroll User`, `Time Off Admin`, `Time Off User`, `Payroll Admin`, `Hr Manager`, `Hr Payroll User`, `Admin`, `Hr Payroll Admin`. Treat these as illustrative demo data, not a second role spec — build to the PDF's 5-role matrix unless your team deliberately wants finer-grained roles, in which case document the mapping explicitly so grading against the PDF isn't ambiguous.

---

## 4. Screen-by-screen flow and field-level detail (from the Excalidraw mockup)

### 0) Login & User Access
Sign-in screen (Work Email + Password, "Forgot password?") → Admin's User Management (list + Create/Edit User form: User\*, Employee\*, Work Email\*, Role(s)\*, Account Status) → role-gated app access.
- *Note: "User accounts are separate from Employee records, but should be linked to an employee for access and ownership."*

### 1) Employee & Contract Flow
- **Employees** — Kanban (default, cards grouped by e.g. department, showing avatar/initials, name, job position) and List view (columns: Employee, Work Email, Job Position, Department, Status). Both open the same **Employee Form**.
  - *Useful note: Kanban is good for browsing; clicking a card should open the same Employee Form used everywhere else.*
  - *Useful note: the list view is the main entry point for opening a specific employee record quickly.*
- **Employee Form** — tabs for **Work Information** (Manager, Work Location, Department, Job Position, Working Schedule, Status, Company) and **Private Information** (Work Email, etc.); smart buttons with live counts (e.g. "Time Off 3", "Contracts 2", "Attendance 14") that open each related list **filtered to that employee**.
  - *Useful note: smart buttons should open related Contracts, Attendance and Time Off records filtered for the current employee.*
- **Contracts** — List columns: Contract (ref no. e.g. `CON/2026/0042`), Employee, Start, End, Wage/Month, Status (`Running` / `Expired`). Form fields: Employee, Department, Start Date, Job Position, End Date, Wage/Month, Status, Working Schedule, Salary Structure, Notes/Structure Type.
  - *Useful note: retain contract history, but make the active Running contract obvious because payroll depends on it.*
  - *Useful note: one employee should not have multiple Running contracts for the same period.*
- **Working Schedule** — List columns: Schedule Name, Days/Week, Hours/Week, Company, Status. Form: a weekly table (Day, Start Time, End Time, Break, Hours per day) with an **Add Day** action and an auto-computed **Total Weekly Hours** footer. Sample schedules shown: "40 Hours/Week" (5 days), "Night Shift", "Retail Weekend", "Flexible Hybrid" (37.5h), "Part-time 20h" (Inactive).
  - *WORKING SCHEDULE NOTE: required views are List and Form; List is for finding/opening schedules, Form defines one schedule. The schedule should capture the weekly pattern (days, working time, total weekly hours) — breaks/variable shifts can be handled however the team prefers. Employee/Contract can reference a schedule; Attendance and Payroll may use it as the expected working time.*

### 2) Attendance Flow
- Reachable globally (**Attendance** in the top nav) or from an employee's smart button — opening it from an employee scopes the list to that employee only.
- List columns: Employee, Check In, Check Out, Worked Hours, Status (Present / Absent, with Overtime shown separately on the form, e.g. "0.50 hrs").
- Form fields: Employee, Department, Check In (date+time), Manager, Check Out, Status, Worked Hours, Overtime, Notes (*"System-generated from check in/out or manually corrected by an authorized user."*)
- A **quick-action widget/popup** on top of the app: clicking the attendance icon opens a Check-In/Check-Out popup.
  - **ATTENDANCE QUICK ACTION NOTE**: if there's no active session, show *Check In*; if already checked in, show *Check Out* with elapsed time displayed live; after a successful Check In, the status indicator turns green.
  - *Useful note: list view should help users review raw check-in/check-out data and identify missing punches quickly.*
  - *Useful note: worked hours and overtime should be easy to read because they may later influence payroll or reporting.*
  - *"Employees can mark attendance from the quick widget and review records from the Attendance module."*

### 3) Time Off Flow
- Everything lives under a single **Time Off ▼** nav dropdown with four sub-items: **Dashboard, Time offs (Requests), Time off Types, Allocations** — *"Do not add separate page buttons for them."* (Note: the Time Off area gets its own mini-dashboard sub-item, distinct from the main Payroll Dashboard — not mentioned in the PDF.)
- **Requests** — List columns: Employee, Type, Start, End, Duration, Status, with inline Approve/Refuse actions. Form fields: Employee, Time Off Type, Start Date, End Date, Approver, Allocation Used (link to the specific allocation consumed), Reason/Description, Status, Approve/Refuse.
  - *Useful note: request status should show the approval lifecycle clearly.*
  - *Useful note: if the selected type requires allocation, the request should clearly show which balance was consumed.*
- **Allocations** — List columns: Employee, Type, Allocated, Taken, Remaining, Status. Form fields: Employee, Time Off Type, Allocated, Taken, Remaining, Status, Approver, Validity (e.g. "2026 Annual Balance"), Description (e.g. "Annual leave balance granted at start of policy year.").
  - *Useful note: the list should expose the balance math at a glance — Allocated, Taken and Remaining.*
  - *Useful note: approved allocation is what creates available leave balance for the employee.*
- **Time Off Types** — List columns: Type, Unit, Allocation (Required/No), Approval, Status. Form fields: Type Name, Approval (Manager/Officer), Unit (Days/Hours), a Payroll/Work-Entry field (e.g. "Leave Work Entry" — this is the payroll-integration hook), Requires Allocation (Yes/No), Display Color, Active. Sample types: **Paid Time Off** (Days, allocation required, Manager approval, Blue), **Sick Leave** (Days, no allocation required, Manager approval), **Comp Off** (Hours, allocation required, Officer approval).
  - Configuration note: *"Standard annual leave. Balance comes from approved allocations."*
  - *Useful note: this list defines policy rules, not employee transactions.*
  - *Useful note: Time Off Type drives approval behavior and whether a request needs an allocation.*

### 4) Payroll — Payrun & Payslips
- **Payroll ▼** nav dropdown: **Dashboard, Payruns, Payslips, Structures, Rules.**
- **Payrun creation wizard (two steps, doesn't create anything until the end):**
  1. **Scope step** — Pay Structure, Period (date range picker, e.g. Sep 1 → Sep 30). *Participant note: "this popup collects the payrun scope only. Continue should not create the Payrun yet."*
  2. **Employee-selection step** — a checkbox table of eligible employees (columns: select, Employee, Working Hours, Start Date, Wage) with Continue/Discard, ending in **Create Payrun**. *Participant note: "user selects one or more eligible employees, then clicks Create Payrun. The created Payrun should contain only the selected employees."*
- **Payrun list** — columns: Name (e.g. "February 2026"), Period, employee count, Status (Draft / Validated / Paid), and a warning indicator ("1 warning", "2 warnings", "No warnings").
  - *Useful note: each Payrun represents one payroll period and groups the payslips generated for that period.*
- **Payrun detail** — header actions **COMPUTE → VALIDATE → MARK PAID → SEND PAYSLIPS**; shows Name, Salary Structure, Period, Status, and a table of its Payslips (Employee, Warning, Period, Basic, Gross, Net, Structure, Status).
  - *Useful note: warnings such as missing account data or duplicate payslips should be visible before payroll is finalized.* Sample warning tags seen: "A/C missing", "Duplicate".
- **Payslips (global list)** — same column set as above, reachable independently of a specific Payrun.
  - *Useful note: selecting any payslip opens the detailed salary computation and PDF action for that employee.*
- **Payslip detail** — header: Employee, Salary Structure, Pay Run, Period, Worked Days; actions **COMPUTE, MARK PAID, PRINT PAYSLIP**; a **Salary Computation** table: Rule, Category, Amount, Code — i.e. the literal rule-by-rule breakdown driving the payslip.
  - *Useful note: the Print action generates the employee payslip as PDF; that PDF can be sent from the parent Payrun.*

### 5) Payroll Configuration — Salary Structures & Salary Rules
- **Salary Structures** — List columns: Structure Name, Rules (count), Employees (count), Active. Form: Structure Name, Active, and the ordered list of included rules. Sample structures: **Regular Salary** (12 rules, 42 employees), **Intern Salary** (8 rules, 6 employees), **Contractor** (6 rules, 9 employees) — i.e. different employee populations can run different structures.
  - *Useful note: the Salary Structure selected on a Payrun determines which set of salary rules will calculate each payslip.*
- **Salary Rules** — List columns: Rule Name, Code, Category, Structure, Sequence. Form: Rule Name, Code, Salary Structure, Computation (Fixed Amount / Percentage of Wage / Python Code), Category, Sequence, Quantity.
  - *Useful note: rule order matters — keep sequence visible so participants understand the calculation order.*
  - *Useful note: the List view should expose name, code, category, structure and sequence — the fields needed to understand a rule quickly.*
  - *Useful note: a Salary Rule needs a clear computation method and category because these drive the lines shown on the final payslip.*
  - **Computation Note (verbatim from the mockup):**
    - *Fixed Amount* — uses the exact value entered, e.g. Meal Allowance = 2,000.
    - *Percentage* — of a selected base (Contract Wage / Basic / Gross), e.g. HRA = 20% × Basic Salary.
    - *Python Code / Formula* — for advanced cases: attendance-based salary, overtime, unpaid-leave deductions, or formulas spanning multiple rules.
  - **Worked example — the full "Regular Salary" rule chain, in sequence order** (useful as a reference implementation):
    | Seq | Rule | Code | Category | Computation |
    |---|---|---|---|---|
    | 1 | Basic Salary | BASIC | Basic | Percentage of Wage |
    | 10 | House Rent Allowance | HRA | Allowance | 50% of Basic |
    | 20 | Standard Allowance | STD | Allowance | — |
    | 30 | Performance Bonus | BONUS | Allowance | — |
    | 40 | Leave Travel Allowance | LTA | Allowance | — |
    | 50 | Fixed Allowance | FIX | Allowance | Fixed Amount |
    | 60 | Gross Salary | GROSS | Gross | Formula, e.g. `result = categories['BASIC'] + ...` |
    | 70 | LWF Fund | LWF | Deduction | — |
    | 80 | Provident Fund | PF | Deduction | — |
    | 90 | ESIC | ESIC | Deduction | — |
    | 100 | Professional Tax | PT | Deduction | — |
    | 110 | Net Salary | NET | Net | Formula (Gross − Deductions) |

    Note that **Gross is sequenced (60) before the deduction rules (70–100)**, and **Net comes last (110)** — deductions are computed off Gross, not off Basic directly. This is the intended dependency order, not an arbitrary numbering.

### 6) Payroll Dashboard
- Filters: **Period, Department, Employee Type, Company.**
- KPI cards (each with a small comparison line): **Total Net Salary Paid** (+8.5% vs previous month), **Payslips Generated** (e.g. "142 paid, 6 pending"), **Average Salary/Employee** ("Based on current payrun"), **Approved Time Off Days** ("Across selected period"), **Attendance Health %** ("Present/reviewed records").
- Charts: **Salary Cost by Department** (source: Payslips + Employee Department), **Monthly Net Salary Trend** (source: historical Payslips/Payruns), **Payslip Status & Payroll Alerts** — a status split (Paid/Done/Pending/Warning) plus a live alerts feed, e.g. "2 employees missing bank account", "1 duplicate payslip warning", "4 drafts still not validated", "3 contracts expiring this month" (source: Payrun + Payslip validation).
- Overview panels:
  - **Attendance Overview** (source: Attendance) — Present / Late / Absent / Overtime counts, plus "Missing check-outs: 5", "Manual attendance edits: 7", "Attendance coverage: 94%".
  - **Time Off Overview** (source: Time Off Requests + Allocations) — per type: Approved Days, Pending, Remaining Balance (e.g. Paid Time Off: 24 approved / 3 pending / 118 days remaining; Sick Leave, Comp Off rows likewise).
  - **Department Overview** (source: Employee + Contract + Payslip totals) — Department, Headcount, Monthly Salary (e.g. IT: 18 headcount / ₹4.2L; Sales: 22 / ₹5.7L; HR: 8 / ₹1.9L; Support: 14 / ₹3.1L).
- **"Models to Aggregate"** callout (this is flagged as *"the actual challenge behind the dashboard"*):
  - Employees/Departments → headcount, ownership, grouping
  - Contracts → wage, schedule, active employees
  - Payruns/Payslips → salary totals, paid vs pending, trend data
  - Attendance → presence, absences, late entries, overtime
  - Time Off Requests/Allocations → leave taken and leave balances
- Dashboard challenge statement (verbatim): *"combine Payroll with HR data from multiple models and present useful insights with cards, charts, and summaries."* All figures must come from real records for the selected filters, not hardcoded values.

---

## 5. Business rules that must actually be enforced (not just displayed)

1. An employee may have several contracts historically, but payroll for a given period must resolve to exactly one applicable ("Running") contract — no concurrent active contracts.
2. A schedule's total weekly hours is a computed field, derived from the day/start/end/break entries, not user-entered.
3. Leave balance math: Allocation (once approved) grants balance → approved Request consumes balance from the matching Time Off Type's allocation. Unapproved allocations/requests don't affect balance.
4. Payrun creation only persists a batch after Step 2 (employee selection) is confirmed — Step 1 alone creates nothing.
5. Payslip computation must pull the contract valid for *that specific payroll period*, combined with the Salary Structure chosen on the Payrun.
6. Salary Rules execute in sequence; later rules can depend on earlier ones by category code (e.g. Gross referencing `categories['BASIC']`, deductions referencing Gross, Net referencing Gross minus deductions).
7. Warnings (missing bank info, duplicate payslips, unvalidated drafts, contracts expiring) must surface to the user before/at finalization, not silently.
8. Payroll status has a lifecycle: Draft → Compute → Validate → Mark Paid, and paid/finalized runs must remain as historical records.
9. Dashboard figures must be computed from real underlying records, filtered live by Period/Department/Employee Type/Company.
10. A user account is a distinct record from an Employee record but must be linked to one; users cannot self-assign or self-elevate roles.
11. Time Off navigation (Requests, Allocations, Types, and its own mini-dashboard) must live only under the Time Off ▼ menu — don't scatter these as separate top-level pages.

---

## 6. What's genuinely open / left to the team

Both source files say explicitly that some things are intentionally unspecified. Decisions the team needs to make and document:

- Exact Time Off Type policy rules and validations beyond unit + allocation-required + approval role + the "Leave Work Entry" payroll-integration flag.
- Shift/flexible-time handling in Working Schedules — only the basic weekly day/start/end/break pattern is mandated; the mockup's "Night Shift"/"Retail Weekend"/"Flexible Hybrid" schedules are demo flavor, not a spec.
- Attendance correction workflow specifics (who exactly is "authorized," what audit trail is kept).
- The formula/scripting sandboxing approach for the "Python Code / Formula" salary rule method — the mockup only shows one illustrative expression (`result = categories['BASIC']`).
- Whether/how Employee-linked user accounts handle password reset, invitations, or SSO (explicitly out of required scope).
- Duplicate-payslip and missing-info detection logic (rules for what counts as a "warning").
- Exact KPI formulas on the dashboard (e.g. what counts toward "Attendance Health %" or "Attendance coverage").
- Whether to follow the PDF's 5-role matrix strictly or adopt the mockup's more granular role labels (see the discrepancy flagged in §3) — pick one and document the mapping.

---

## 7. Deliverables (from the PDF)

- A fully functional platform populated with representative employee, contract, attendance, time-off, salary and payroll data (not mockups/static screens).
- A 5-minute live demo covering two end-to-end scenarios: (1) employee → payslip, and (2) leave allocation → request.
- A short written roadmap of what the team would prioritize next with more time.
- Salary Rules must actually drive Payslip output — configuration screens need to be functionally wired, not decorative.
- Payslip PDF generation + bulk email delivery from the Payrun must work.

---

## 8. Reference

- Original mockup: https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex
