'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useEmployees } from '@/hooks/useEmployees';
import { ROLES, ROLE_LABELS, canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import EmployeeKanban from '@/components/employees/EmployeeKanban';
import EmployeeList from '@/components/employees/EmployeeList';
import EmployeeFormModal from '@/components/employees/EmployeeFormModal';
import { SkeletonKanban, SkeletonTable } from '@/components/ui/Skeleton';
import {
  Users,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export default function EmployeesPage() {
  const { role, employeeId: currentUserId } = useAuthSession();
  const {
    employees,
    totalCount,
    loading,
    options,
    fetchEmployees,
    fetchOptions,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  // Mobile Sidebar Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // View state: 'kanban' | 'list'
  const [viewMode, setViewMode] = useState('kanban');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Track initial options load
  const hasLoadedOptions = useRef(false);

  // Load employee list once when viewMode or pagination parameters change
  useEffect(() => {
    if (viewMode === 'kanban') {
      fetchEmployees({ startRow: 0, endRow: 500 });
    } else {
      const startRow = (page - 1) * pageSize;
      const endRow = page * pageSize;
      fetchEmployees({ startRow, endRow });
    }
  }, [viewMode, page, pageSize, fetchEmployees]);

  // Load manager picker options ONCE on mount
  useEffect(() => {
    if (!hasLoadedOptions.current) {
      hasLoadedOptions.current = true;
      fetchOptions();
    }
  }, [fetchOptions]);

  // Filtered Employees (for client search/role overlay)
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenCreate = () => {
    setSelectedEmployeeId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (id) => {
    setSelectedEmployeeId(id);
    setModalOpen(true);
  };

  // Called when a user is added, updated, or deleted
  const handleSuccessRefetch = () => {
    if (viewMode === 'kanban') {
      fetchEmployees({ startRow: 0, endRow: 500 });
    } else {
      setPage(1);
      fetchEmployees({ startRow: 0, endRow: pageSize });
    }
    fetchOptions();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex relative overflow-x-hidden">
      {/* App Sidebar with Mobile Support */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace (offset by lg:pl-64 for fixed sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 pt-24 px-4 sm:px-6 pb-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Top Page Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                <Users className="w-6 h-6 text-indigo-600" />
                <span>Employees & Access</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Browse personnel directory, manage department assignments, and configure security roles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSuccessRefetch}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
                title="Refresh list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* View Mode Switcher */}
              <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-xs">
                <button
                  onClick={() => {
                    setViewMode('kanban');
                    setPage(1);
                  }}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Kanban</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('list');
                    setPage(1);
                  }}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">List</span>
                </button>
              </div>

              {/* "+ New Employee" Button (Admin & HR Manager) */}
              {canPerformAction(role, 'employees', 'create') && (
                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Employee</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or department..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {role === ROLES.ADMIN && (
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                    <Filter className="w-4 h-4" />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-800 hover:border-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none cursor-pointer"
                  >
                    <option value="">All Roles (Filter)</option>
                    {Object.keys(ROLES).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]} ({r})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              )}

              <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
                Showing <span className="text-indigo-600 font-extrabold">{filteredEmployees.length}</span> of {totalCount || filteredEmployees.length} records
              </span>
            </div>
          </div>

          {/* Main Content Views with Skeleton Loading */}
          {loading && employees.length === 0 ? (
            viewMode === 'kanban' ? <SkeletonKanban /> : <SkeletonTable />
          ) : viewMode === 'kanban' ? (
            <EmployeeKanban
              employees={filteredEmployees}
              loading={loading}
              onEmployeeClick={handleOpenEdit}
            />
          ) : (
            <EmployeeList
              employees={filteredEmployees}
              loading={loading}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              onEmployeeClick={handleOpenEdit}
            />
          )}
        </main>
      </div>

      {/* Employee Form Modal */}
      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeId={selectedEmployeeId}
        fetchEmployeeById={fetchEmployeeById}
        createEmployee={createEmployee}
        updateEmployee={updateEmployee}
        deleteEmployee={deleteEmployee}
        managerOptions={options}
        currentUserRole={role}
        currentUserId={currentUserId}
        onSuccess={handleSuccessRefetch}
      />
    </div>
  );
}
