# PeoplePay360 — Frontend Architectural Rules & UI Guidelines

This document defines the visual design system, directory architecture, modular component guidelines, and implementation rules for the **PeoplePay360 HR & Payroll Platform**.

---

## 1. Visual Design System & Aesthetic Standards (`globals.css`)

### 🎨 Theme & Palette (Artistic, Modern, Professional)
- **Primary / Brand**: Deep Indigo (`--primary: #4F46E5`, `--primary-hover: #4338CA`, `--primary-light: #EEF2FF`)
- **Success / Present / Approved**: Mint Emerald (`--success: #10B981`, `--success-light: #ECFDF5`, `--success-border: #A7F3D0`)
- **Warning / Pending / Expiry**: Warm Amber (`--warning: #F59E0B`, `--warning-light: #FFFBEB`, `--warning-border: #FDE68A`)
- **Danger / Refused / Expired**: Crimson Red (`--danger: #EF4444`, `--danger-light: #FEF2F2`, `--danger-border: #FECACA`)
- **Info / General**: Vivid Blue (`--info: #3B82F6`, `--info-light: #EFF6FF`, `--info-border: #BFDBFE`)
- **Neutral Scale**:
  - Light Mode: Background (`#F8FAFC`), Surface (`#FFFFFF`), Surface Border (`#E2E8F0`), Text (`#0F172A`)
  - Dark Mode: Background (`#0F172A`), Surface (`#1E293B`), Surface Border (`#334155`), Text (`#F8FAFC`)

### 📐 Utility Classes & Component Styling
- **Card Containers**: `.card-flat` (static clean surface), `.card-hover` (subtle hover elevation & primary border accent), `.glass-panel` (translucent backdrop blur `12px`).
- **Status Badges**: `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-primary`.
- **Form Inputs**: `.form-input` with standard focus ring (`0 0 0 3px var(--primary-glow)`).
- **Custom Scrollbar**: Minimalist 6px curved thumb (`::-webkit-scrollbar`).
- **Animations**: `.animate-fade-in` smooth cubic-bezier drop-ins.

---

## 2. Professional Modular Folder Structure

```
peoplepay360-frontend/
├── app/                        # Next.js App Router (Pages, Layouts, Routes)
│   ├── (auth)/                 # Auth route group (Login)
│   │   └── login/
│   ├── (dashboard)/            # Authenticated App Shell layout
│   │   ├── employees/          # Employee & User Access (Kanban, List, Form)
│   │   ├── contracts/          # Contracts & Working Schedules
│   │   ├── attendance/         # Attendance list & detail
│   │   ├── time-off/           # Requests, Allocations, Types, Mini-Dashboard
│   │   ├── payroll/            # Payruns, Payslips, Structures, Rules, Dashboard
│   │   └── page.js             # Main Payroll/HR Dashboard Overview
│   ├── api/                    # NextAuth & API route handlers (if any proxy needed)
│   ├── globals.css             # Global design tokens, themes, utilities
│   └── layout.js               # Root layout (Providers, Fonts)
├── components/                 # Reusable Modular UI Components
│   ├── ui/                     # Primitives (Button, Input, Modal, Badge, Card, Tabs, Table)
│   ├── layout/                 # App Shell (Sidebar, Header, QuickAttendanceWidget, UserMenu)
│   ├── employees/              # Employee Kanban, List, Form, SmartButtons, RoleBadge
│   ├── contracts/              # Contract Form, StatusBadge, SchedulePicker
│   ├── schedules/              # WorkingSchedule Form, DayHoursTable, TotalCalculator
│   ├── attendance/             # AttendanceTable, QuickCheckInOutModal, OvertimeBadge
│   ├── time-off/               # RequestModal, AllocationCard, PolicyTypeForm, MiniDashboard
│   ├── payroll/                # PayrunWizard, PayslipDetail, SalaryRuleChainTable, PDFViewer
│   └── dashboard/              # Aggregate KPICards, DeptChart, AlertFeed, TrendChart
├── hooks/                      # Custom Modular React Hooks
│   ├── useAuthSession.js       # User identity, role check, sign-in/out
│   ├── useEmployees.js         # Employee list fetching, options, CRUD operations
│   ├── useContracts.js         # Contract list, active contract validation
│   ├── useSchedules.js         # Working schedule calculator & CRUD
│   ├── useAttendance.js        # Check-in/out quick action, list, live timer
│   ├── useTimeOff.js           # Requests, Allocations, Types, Balance math
│   ├── usePayroll.js           # Payrun wizard, Payslip compute, Rule chain, PDF print
│   └── useDashboard.js         # Multi-model aggregate calculations & filters
├── lib/                        # Services & Utility Functions
│   ├── api-client.js           # Unified fetch client with global 401/403 interceptor
│   ├── rbac.js                 # Role permission matrix & page access guards
│   ├── formatters.js           # Currency (INR), Date, Worked Hours, Status formatters
│   └── pdf-generator.js        # Client-side Payslip PDF generator / printer
└── RULES.md                    # This Architecture & UI Design Rulebook
```

---

## 3. Modular Hook & Component Guidelines

1. **Strict Separation of Concerns**:
   - **Page Components (`app/**/page.js`)**: Pure layout containers, orchestrating components and connecting custom hooks. Zero inline inline state heavy logic.
   - **Custom Hooks (`hooks/*.js`)**: Own data fetching, validation, loading states, error states, and mutations.
   - **UI Primitives (`components/ui/*.js`)**: Pure presentational components with consistent styling tokens.

