# PeoplePay360 — Role-Based Access Control (RBAC) Permission Matrix

Comprehensive matrix detailing all 5 system roles, module-by-module capabilities, and route-level access rules.

---

## 1. System Roles Overview

| Role Code | Role Name | Scope & Responsibilities |
| :--- | :--- | :--- |
| `EMPLOYEE` | **Employee** | Self-service portal user. Can clock in/out, view personal attendance, submit leave requests, view own contracts, and download personal payslips. |
| `HR_MANAGER` | **HR Manager** | Manages employee personnel records, contracts, working schedules, attendance corrections, and leave request approvals. |
| `HR_PAYROLL_USER` | **Payroll User** | Payroll specialist. Can create payrun batches, compute salary rules, inspect all payslips, and manage day-to-day HR workflows. |
| `HR_PAYROLL_MANAGER` | **Payroll Manager** | Full payroll supervisor. Can configure salary structures & rules, validate/lock payruns, delete payruns/payslips, and send email payslips. |
| `ADMIN` | **Administrator** | Superuser with complete unrestricted platform control, including employee onboarding and role provisioning. |

---

## 2. Complete Module Action Matrix

| Module | Action / Capability | EMPLOYEE | HR_MANAGER | HR_PAYROLL_USER | HR_PAYROLL_MANAGER | ADMIN |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Employees** | View Employee Directory (Kanban / List) | ✅ *(Read-only)* | ✅ | ✅ | ✅ | ✅ |
| | Create New Employee Account | ❌ | ❌ | ❌ | ❌ | ✅ *(Admin only)* |
| | Edit Employee Details | ❌ *(Self-only)* | ✅ | ✅ | ✅ | ✅ |
| | Delete Employee Record | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Provision / Change User Role | ❌ | ❌ | ❌ | ❌ | ✅ *(Admin only)* |
| **Contracts** | View Contracts List | ✅ *(Own only)* | ✅ | ✅ | ✅ | ✅ |
| | Create / Renew Contract | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Edit Contract Details & Wage | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Delete Contract | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Working Schedules** | View Working Schedules | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Create / Edit / Delete Schedule | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Attendance** | Check-In / Check-Out (Quick Widget) | ✅ *(Own)* | ✅ *(Own)* | ✅ *(Own)* | ✅ *(Own)* | ✅ *(Own)* |
| | View Attendance Records Table | ✅ *(Own only)* | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* |
| | Manual Attendance Punch / Edit | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Delete Attendance Record | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Time Off Requests** | View Time Off Requests List | ✅ *(Own only)* | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* |
| | Submit Leave Request | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Approve / Refuse Leave Request | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Edit / Cancel Request | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Delete Leave Request | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Time Off Allocations** | View Allocations & Balances | ✅ *(Own only)* | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* |
| | Create / Grant Allocation | ❌ | ✅ | ✅ | ✅ | ✅ |
| | Edit / Delete Allocation | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Time Off Types** | View Leave Types & Policies | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Create / Edit / Delete Leave Types | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Salary Structures** | View Salary Structures | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Create / Edit / Delete Structures | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Salary Rules** | View Salary Rules & Formulas | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Create / Edit / Delete Salary Rules | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Payruns** | View Payruns List & Details | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Create Payrun via Wizard | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Compute Salary Rules | ❌ | ❌ | ✅ | ✅ | ✅ |
| | Validate Draft Payrun | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Mark Paid & Finalize Payrun | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Email PDF Payslips in Batch | ❌ | ❌ | ❌ | ✅ | ✅ |
| | Delete Payrun | ❌ | ❌ | ❌ | ✅ *(Draft/Valid)* | ✅ *(Draft/Valid)* |
| **Payslips** | View Payslip & Computation Breakdown | ✅ *(Own only)* | ❌ | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* |
| | Download / Print Payslip PDF | ✅ *(Own only)* | ❌ | ✅ *(All)* | ✅ *(All)* | ✅ *(All)* |
| | Delete Individual Payslip | ❌ | ❌ | ❌ | ✅ *(Draft/Valid)* | ✅ *(Draft/Valid)* |
| **Dashboards** | Time Off Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Payroll Executive Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Route Navigation Access Matrix

| Route Path | Page Title | Allowed Roles |
| :--- | :--- | :--- |
| `/employees` | Employee Directory | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/contracts` | Contracts Management | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/attendance` | Attendance Tracker | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/time-off/dashboard` | Time Off Dashboard | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/time-off/requests` | Time Off Requests | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/time-off/allocations` | Leave Allocations | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/time-off/types` | Time Off Policy Types | `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/payroll/dashboard` | Payroll Dashboard | `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/payroll/payslips` | Employee Payslips | `EMPLOYEE`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/payroll/payruns` | Payruns Processing | `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/payroll/structures` | Salary Structures | `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |
| `/payroll/rules` | Salary Rules Chain | `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN` |

---

## 4. Key Security & Data Isolation Rules

1. **Automatic Self-Scoping for Employees**:
   Whenever a user with role `EMPLOYEE` queries `/attendance`, `/contracts`, `/time-off/requests`, `/time-off/allocations`, or `/payroll/payslips`, the backend repository layers automatically enforce `{ employeeId: session.employeeId }` in the Prisma query.
2. **Paid Payrun Immutability**:
   Once a Payrun status transitions to `Paid`, all nested payslips and the payrun itself are permanently locked. No compute, deletion, or modification is permitted.
3. **Admin-Only Account Creation & Role Assignment**:
   Only `ADMIN` can create new employee accounts or change employee roles.
4. **Live Deactivation Check**:
   Every API request executes `resolveActiveEmployee()` against the live database, ensuring deactivated employee accounts are revoked in real time.