2. **Unified Axios API Fetcher (`lib/api-client.js`)**:
   - Uses `axios.create()` with `baseURL: process.env.NEXT_PUBLIC_API_URL` and `withCredentials: true`.
   - Automatically handles session credentials & cookies.
   - Response Interceptor catches `401 Unauthorized` → redirects immediately to `/login`.
   - Catches `403 Forbidden` → displays user-friendly role access warning.
   - Parses structured `400` / `409` error messages for inline form field validation.

3. **Role-Based Access Control (RBAC) & Navigation**:
   - **Roles**: `EMPLOYEE`, `HR_MANAGER`, `HR_PAYROLL_USER`, `HR_PAYROLL_MANAGER`, `ADMIN`.
   - **Role Guard Hook (`useAuthSession.js`)**: Exposes `hasPermission(module, action)` and `role`.
   - **Navigation**: Sidebar hides unauthorized dropdowns or options dynamically based on session role.
   - **Self-Service Protection**: Employees can only view/edit their own record; `Role` select field is hidden/disabled when editing self or non-admin.

---

## 4. Phase-by-Phase Feature & UI Rules

### Phase 1: Employee & Login (Merged Entity)
- **Login**: Modern split/card screen, work email & password, NextAuth credential provider integration.
- **Employee Navigation**: Kanban view (default, grouped by department) + List view toggle.
- **Employee Form**: Unified form carrying HR info + Auth/Role provisioning for Admin. Smart buttons (Contracts, Attendance, Time Off, Allocations) with live counter badges.

### Phase 2: Contracts & Working Schedules
- **Working Schedule**: Interactive 7-day pattern table with auto-calculated total weekly hours footer.
- **Contract Management**: Status badges (`Running` vs `Expired`). Enforce rule: *Only 1 Running contract per employee per period*.

### Phase 3: Attendance Flow
- **Quick Attendance Widget**: Floating top-nav widget with live check-in/out toggle, elapsed hours counter, and status indicator.
- **Attendance Records**: List view showing worked hours, overtime, and manual edit audit indicators.

### Phase 4: Time Off Flow
- **Unified Sub-Navigation**: All sub-views (`Dashboard`, `Requests`, `Allocations`, `Time Off Types`) reside exclusively inside the `Time Off ▾` menu.
- **Balance Math**: Real-time tracking of `Allocated`, `Taken`, `Remaining`. Requests consume balance upon approval.

### Phase 5 & 6: Payroll & Payslips
- **2-Step Payrun Creation Wizard**: 
  1. Scope selection (Pay Structure, Period Start/End) — *does not persist record*.
  2. Employee selection table → *persists Payrun upon confirmation*.
- **Payrun Action Toolbar**: `COMPUTE` → `VALIDATE` → `MARK PAID` → `SEND PAYSLIPS`.
- **Payslip Computation View**: Ordered Salary Rule chain execution table (Basic, Allowances, Gross, Deductions, Net) with warning indicators (e.g., missing bank account).

### Payroll Dashboard (Aggregate Analytics)
- **Filters**: Period, Department, Employee Type, Company.
- **Live Aggregations**: Compute real statistics from Employees, Contracts, Attendance, Time Off, and Payslips.

---

## 5. UI Polish & Aesthetics Checkpoints
- [x] CSS Custom Properties in `globals.css` for consistent dark/light thematic variables.
- [x] Responsive layout with collapsible sidebar and mobile drawer.
- [x] Form validation feedback with error micro-badges.
- [x] Skeleton loaders for table rows and card metrics during async hook fetching.

---

## 6. Mobile-First Responsiveness & Adaptive UI Rules 📱💻

1. **Responsive App Shell & Navigation**:
   - **Sidebar**: Must function as a fixed, left-side sticky bar (`w-64`) on desktop screens (`lg:static lg:translate-x-0`) and convert automatically to a slide-over mobile drawer on smaller viewports (`< 1024px`) with a dark backdrop overlay (`bg-slate-900/60 backdrop-blur-xs`) and close trigger.
   - **Header Bar**: Features a visible hamburger toggle button (`Menu` icon) on screens `< 1024px` (`lg:hidden`). Search inputs and user profile meta gracefully scale or collapse into icon popovers on mobile screens.

2. **Adaptive Grid & Card Systems**:
   - **Kanban & Card Grids**: Use progressive breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6`. Cards must stack vertically on mobile without horizontal clipping.
   - **Form Grids**: Multi-column form layouts inside modals or cards must default to `grid-cols-1` on mobile and expand to `sm:grid-cols-2` or `md:grid-cols-2` on larger screens.

3. **Data Tables & Pagination**:
   - **AG Grid / Data Tables**: Always wrap tables in overflow containers (`overflow-x-auto custom-scrollbar`) to enable horizontal scrolling on small screens without breaking page layouts.
   - **Pagination Bars**: Must use responsive flex layout (`flex-col sm:flex-row items-center justify-between gap-3`), stacking row size selectors and page navigation controls on mobile.

4. **Modal Dialog Constraints**:
   - **Viewport Bounds**: Modals must be capped at `max-h-[90vh]` with internal body `overflow-y-auto custom-scrollbar` and responsive outer margins (`p-4 md:p-6`).
   - **Form Actions**: Modal footers must stack action buttons appropriately on mobile viewports (`flex-col-reverse sm:flex-row gap-3`).

5. **Touch Targets & Fluid Typography**:
   - **Interactive Elements**: All buttons, select menus, inputs, and icon triggers must satisfy a minimum touch height of `44px` (`py-2.5` to `py-3`) for mobile usability.
   - **Typography**: Fluid font sizing from `text-xs` for micro badges to `text-base` for standard inputs and `text-xl`/`text-2xl` for page headers.

